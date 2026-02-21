"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createCatalog(formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const description = formData.get("description") as string;
    const description_ar = formData.get("description_ar") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string) || 0;

    const catalog = await prisma.catalog.create({
        data: {
            title,
            title_ar,
            description,
            description_ar,
            fileUrl,
            category,
            order,
            isActive: true,
        },
    });

    revalidateTag("catalogs", { expire: 0 });
    revalidatePath("/admin/catalogs");
    return catalog;
}

export async function updateCatalog(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const description = formData.get("description") as string;
    const description_ar = formData.get("description_ar") as string;
    const fileUrl = formData.get("fileUrl") as string;
    const category = formData.get("category") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const isActive = formData.get("isActive") === "true";

    const catalog = await prisma.catalog.update({
        where: { id },
        data: {
            title,
            title_ar,
            description,
            description_ar,
            fileUrl,
            category,
            order,
            isActive,
        },
    });

    revalidateTag("catalogs", { expire: 0 });
    revalidatePath("/admin/catalogs");
    return catalog;
}

export async function deleteCatalog(id: string) {
    await prisma.catalog.delete({
        where: { id },
    });

    revalidateTag("catalogs", { expire: 0 });
    revalidatePath("/admin/catalogs");
}

export async function getCatalogs(
    category?: string,
    locale?: string,
    isActive?: boolean
) {
    return prisma.catalog.findMany({
        where: {
            ...(category && { category }),
            ...(locale && { locale }),
            ...(isActive !== undefined && { isActive }),
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
}

export async function getCatalogById(id: string) {
    return prisma.catalog.findUnique({
        where: { id },
    });
}
