import { auth } from "@/auth";
import fs from "fs";
import fsPromises from "fs/promises";
import { Readable } from "stream";
import { getBackupJob } from "../../_jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const session = await auth();
    if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "content-type": "application/json" },
        });
    }

    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId") || "";
    const job = getBackupJob(jobId);
    if (!job || job.type !== "export") {
        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
        });
    }

    if (job.status !== "done" || !job.exportFilePath || !fs.existsSync(job.exportFilePath)) {
        return new Response(JSON.stringify({ error: "Not ready" }), {
            status: 409,
            headers: { "content-type": "application/json" },
        });
    }

    const stream = fs.createReadStream(job.exportFilePath);
    stream.on("close", () => {
        if (job.exportFilePath) void fsPromises.rm(job.exportFilePath, { force: true }).catch(() => {});
    });
    const body = Readable.toWeb(stream as unknown as Readable) as unknown as ReadableStream;

    return new Response(body, {
        headers: {
            "content-type": "application/zip",
            "content-disposition": `attachment; filename="${job.filename || "kint-backup.zip"}"`,
            "cache-control": "no-store, max-age=0",
        },
    });
}
