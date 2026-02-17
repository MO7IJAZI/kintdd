"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function createJobOffer(formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const location = formData.get("location") as string;
    const location_ar = formData.get("location_ar") as string;
    const workType = formData.get("workType") as string;
    const workType_ar = formData.get("workType_ar") as string;
    const contractType = formData.get("contractType") as string;
    const contractType_ar = formData.get("contractType_ar") as string;
    const employmentType = formData.get("employmentType") as string;
    const employmentType_ar = formData.get("employmentType_ar") as string;
    const companyIntro = formData.get("companyIntro") as string;
    const companyIntro_ar = formData.get("companyIntro_ar") as string;
    const responsibilities = formData.get("responsibilities") as string;
    const responsibilities_ar = formData.get("responsibilities_ar") as string;
    const benefits = formData.get("benefits") as string;
    const benefits_ar = formData.get("benefits_ar") as string;
    const qualifications = formData.get("qualifications") as string;
    const qualifications_ar = formData.get("qualifications_ar") as string;
    const isActive = formData.get("isActive") === "true";
    
    // Parse expiresAt
    const expiresAtStr = formData.get("expiresAt") as string;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await prisma.jobOffer.create({
        data: {
            title,
            title_ar,
            location,
            location_ar,
            workType,
            workType_ar,
            contractType,
            contractType_ar,
            employmentType,
            employmentType_ar,
            companyIntro,
            companyIntro_ar,
            responsibilities,
            responsibilities_ar,
            benefits,
            benefits_ar,
            qualifications,
            qualifications_ar,
            isActive,
            expiresAt,
        },
    });

    revalidatePath("/[locale]/admin/career", "page");
    revalidatePath("/[locale]/about/career", "page");
    revalidateTag("job-offers", { expire: 0 });
}

export async function updateJobOffer(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const location = formData.get("location") as string;
    const location_ar = formData.get("location_ar") as string;
    const workType = formData.get("workType") as string;
    const workType_ar = formData.get("workType_ar") as string;
    const contractType = formData.get("contractType") as string;
    const contractType_ar = formData.get("contractType_ar") as string;
    const employmentType = formData.get("employmentType") as string;
    const employmentType_ar = formData.get("employmentType_ar") as string;
    const companyIntro = formData.get("companyIntro") as string;
    const companyIntro_ar = formData.get("companyIntro_ar") as string;
    const responsibilities = formData.get("responsibilities") as string;
    const responsibilities_ar = formData.get("responsibilities_ar") as string;
    const benefits = formData.get("benefits") as string;
    const benefits_ar = formData.get("benefits_ar") as string;
    const qualifications = formData.get("qualifications") as string;
    const qualifications_ar = formData.get("qualifications_ar") as string;
    const isActive = formData.get("isActive") === "true";

    // Parse expiresAt
    const expiresAtStr = formData.get("expiresAt") as string;
    const expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await prisma.jobOffer.update({
        where: { id },
        data: {
            title,
            title_ar,
            location,
            location_ar,
            workType,
            workType_ar,
            contractType,
            contractType_ar,
            employmentType,
            employmentType_ar,
            companyIntro,
            companyIntro_ar,
            responsibilities,
            responsibilities_ar,
            benefits,
            benefits_ar,
            qualifications,
            qualifications_ar,
            isActive,
            expiresAt,
        },
    });

    revalidatePath("/[locale]/admin/career", "page");
    revalidatePath("/[locale]/about/career", "page");
    revalidateTag("job-offers", { expire: 0 });
}

export async function deleteJobOffer(id: string) {
    try {
        await prisma.jobOffer.delete({
            where: { id },
        });

        revalidatePath("/[locale]/admin/career", "page");
        revalidatePath("/[locale]/about/career", "page");
        revalidateTag("job-offers", { expire: 0 });
    } catch (error) {
        console.error("Failed to delete job offer:", error);
        throw error;
    }
}

const getJobOffersCached = unstable_cache(
    async () =>
        prisma.jobOffer.findMany({
            where: {
                isActive: true,
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
            orderBy: { publishedAt: "desc" },
        }),
    ["job-offers:active"],
    { revalidate: 10, tags: ["job-offers"] }
);

const getAllJobOffersCached = unstable_cache(
    async () =>
        prisma.jobOffer.findMany({
            orderBy: { createdAt: "desc" },
        }),
    ["job-offers:all"],
    { revalidate: 10, tags: ["job-offers"] }
);

const getJobOfferByIdCached = unstable_cache(
    async (id: string) =>
        prisma.jobOffer.findUnique({
            where: { id },
        }),
    ["job-offers:by-id"],
    { revalidate: 10, tags: ["job-offers"] }
);

export async function getJobOffers() {
    return getJobOffersCached();
}

export async function getAllJobOffers() {
    return getAllJobOffersCached();
}

export async function getJobOfferById(id: string) {
    return getJobOfferByIdCached(id);
}
