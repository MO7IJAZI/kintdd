"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

interface StageInput {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    products: string[];
}

export async function createCrop(formData: FormData) {
    const name = formData.get("name") as string;
    const name_ar = formData.get("name_ar") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const description_ar = formData.get("description_ar") as string;
    const harvestSeason_ar = formData.get("harvestSeason_ar") as string;
    const image = formData.get("image") as string;
    const pdfUrl = formData.get("pdfUrl") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    
    const productIdsStr = formData.get("productIds") as string;
    const productIds = productIdsStr ? (JSON.parse(productIdsStr) as string[]) : [];

    const stagesStr = formData.get("stages") as string;
    const stages = stagesStr ? (JSON.parse(stagesStr) as StageInput[]) : [];

    await prisma.crop.create({
        data: {
            name,
            name_ar,
            slug,
            description,
            description_ar,
            harvestSeason_ar,
            image,
            pdfUrl,
            metaTitle,
            metaTitle_ar,
            recommendedProducts: {
                connect: productIds.map((id: string) => ({ id }))
            },
            stages: {
                create: stages.map((s, index) => ({
                    name: s.name,
                    name_ar: s.name_ar,
                    order: index,
                    recommendation: { products: s.products }
                }))
            }
        },
    });

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidateTag("crops", { expire: 0 });
}

const getCropsCached = unstable_cache(
    async () =>
        prisma.crop.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                _count: {
                    select: {
                        stages: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        }),
    ["crops:list"],
    { revalidate: 10, tags: ["crops"] }
);

const getCropBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.crop.findUnique({
            where: { slug },
            include: {
                stages: {
                    orderBy: { order: "asc" },
                },
                recommendedProducts: true,
            },
        }),
    ["crops:by-slug"],
    { revalidate: 10, tags: ["crops"] }
);

const getCropByIdCached = unstable_cache(
    async (id: string) =>
        prisma.crop.findUnique({
            where: { id },
            include: {
                stages: { orderBy: { order: "asc" } },
                recommendedProducts: true,
            },
        }),
    ["crops:by-id"],
    { revalidate: 10, tags: ["crops"] }
);

export async function getCrops() {
    return getCropsCached();
}

export async function getCropBySlug(slug: string) {
    return getCropBySlugCached(slug);
}
export async function getCropById(id: string) {
    return getCropByIdCached(id);
}

export async function updateCrop(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const name_ar = formData.get("name_ar") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const description_ar = formData.get("description_ar") as string;
    const harvestSeason_ar = formData.get("harvestSeason_ar") as string;
    const image = formData.get("image") as string;
    const pdfUrl = formData.get("pdfUrl") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    
    const productIdsStr = formData.get("productIds") as string;
    const productIds = productIdsStr ? (JSON.parse(productIdsStr) as string[]) : [];

    const stagesStr = formData.get("stages") as string;
    const stages = stagesStr ? (JSON.parse(stagesStr) as StageInput[]) : [];

    await prisma.crop.update({
        where: { id },
        data: {
            name,
            name_ar,
            slug,
            description,
            description_ar,
            harvestSeason_ar,
            image,
            pdfUrl,
            metaTitle,
            metaTitle_ar,
            recommendedProducts: {
                set: productIds.map((id: string) => ({ id }))
            },
            stages: {
                deleteMany: {},
                create: stages.map((s, index) => ({
                    name: s.name,
                    name_ar: s.name_ar,
                    order: index,
                    recommendation: { products: s.products }
                }))
            }
        },
    });

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidatePath(`/crops/${slug}`);
    revalidateTag("crops", { expire: 0 });
}

export async function deleteCrop(id: string) {
    await prisma.crop.delete({
        where: { id },
    });

    revalidatePath("/admin/crops");
    revalidatePath("/crop-farming");
    revalidateTag("crops", { expire: 0 });
}
