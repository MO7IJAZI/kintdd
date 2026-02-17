import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/lib/upload";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const fileUrl = await uploadFile(file, "uploads");

        return NextResponse.json({ url: fileUrl });
    } catch (error) {
        console.error("Upload Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
