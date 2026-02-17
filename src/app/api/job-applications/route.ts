import { NextResponse } from "next/server";
import { createJobApplication } from "@/actions/jobApplicationActions";

function getPublicErrorDetails(error: unknown) {
    if (!error || typeof error !== "object") return undefined;

    const anyError = error as Record<string, unknown>;
    const code = typeof anyError.code === "string" ? anyError.code : undefined;
    const name = typeof anyError.name === "string" ? anyError.name : undefined;
    const clientVersion =
        typeof anyError.clientVersion === "string" ? anyError.clientVersion : undefined;

    if (!code && !name && !clientVersion) return undefined;
    return { code, name, clientVersion };
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        await createJobApplication(formData);
        return NextResponse.json({ success: true, message: "Application submitted successfully!" });
    } catch (error) {
        const details = getPublicErrorDetails(error);
        console.error("Failed to submit job application:", {
            details,
            message: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: "Failed to submit application", details },
            { status: 500 }
        );
    }
}

export async function GET() {
    // This endpoint is for admin use - list all applications
    const { getJobApplications } = await import("@/actions/jobApplicationActions");
    try {
        const applications = await getJobApplications();
        return NextResponse.json(applications);
    } catch (error) {
        const details = getPublicErrorDetails(error);
        console.error("Failed to fetch job applications:", {
            details,
            message: error instanceof Error ? error.message : String(error),
        });
        return NextResponse.json(
            { error: "Failed to fetch applications", details },
            { status: 500 }
        );
    }
}
