import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const jobOffers = await prisma.jobOffer.findMany({
            where: { isActive: true },
            orderBy: { publishedAt: "desc" },
        });

        return NextResponse.json(jobOffers);
    } catch (error) {
        console.error("Failed to fetch job offers:", error);
        return NextResponse.json(
            { error: "Failed to fetch job offers" },
            { status: 500 }
        );
    }
}
