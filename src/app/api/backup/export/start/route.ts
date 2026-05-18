import { auth } from "@/auth";
import fsPromises from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { cleanupOldBackupJobs, createBackupJob, failBackupJob, finishBackupJob, updateBackupJob } from "../../_jobs";
import { getBackupBaseDir } from "../../_storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toFilenameTimestamp(date: Date) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(
        date.getMinutes()
    )}-${pad(date.getSeconds())}`;
}

export async function POST() {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    cleanupOldBackupJobs(1000 * 60 * 60);

    const createdAt = new Date();
    const filename = `kint-backup-${toFilenameTimestamp(createdAt)}.zip`;
    const job = createBackupJob("export", {
        stage: "QUEUED",
        percent: 0,
        filename,
    });

    const outPath = path.join(getBackupBaseDir(), "exports", `${job.id}.zip`);
    await fsPromises.mkdir(path.dirname(outPath), { recursive: true });
    updateBackupJob(job.id, { stage: "QUEUED", percent: 0, filename, exportFilePath: outPath });

    try {
        const scriptPath = path.join(process.cwd(), "scripts", "backup-export-worker.cjs");
        const child = spawn(process.execPath, [scriptPath, job.id, outPath, filename], {
            detached: true,
            stdio: "ignore",
            env: process.env,
        });
        child.unref();
    } catch (e) {
        failBackupJob(job.id, e);
    }

    return new Response(JSON.stringify({ jobId: job.id, filename }), {
        headers: { "content-type": "application/json" },
    });
}
