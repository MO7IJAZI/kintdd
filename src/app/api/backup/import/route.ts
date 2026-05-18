import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { unzipSync } from "fflate";
import fs from "fs/promises";
import os from "os";
import path from "path";

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

async function safeExtractZipToTemp(zipBuffer: Buffer) {
    const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "kint-backup-"));
    const entries = unzipSync(new Uint8Array(zipBuffer)) as Record<string, Uint8Array>;
    for (const [rawPath, data] of Object.entries(entries)) {
        const entryPath = String(rawPath).replace(/\\/g, "/");
        if (!entryPath) continue;
        if (entryPath.endsWith("/")) continue;

        const normalized = path.posix.normalize(entryPath);
        if (normalized.startsWith("/") || normalized.startsWith("..") || normalized.includes("../")) continue;

        const targetPath = path.join(tempRoot, normalized);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        await fs.writeFile(targetPath, Buffer.from(data));
    }

    return tempRoot;
}

async function restoreDatabaseFromJson(dbJson: unknown) {
    if (!dbJson || typeof dbJson !== "object") throw new Error("Invalid db.json");
    const tables = (dbJson as any).tables as Record<string, unknown[]>;
    if (!tables || typeof tables !== "object") throw new Error("Invalid db.json tables");

    const tableNames = Object.keys(tables)
        .filter((t) => t && t !== "_prisma_migrations")
        .sort();

    await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");
    try {
        for (const table of tableNames) {
            assertSafeIdentifier(table, "table");
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
            }
        }
    } finally {
        await prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
    }

    return { tables: tableNames.length };
}

async function restoreFolder(tempRoot: string, relativeSource: string, targetAbsolute: string) {
    const sourcePath = path.join(tempRoot, relativeSource);
    try {
        const stat = await fs.stat(sourcePath);
        if (!stat.isDirectory()) return false;
    } catch {
        return false;
    }

    await fs.rm(targetAbsolute, { recursive: true, force: true });
    await fs.mkdir(path.dirname(targetAbsolute), { recursive: true });
    await fs.cp(sourcePath, targetAbsolute, { recursive: true });
    return true;
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "Missing file" }), {
            status: 400,
            headers: { "content-type": "application/json" },
        });
    }

    const zipBuffer = Buffer.from(await file.arrayBuffer());
    const tempRoot = await safeExtractZipToTemp(zipBuffer);

    try {
        const dbPath = path.join(tempRoot, "db.json");
        const dbRaw = await fs.readFile(dbPath, "utf-8");
        const dbJson = JSON.parse(dbRaw) as unknown;

        const dbResult = await restoreDatabaseFromJson(dbJson);

        const publicDir = path.join(process.cwd(), "public");
        const restoredUploads = await restoreFolder(tempRoot, path.join("public", "uploads"), path.join(publicDir, "uploads"));
        const restoredDocuments = await restoreFolder(
            tempRoot,
            path.join("public", "documents"),
            path.join(publicDir, "documents")
        );
        const restoredFonts = await restoreFolder(tempRoot, path.join("public", "fonts"), path.join(publicDir, "fonts"));

        return new Response(
            JSON.stringify({
                ok: true,
                db: dbResult,
                files: {
                    uploads: restoredUploads,
                    documents: restoredDocuments,
                    fonts: restoredFonts,
                },
            }),
            { headers: { "content-type": "application/json" } }
        );
    } finally {
        await fs.rm(tempRoot, { recursive: true, force: true });
    }
}
