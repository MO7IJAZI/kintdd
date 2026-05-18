require("dotenv/config");

const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const yauzl = require("yauzl");
const mysql = require("mysql2/promise");
const { spawn } = require("child_process");

function getBackupBaseDir(cwd) {
  const fromEnv = process.env.BACKUP_STORAGE_DIR;
  if (fromEnv && String(fromEnv).trim()) return String(fromEnv).trim();
  if (process.env.NODE_ENV === "production") return path.join(cwd, "backups");
  return path.join(os.tmpdir(), "kint-backups");
}

function jobsDir(cwd) {
  return path.join(getBackupBaseDir(cwd), "jobs");
}

function jobFilePath(cwd, id) {
  return path.join(jobsDir(cwd), `${id}.json`);
}

const writeLocks = new Map();

async function withWriteLock(id, fn) {
  const prev = writeLocks.get(id) || Promise.resolve();
  let out;
  const next = prev
    .catch(() => {})
    .then(async () => {
      out = await fn();
      return out;
    });
  writeLocks.set(
    id,
    next.finally(() => {
      if (writeLocks.get(id) === next) writeLocks.delete(id);
    })
  );
  await next;
  return out;
}

async function readJob(cwd, id) {
  const p = jobFilePath(cwd, id);
  for (let i = 0; i < 6; i++) {
    const raw = await fsp.readFile(p, "utf-8");
    try {
      return JSON.parse(raw);
    } catch (e) {
      if (i === 5) throw e;
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  throw new Error("Failed to read job");
}

async function writeJob(cwd, job) {
  await fsp.mkdir(jobsDir(cwd), { recursive: true });
  const finalPath = jobFilePath(cwd, job.id);
  const tmpPath = `${finalPath}.${process.pid}.tmp`;
  await fsp.writeFile(tmpPath, JSON.stringify(job), "utf-8");
  await fsp.rename(tmpPath, finalPath);
}

async function patchJob(cwd, id, patch) {
  return await withWriteLock(id, async () => {
    const job = await readJob(cwd, id);
    const next = { ...job, ...patch, updatedAt: new Date().toISOString() };
    await writeJob(cwd, next);
    return next;
  });
}

function safeZipPath(raw) {
  const entryPath = String(raw).replace(/\\/g, "/");
  const normalized = path.posix.normalize(entryPath);
  if (!normalized || normalized === ".") return null;
  if (normalized.startsWith("/") || normalized.startsWith("..") || normalized.includes("../")) return null;
  return normalized;
}

function openZip(zipPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err || !zipfile) return reject(err || new Error("Failed to open zip"));
      resolve(zipfile);
    });
  });
}

async function scanZipTotals(zipPath) {
  const zip = await openZip(zipPath);
  let totalBytes = 0;
  let hasDb = false;
  let hasPublic = false;

  const finished = new Promise((resolve, reject) => {
    zip.on("end", resolve);
    zip.on("error", reject);
  });

  zip.readEntry();
  zip.on("entry", (entry) => {
    const p = safeZipPath(entry.fileName);
    if (p) {
      if (p === "db.json") hasDb = true;
      if (p === "public" || p.startsWith("public/")) hasPublic = true;
      if (!p.endsWith("/")) totalBytes += entry.uncompressedSize || 0;
    }
    zip.readEntry();
  });

  await finished;
  zip.close();
  return { totalBytes, hasDb, hasPublic };
}

async function extractZipToTemp(cwd, jobId, zipPath, tempRoot, totalBytes) {
  const zip = await openZip(zipPath);
  let processed = 0;
  let lastUpdate = 0;

  const finished = new Promise((resolve, reject) => {
    zip.on("end", resolve);
    zip.on("error", reject);
  });

  zip.readEntry();
  zip.on("entry", (entry) => {
    const normalized = safeZipPath(entry.fileName);
    if (!normalized || normalized.endsWith("/")) {
      zip.readEntry();
      return;
    }

    const targetPath = path.join(tempRoot, normalized);
    fsp
      .mkdir(path.dirname(targetPath), { recursive: true })
      .then(
        () =>
          new Promise((resolve, reject) => {
            zip.openReadStream(entry, (err, readStream) => {
              if (err || !readStream) return reject(err || new Error("Failed to open entry stream"));
              const out = fs.createWriteStream(targetPath);
              readStream.on("data", async (buf) => {
                processed += buf.length;
                const now = Date.now();
                if (now - lastUpdate >= 200) {
                  lastUpdate = now;
                  const ratio = totalBytes > 0 ? processed / totalBytes : 0;
                  await patchJob(cwd, jobId, {
                    stage: "EXTRACTING",
                    percent: Math.min(40, Math.max(1, Math.round(ratio * 40))),
                    message: normalized,
                  });
                }
              });
              readStream.on("error", reject);
              out.on("error", reject);
              out.on("close", resolve);
              readStream.pipe(out);
            });
          })
      )
      .then(() => zip.readEntry())
      .catch(() => zip.close());
  });

  await finished;
  zip.close();
}

function parseMysqlUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
    multipleStatements: true,
  };
}

async function prepareSchemaForRestore(cwd, jobId) {
  const prismaCli = path.join(cwd, "node_modules", "prisma", "build", "index.js");
  const bin = fs.existsSync(prismaCli)
    ? process.execPath
    : path.join(cwd, "node_modules", ".bin", process.platform === "win32" ? "prisma.cmd" : "prisma");
  const baseArgs = fs.existsSync(prismaCli) ? [prismaCli] : [];

  const runPrisma = async (subArgs, label) => {
    await patchJob(cwd, jobId, { stage: "MIGRATING", percent: 34, message: label });
    await new Promise((resolve, reject) => {
      const child = spawn(bin, [...baseArgs, ...subArgs], {
        cwd,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      });
      let stderr = "";
      child.stderr.on("data", (d) => {
        stderr += String(d);
        if (stderr.length > 12000) stderr = stderr.slice(-12000);
      });
      child.on("error", reject);
      child.on("exit", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`${label} failed (code ${code})${stderr ? `: ${stderr}` : ""}`));
      });
    });
  };

  await runPrisma(["migrate", "reset", "--force", "--skip-seed", "--schema=prisma/schema.prisma"], "prisma migrate reset");
  await patchJob(cwd, jobId, { stage: "MIGRATING", percent: 38, message: "schema reset" });

  const ensureCoreTablesExist = async () => {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is missing");
    const conn = await mysql.createConnection(parseMysqlUrl(dbUrl));
    try {
      const required = ["blog_posts", "settings", "categories"];
      const [rows] = await conn.query(
        `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN (${required
          .map(() => "?")
          .join(",")})`,
        required
      );
      const found = new Set((rows || []).map((r) => r.name));
      const missing = required.filter((t) => !found.has(t));
      return missing;
    } finally {
      await conn.end();
    }
  };

  let missing = await ensureCoreTablesExist();
  if (missing.length > 0) {
    await patchJob(cwd, jobId, { stage: "MIGRATING", percent: 38, message: `missing:${missing.join(",")}` });
    await runPrisma(["db", "push", "--accept-data-loss", "--schema=prisma/schema.prisma"], "prisma db push");
    missing = await ensureCoreTablesExist();
    if (missing.length > 0) {
      throw new Error(`Database schema is not ready. Missing tables: ${missing.join(", ")}`);
    }
  }

  await patchJob(cwd, jobId, { stage: "MIGRATING", percent: 39, message: "schema ready" });
}

function assertSafeIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) throw new Error(`Unsafe identifier: ${value}`);
}

function normalizeValue(v) {
  if (v === null || v === undefined) return null;
  if (Buffer.isBuffer(v)) return v;
  if (typeof v === "object") return JSON.stringify(v);
  return v;
}

async function restoreDatabaseFromJson(cwd, jobId, dbJson) {
  if (!dbJson || typeof dbJson !== "object") throw new Error("Invalid db.json");
  const tables = dbJson.tables;
  if (!tables || typeof tables !== "object") throw new Error("Invalid db.json tables");

  const tableNames = Object.keys(tables)
    .filter((t) => t && t !== "_prisma_migrations")
    .sort();

  const totalRows = tableNames.reduce((acc, t) => acc + (Array.isArray(tables[t]) ? tables[t].length : 0), 0);
  let processedRows = 0;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is missing");
  const conn = await mysql.createConnection(parseMysqlUrl(dbUrl));

  await conn.query("SET FOREIGN_KEY_CHECKS = 0");
  try {
    for (let i = 0; i < tableNames.length; i++) {
      const table = tableNames[i];
      assertSafeIdentifier(table);
      await patchJob(cwd, jobId, {
        stage: "RESTORING_DB",
        percent: 40 + Math.min(5, Math.round(((i + 1) / Math.max(1, tableNames.length)) * 5)),
        message: `TRUNCATE:${table}`,
      });
      await conn.query(`TRUNCATE TABLE \`${table}\``);
    }

    for (const table of tableNames) {
      const rows = tables[table];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      const columns = Object.keys(rows[0] || {});
      for (const c of columns) assertSafeIdentifier(c);

      const colSql = columns.map((c) => `\`${c}\``).join(",");
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const values = chunk.map((r) => columns.map((c) => normalizeValue(r[c])));

        const placeholders = values
          .map((row) => `(${row.map(() => "?").join(",")})`)
          .join(",");
        const flat = values.flat();

        await conn.query(`INSERT INTO \`${table}\` (${colSql}) VALUES ${placeholders}`, flat);

        processedRows += chunk.length;
        const ratio = totalRows > 0 ? processedRows / totalRows : 1;
        await patchJob(cwd, jobId, {
          stage: "RESTORING_DB",
          percent: 45 + Math.min(40, Math.round(ratio * 40)),
          message: table,
        });
      }
    }
  } finally {
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");
    await conn.end();
  }
}

async function computeDirSize(dir) {
  let total = 0;
  const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) total += await computeDirSize(p);
    else if (ent.isFile()) {
      const st = await fsp.stat(p).catch(() => null);
      total += st && st.size ? Number(st.size) : 0;
    }
  }
  return total;
}

async function collectRelativePaths(dir, base, out) {
  const entries = await fsp.readdir(dir, { withFileTypes: true }).catch(() => []);
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
}

async function syncPublicInPlace(cwd, jobId, extractedPublicDir) {
  const currentPublic = path.join(cwd, "public");
  await fsp.mkdir(currentPublic, { recursive: true });

  const totalBytes = await computeDirSize(extractedPublicDir);
  let copied = 0;

  const copyRecursive = async (srcDir) => {
    const entries = await fsp.readdir(srcDir, { withFileTypes: true }).catch(() => []);
    for (const ent of entries) {
      const srcAbs = path.join(srcDir, ent.name);
      const rel = path.relative(extractedPublicDir, srcAbs);
      const dstAbs = path.join(currentPublic, rel);

      if (ent.isDirectory()) {
        await fsp.mkdir(dstAbs, { recursive: true });
        await copyRecursive(srcAbs);
      } else if (ent.isFile()) {
        await fsp.mkdir(path.dirname(dstAbs), { recursive: true });
        const st = await fsp.stat(srcAbs).catch(() => null);
        const size = st && st.size ? Number(st.size) : 0;
        await fsp.copyFile(srcAbs, dstAbs);
        copied += size;
        const ratio = totalBytes > 0 ? copied / totalBytes : 1;
        await patchJob(cwd, jobId, {
          stage: "REPLACING_FILES",
          percent: 88 + Math.min(11, Math.round(ratio * 11)),
          message: rel.split(path.sep).join("/"),
        });
      }
    }
  };

  await copyRecursive(extractedPublicDir);

  const wanted = new Set();
  await collectRelativePaths(extractedPublicDir, extractedPublicDir, wanted);

  const current = new Set();
  await collectRelativePaths(currentPublic, currentPublic, current);

  const extra = Array.from(current).filter((p) => !wanted.has(p));
  for (const rel of extra) {
    const abs = path.join(currentPublic, rel.split("/").join(path.sep));
    await fsp.rm(abs, { recursive: true, force: true }).catch(() => {});
  }
}

async function run() {
  const cwd = process.cwd();
  const jobId = process.argv[2];
  const zipPath = process.argv[3];
  if (!jobId || !zipPath) throw new Error("Missing args");

  const tempRoot = await fsp.mkdtemp(path.join(os.tmpdir(), `kint-import-${jobId}-`));
  try {
    await patchJob(cwd, jobId, { stage: "EXTRACTING", percent: 1 });
    const scan = await scanZipTotals(zipPath);
    if (!scan.hasDb) throw new Error("db.json is missing in the backup ZIP");
    if (!scan.hasPublic) throw new Error("public/ is missing in the backup ZIP");

    await extractZipToTemp(cwd, jobId, zipPath, tempRoot, scan.totalBytes);

    await prepareSchemaForRestore(cwd, jobId);

    await patchJob(cwd, jobId, { stage: "RESTORING_DB", percent: 41 });
    const dbRaw = await fsp.readFile(path.join(tempRoot, "db.json"), "utf-8");
    const dbJson = JSON.parse(dbRaw);
    await restoreDatabaseFromJson(cwd, jobId, dbJson);

    const extractedPublicDir = path.join(tempRoot, "public");
    const st = await fsp.stat(extractedPublicDir).catch(() => null);
    if (!st || !st.isDirectory()) throw new Error("public/ folder was not extracted correctly");

    await patchJob(cwd, jobId, { stage: "REPLACING_FILES", percent: 86 });
    await syncPublicInPlace(cwd, jobId, extractedPublicDir);

    await patchJob(cwd, jobId, { stage: "CLEANUP", percent: 99 });
    await patchJob(cwd, jobId, { status: "done", stage: "DONE", percent: 100 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      await patchJob(cwd, jobId, { status: "error", stage: "ERROR", percent: 100, error: msg });
    } catch {}
  } finally {
    await fsp.rm(tempRoot, { recursive: true, force: true }).catch(() => {});
  }
}

run();
