require("dotenv/config");

const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const archiver = require("archiver");
const mysql = require("mysql2/promise");

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

async function readJob(cwd, id) {
  const raw = await fsp.readFile(jobFilePath(cwd, id), "utf-8");
  return JSON.parse(raw);
}

async function writeJob(cwd, job) {
  await fsp.mkdir(jobsDir(cwd), { recursive: true });
  const finalPath = jobFilePath(cwd, job.id);
  const tmpPath = `${finalPath}.${process.pid}.tmp`;
  await fsp.writeFile(tmpPath, JSON.stringify(job), "utf-8");
  await fsp.rename(tmpPath, finalPath);
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

async function patchJob(cwd, id, patch) {
  return await withWriteLock(id, async () => {
    const job = await readJob(cwd, id);
    const next = { ...job, ...patch, updatedAt: new Date().toISOString() };
    await writeJob(cwd, next);
    return next;
  });
}

function parseMysqlUrl(url) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

function assertSafeIdentifier(value) {
  if (!/^[A-Za-z0-9_]+$/.test(value)) throw new Error(`Unsafe identifier: ${value}`);
}

async function exportDatabase(conn, cwd, jobId) {
  const [tables] = await conn.query(
    "SELECT table_name AS tableName FROM information_schema.tables WHERE table_schema = DATABASE() AND table_type = 'BASE TABLE'"
  );
  const names = tables
    .map((r) => r.tableName)
    .filter((n) => n && n !== "_prisma_migrations")
    .sort();

  const data = {};
  for (let i = 0; i < names.length; i++) {
    const table = names[i];
    assertSafeIdentifier(table);
    await patchJob(cwd, jobId, {
      stage: "PREPARING_DB",
      percent: Math.min(15, Math.round(((i + 1) / Math.max(1, names.length)) * 15)),
      message: table,
    });
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    data[table] = rows;
  }

  return { provider: "mysql", tables: data };
}

async function run() {
  const cwd = process.cwd();
  const jobId = process.argv[2];
  const outPath = process.argv[3];
  const filename = process.argv[4] || "kint-backup.zip";

  if (!jobId || !outPath) throw new Error("Missing args");

  try {
    await patchJob(cwd, jobId, { stage: "PREPARING_DB", percent: 1, filename, exportFilePath: outPath });

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error("DATABASE_URL is missing");
    const conn = await mysql.createConnection(parseMysqlUrl(dbUrl));

    const createdAt = new Date();
    const db = await exportDatabase(conn, cwd, jobId);
    await conn.end();

    const manifest = {
      version: 2,
      createdAt: createdAt.toISOString(),
      type: "kint-full-backup",
      includes: ["manifest.json", "db.json", "public/**"],
    };

    await fsp.mkdir(path.dirname(outPath), { recursive: true });

    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    const done = new Promise((resolve, reject) => {
      output.on("close", resolve);
      output.on("error", reject);
      archive.on("error", reject);
    });

    archive.on("progress", async (p) => {
      const total = p.fs.totalBytes || 0;
      const processed = p.fs.processedBytes || 0;
      const ratio = total > 0 ? processed / total : 0;
      const percent = 15 + Math.round(ratio * 80);
      await patchJob(cwd, jobId, { stage: "ZIPPING", percent: Math.min(95, Math.max(15, percent)) });
    });

    archive.pipe(output);
    archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
    archive.append(JSON.stringify(db), { name: "db.json" });

    const publicDir = path.join(cwd, "public");
    if (fs.existsSync(publicDir)) archive.directory(publicDir, "public");

    await patchJob(cwd, jobId, { stage: "FINALIZING", percent: 96 });
    await archive.finalize();
    await done;

    await patchJob(cwd, jobId, { status: "done", stage: "DONE", percent: 100 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    try {
      await patchJob(cwd, jobId, { status: "error", stage: "ERROR", percent: 100, error: msg });
    } catch {}
  }
}

run();
