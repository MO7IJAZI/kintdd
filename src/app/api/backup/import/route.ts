import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { spawn } from "child_process";
import fs from "fs";
import fsPromises from "fs/promises";
import os from "os";
import path from "path";
import yauzl from "yauzl";
import { cleanupOldBackupJobs, createBackupJob, failBackupJob, finishBackupJob, updateBackupJob } from "../_jobs";
import { getBackupBaseDir } from "../_storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function assertSafeIdentifier(value: string, kind: "table" | "column") {
    if (!/^[A-Za-z0-9_]+$/.test(value)) {
        throw new Error(`Unsafe ${kind} identifier: ${value}`);
    }
}

function rawIdentifier(value: string, kind: "table" | "column") {
    assertSafeIdentifier(value, kind);
    return Prisma.raw(`\`${value}\``);
}

function chunkArray<T>(items: T[], size: number) {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
}

async function restoreDatabaseFromJson(jobId: string, dbJson: unknown) {
    if (!dbJson || typeof dbJson !== "object") throw new Error("Invalid db.json");
    const tables = (dbJson as any).tables as Record<string, unknown[]>;
    if (!tables || typeof tables !== "object") throw new Error("Invalid db.json tables");

    const tableNames = Object.keys(tables)
        .filter((t) => t && t !== "_prisma_migrations")
        .sort();

    const totalRows = tableNames.reduce((acc, t) => acc + (Array.isArray(tables[t]) ? tables[t].length : 0), 0);
    let processedRows = 0;

    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    try {
        for (let i = 0; i < tableNames.length; i++) {
            const table = tableNames[i];
            assertSafeIdentifier(table, "table");
            updateBackupJob(jobId, {
                stage: "RESTORING_DB",
                percent: 40 + Math.min(5, Math.round(((i + 1) / Math.max(1, tableNames.length)) * 5)),
                message: `TRUNCATE:${table}`,
            });
            await prisma.$executeRaw(Prisma.sql`TRUNCATE TABLE ${rawIdentifier(table, "table")}`);
        }

        for (const table of tableNames) {
            const rows = tables[table];
            if (!Array.isArray(rows) || rows.length === 0) continue;

            const first = rows[0];
            if (!first || typeof first !== "object") continue;

            const columns = Object.keys(first as Record<string, unknown>);
            if (columns.length === 0) continue;
            for (const col of columns) assertSafeIdentifier(col, "column");

            const columnSql = Prisma.join(
                columns.map((c) => rawIdentifier(c, "column")),
                ", "
            );

            const rowChunks = chunkArray(rows as Record<string, unknown>[], 500);
            for (const chunk of rowChunks) {
                const valuesSql = Prisma.join(
                    chunk.map((row) => {
                        const values = columns.map((c) => (c in row ? (row as any)[c] : null));
                        return Prisma.sql`(${Prisma.join(values, ", ")})`;
                    }),
                    ", "
                );

                await prisma.$executeRaw(
                    Prisma.sql`INSERT INTO ${rawIdentifier(table, "table")} (${columnSql}) VALUES ${valuesSql}`
                );

                processedRows += chunk.length;
                const ratio = totalRows > 0 ? processedRows / totalRows : 1;
                updateBackupJob(jobId, {
                    stage: "RESTORING_DB",
                    percent: 45 + Math.min(40, Math.round(ratio * 40)),
                    message: table,
                });
            }
        }
    } finally {
        await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
    }

    return { tables: tableNames.length };
}

function safeZipPath(raw: string) {
    const entryPath = String(raw).replace(/\\/g, "/");
    const normalized = path.posix.normalize(entryPath);
    if (!normalized || normalized === ".") return null;
    if (normalized.startsWith("/") || normalized.startsWith("..") || normalized.includes("../")) return null;
    return normalized;
}

function isRetryableFsError(e: any) {
    const code = e?.code;
    return code === "EPERM" || code === "EBUSY" || code === "ENOTEMPTY" || code === "EACCES";
}

async function sleep(ms: number) {
    await new Promise((r) => setTimeout(r, ms));
}

async function withRetries<T>(fn: () => Promise<T>, attempts: number) {
    let delayMs = 120;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === attempts - 1 || !isRetryableFsError(e)) throw e;
            await sleep(delayMs);
            delayMs = Math.min(1500, Math.round(delayMs * 1.6));
        }
    }
    throw new Error("Retry failed");
}

async function clearDirectory(dir: string) {
    await fsPromises.mkdir(dir, { recursive: true });
    const entries = await fsPromises.readdir(dir).catch(() => []);
    for (const name of entries) {
        const target = path.join(dir, name);
        await withRetries(() => fsPromises.rm(target, { recursive: true, force: true }), 8);
    }
}

async function openZip(zipPath: string): Promise<yauzl.ZipFile> {
    return await new Promise((resolve, reject) => {
        yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
            if (err || !zipfile) return reject(err || new Error("Failed to open zip"));
            resolve(zipfile);
        });
    });
}

async function scanZipTotals(zipPath: string) {
    const zip = await openZip(zipPath);
    let totalBytes = 0;
    let hasDb = false;
    let hasPublic = false;

    const finished = new Promise<void>((resolve, reject) => {
        zip.on("end", () => resolve());
        zip.on("error", reject);
    });

    zip.readEntry();
    zip.on("entry", (entry) => {
        const p = safeZipPath(entry.fileName);
        if (!p) {
            zip.readEntry();
            return;
        }
        if (p === "db.json") hasDb = true;
        if (p === "public" || p.startsWith("public/")) hasPublic = true;
        if (!p.endsWith("/")) totalBytes += entry.uncompressedSize || 0;
        zip.readEntry();
    });

    await finished;
    zip.close();
    return { totalBytes, hasDb, hasPublic };
}

async function extractZipToTemp(jobId: string, zipPath: string, tempRoot: string, totalBytes: number) {
    const zip = await openZip(zipPath);
    let processed = 0;

    const finished = new Promise<void>((resolve, reject) => {
        zip.on("end", () => resolve());
        zip.on("error", reject);
    });

    zip.readEntry();
    zip.on("entry", (entry) => {
        const normalized = safeZipPath(entry.fileName);
        if (!normalized) {
            zip.readEntry();
            return;
        }
        if (normalized.endsWith("/")) {
            zip.readEntry();
            return;
        }

        const targetPath = path.join(tempRoot, normalized);
        fsPromises
            .mkdir(path.dirname(targetPath), { recursive: true })
            .then(
                () =>
                    new Promise<void>((resolve, reject) => {
                        zip.openReadStream(entry, (err, readStream) => {
                            if (err || !readStream) return reject(err || new Error("Failed to open entry stream"));
                            const out = fs.createWriteStream(targetPath);
                            readStream.on("data", (buf) => {
                                processed += (buf as Buffer).length;
                                const ratio = totalBytes > 0 ? processed / totalBytes : 0;
                                updateBackupJob(jobId, {
                                    stage: "EXTRACTING",
                                    percent: Math.min(40, Math.max(1, Math.round(ratio * 40))),
                                    message: normalized,
                                });
                            });
                            readStream.on("error", reject);
                            out.on("error", reject);
                            out.on("close", () => resolve());
                            readStream.pipe(out);
                        });
                    })
            )
            .then(() => zip.readEntry())
            .catch(() => {
                zip.close();
            });
    });

    await finished;
    zip.close();
}

async function replacePublicFolder(jobId: string, extractedPublicDir: string) {
    const cwd = process.cwd();
    const currentPublic = path.join(cwd, "public");
    const newPublic = path.join(cwd, `public.__restoring__${jobId}`);
    const oldPublic = path.join(cwd, `public.__old__${jobId}`);

    updateBackupJob(jobId, { stage: "REPLACING_FILES", percent: 86 });

    await withRetries(() => fsPromises.rm(newPublic, { recursive: true, force: true }), 6);
    await withRetries(() => fsPromises.rm(oldPublic, { recursive: true, force: true }), 6);

    await withRetries(() => fsPromises.cp(extractedPublicDir, newPublic, { recursive: true }), 6);

    updateBackupJob(jobId, { stage: "REPLACING_FILES", percent: 94 });

    const preferInPlace = process.platform === "win32";

    const tryAtomicSwap = async () => {
        if (fs.existsSync(currentPublic)) {
            await withRetries(() => fsPromises.rename(currentPublic, oldPublic), 10);
        }
        await withRetries(() => fsPromises.rename(newPublic, currentPublic), 10);
        await withRetries(() => fsPromises.rm(oldPublic, { recursive: true, force: true }), 6);
    };

    const computeDirSize = async (dir: string): Promise<number> => {
        let total = 0;
        const entries = await fsPromises.readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const ent of entries) {
            const p = path.join(dir, ent.name);
            if (ent.isDirectory()) total += await computeDirSize(p);
            else if (ent.isFile()) {
                const st = await fsPromises.stat(p).catch(() => null);
                total += st?.size ? Number(st.size) : 0;
            }
        }
        return total;
    };

    const collectRelativePaths = async (dir: string, base: string, out: Set<string>) => {
        const entries = await fsPromises.readdir(dir, { withFileTypes: true }).catch(() => []);
        for (const ent of entries) {
            const abs = path.join(dir, ent.name);
            const rel = path.relative(base, abs).split(path.sep).join("/");
            if (ent.isDirectory()) {
                out.add(`${rel}/`);
                await collectRelativePaths(abs, base, out);
            } else {
                out.add(rel);
            }
        }
    };

    const syncPublicInPlace = async () => {
        updateBackupJob(jobId, { stage: "REPLACING_FILES", percent: 88, message: "IN_PLACE_SYNC" });
        await fsPromises.mkdir(currentPublic, { recursive: true });

        const totalBytes = await computeDirSize(extractedPublicDir);
        let copied = 0;

        const copyRecursive = async (srcDir: string) => {
            const entries = await fsPromises.readdir(srcDir, { withFileTypes: true }).catch(() => []);
            for (const ent of entries) {
                const srcAbs = path.join(srcDir, ent.name);
                const rel = path.relative(extractedPublicDir, srcAbs);
                const dstAbs = path.join(currentPublic, rel);

                if (ent.isDirectory()) {
                    await fsPromises.mkdir(dstAbs, { recursive: true });
                    await copyRecursive(srcAbs);
                } else if (ent.isFile()) {
                    await fsPromises.mkdir(path.dirname(dstAbs), { recursive: true });
                    const st = await fsPromises.stat(srcAbs).catch(() => null);
                    const size = st?.size ? Number(st.size) : 0;
                    await withRetries(() => fsPromises.copyFile(srcAbs, dstAbs), 10);
                    copied += size;
                    const ratio = totalBytes > 0 ? copied / totalBytes : 1;
                    updateBackupJob(jobId, {
                        stage: "REPLACING_FILES",
                        percent: 88 + Math.min(11, Math.round(ratio * 11)),
                        message: rel.split(path.sep).join("/"),
                    });
                }
            }
        };

        await copyRecursive(extractedPublicDir);

        const wanted = new Set<string>();
        await collectRelativePaths(extractedPublicDir, extractedPublicDir, wanted);

        const current = new Set<string>();
        await collectRelativePaths(currentPublic, currentPublic, current);

        const extra = Array.from(current).filter((p) => !wanted.has(p));
        let removed = 0;
        for (const rel of extra) {
            const abs = path.join(currentPublic, rel.split("/").join(path.sep));
            try {
                await withRetries(() => fsPromises.rm(abs, { recursive: true, force: true }), 6);
                removed += 1;
            } catch {}
            if (removed % 50 === 0) {
                updateBackupJob(jobId, { stage: "REPLACING_FILES", percent: 99, message: "CLEANING_EXTRA" });
            }
        }
    };

    try {
        if (!preferInPlace) {
            await tryAtomicSwap();
            return;
        }
    } catch (e) {
        if (!preferInPlace) throw e;
    }

    updateBackupJob(jobId, { stage: "REPLACING_FILES", percent: 94, message: "WINDOWS_IN_PLACE" });
    await fsPromises.rm(newPublic, { recursive: true, force: true }).catch(() => {});
    await fsPromises.rm(oldPublic, { recursive: true, force: true }).catch(() => {});
    await syncPublicInPlace();
}

async function runImport(jobId: string, zipPath: string) {
    const tempRoot = await fsPromises.mkdtemp(path.join(os.tmpdir(), `kint-import-${jobId}-`));
    try {
        updateBackupJob(jobId, { stage: "EXTRACTING", percent: 1 });
        const scan = await scanZipTotals(zipPath);
        if (!scan.hasDb) throw new Error("db.json is missing in the backup ZIP");
        if (!scan.hasPublic) throw new Error("public/ is missing in the backup ZIP");

        await extractZipToTemp(jobId, zipPath, tempRoot, scan.totalBytes);

        updateBackupJob(jobId, { stage: "RESTORING_DB", percent: 41 });
        const dbRaw = await fsPromises.readFile(path.join(tempRoot, "db.json"), "utf-8");
        const dbJson = JSON.parse(dbRaw) as unknown;
        await restoreDatabaseFromJson(jobId, dbJson);

        const extractedPublicDir = path.join(tempRoot, "public");
        const st = await fsPromises.stat(extractedPublicDir).catch(() => null);
        if (!st || !st.isDirectory()) throw new Error("public/ folder was not extracted correctly");

        await replacePublicFolder(jobId, extractedPublicDir);

        updateBackupJob(jobId, { stage: "CLEANUP", percent: 99 });
        finishBackupJob(jobId);
    } catch (e) {
        failBackupJob(jobId, e);
    } finally {
        await fsPromises.rm(tempRoot, { recursive: true, force: true });
        await fsPromises.rm(zipPath, { force: true }).catch(() => {});
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    cleanupOldBackupJobs(1000 * 60 * 60);

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "Missing file" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    const job = createBackupJob("import", { stage: "UPLOADING", percent: 0 });
    const zipPath = path.join(getBackupBaseDir(), "imports", `${job.id}.zip`);
    await fsPromises.mkdir(path.dirname(zipPath), { recursive: true });

    updateBackupJob(job.id, { stage: "UPLOADING", percent: 1, importZipPath: zipPath });
    const zipBuffer = Buffer.from(await file.arrayBuffer());
    await fsPromises.writeFile(zipPath, zipBuffer);
    updateBackupJob(job.id, { stage: "QUEUED", percent: 1 });

    try {
        const scriptPath = path.join(process.cwd(), "scripts", "backup-import-worker.cjs");
        const child = spawn(process.execPath, [scriptPath, job.id, zipPath], {
            detached: true,
            stdio: "ignore",
            env: process.env,
        });
        child.unref();
    } catch (e) {
        failBackupJob(job.id, e);
    }

    return new Response(JSON.stringify({ jobId: job.id }), { headers: { "content-type": "application/json" } });
}
