import { auth } from "@/auth";
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
    if (!job || job.type !== "import") {
        return new Response(JSON.stringify({ error: "Not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
        });
    }

    return new Response(JSON.stringify(job), { headers: { "content-type": "application/json" } });
}

