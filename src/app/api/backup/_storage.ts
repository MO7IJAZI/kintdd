import os from "os";
import path from "path";

export function getBackupBaseDir() {
    const fromEnv = process.env.BACKUP_STORAGE_DIR;
    if (fromEnv && fromEnv.trim()) return fromEnv.trim();
    if (process.env.NODE_ENV === "production") return path.join(process.cwd(), "backups");
    return path.join(os.tmpdir(), "kint-backups");
}

