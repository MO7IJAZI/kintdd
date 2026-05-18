import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { getBackupBaseDir } from "./_storage";

export type BackupJobType = "export" | "import";

export type BackupJobStage =
    | "QUEUED"
    | "MIGRATING"
    | "PREPARING_DB"
    | "ZIPPING"
    | "FINALIZING"
    | "UPLOADING"
    | "EXTRACTING"
    | "RESTORING_DB"
    | "REPLACING_FILES"
    | "CLEANUP"
    | "DONE"
    | "ERROR";

export type BackupJobStatus = "running" | "done" | "error";

export type BackupJob = {
    id: string;
    type: BackupJobType;
    status: BackupJobStatus;
    stage: BackupJobStage;
    percent: number;
    message?: string;
    filename?: string;
    exportFilePath?: string;
    importZipPath?: string;
    error?: string;
    createdAt: string;
    updatedAt: string;
};

type Store = Map<string, BackupJob>;

function getStore(): Store {
    const g = globalThis as any;
    if (!g.__kintBackupJobs) g.__kintBackupJobs = new Map();
    return g.__kintBackupJobs as Store;
}

function nowIso() {
    return new Date().toISOString();
}

function makeId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function jobsDir() {
    return path.join(getBackupBaseDir(), "jobs");
}

function jobFilePath(id: string) {
    return path.join(jobsDir(), `${id}.json`);
}

async function persistJob(job: BackupJob) {
    try {
        await fsPromises.mkdir(jobsDir(), { recursive: true });
        const finalPath = jobFilePath(job.id);
        const tmpPath = `${finalPath}.${process.pid}.tmp`;
        await fsPromises.writeFile(tmpPath, JSON.stringify(job), "utf-8");
        await fsPromises.rename(tmpPath, finalPath);
    } catch {}
}

export function createBackupJob(type: BackupJobType, init?: Partial<BackupJob>): BackupJob {
    const id = makeId();
    const job: BackupJob = {
        id,
        type,
        status: "running",
        stage: "QUEUED",
        percent: 0,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        ...init,
    };
    getStore().set(id, job);
    void persistJob(job);
    return job;
}

export function getBackupJob(id: string): BackupJob | null {
    try {
        const p = jobFilePath(id);
        if (fs.existsSync(p)) {
            const raw = fs.readFileSync(p, "utf-8");
            const job = JSON.parse(raw) as BackupJob;
            if (job?.id) {
                getStore().set(id, job);
                return job;
            }
        }
    } catch {
        // Ignore and fall back to in-memory job if JSON is temporarily unreadable
    }
    return getStore().get(id) || null;
}

export function updateBackupJob(id: string, patch: Partial<BackupJob>): BackupJob | null {
    const store = getStore();
    const current = store.get(id);
    if (!current) return null;
    const next: BackupJob = { ...current, ...patch, updatedAt: nowIso() };
    store.set(id, next);
    void persistJob(next);
    return next;
}

export function finishBackupJob(id: string, patch?: Partial<BackupJob>) {
    return updateBackupJob(id, { ...(patch || {}), status: "done", stage: "DONE", percent: 100 });
}

export function failBackupJob(id: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return updateBackupJob(id, { status: "error", stage: "ERROR", percent: 100, error: message });
}

export function cleanupOldBackupJobs(maxAgeMs: number) {
    const store = getStore();
    const now = Date.now();
    for (const [id, job] of store.entries()) {
        const t = Date.parse(job.updatedAt || job.createdAt);
        if (!Number.isFinite(t)) continue;
        if (now - t > maxAgeMs) {
            if (job.exportFilePath) void fsPromises.rm(job.exportFilePath, { force: true }).catch(() => {});
            if (job.importZipPath) void fsPromises.rm(job.importZipPath, { force: true }).catch(() => {});
            void fsPromises.rm(jobFilePath(id), { force: true }).catch(() => {});
            store.delete(id);
        }
    }
}
