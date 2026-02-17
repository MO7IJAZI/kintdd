"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const image = formData.get("image") as string;

    const name_ar = formData.get("name_ar") as string;
    const description_ar = formData.get("description_ar") as string;

    if (!name_ar || !name_ar.trim()) {
        throw new Error("name_ar is required");
    }

    await prisma.category.create({
        data: {
            name,
            slug,
            description,
            parentId: parentId || null,
            name_ar: name_ar.trim(),
            description_ar,
            image: image && image.trim() ? image.trim() : null,
        },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidateTag("categories", { expire: 0 });
}

export async function updateCategory(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const image = formData.get("image") as string;

    const name_ar = formData.get("name_ar") as string;
    const description_ar = formData.get("description_ar") as string;

    if (!name_ar || !name_ar.trim()) {
        throw new Error("name_ar is required");
    }

    await prisma.category.update({
        where: { id },
        data: {
            name,
            slug,
            description,
            parentId: parentId || null,
            name_ar: name_ar.trim(),
            description_ar,
            image: image && image.trim() ? image.trim() : null,
        },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidateTag("categories", { expire: 0 });
}

export async function deleteCategory(id: string) {
    await prisma.category.delete({
        where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidateTag("categories", { expire: 0 });
}

const getCategoriesCached = unstable_cache(
    async () =>
        prisma.category.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { order: "asc" },
        }),
    ["categories:list"],
    { revalidate: 10, tags: ["categories"] }
);

export async function getCategories() {
    try {
        return await getCategoriesCached();
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}
