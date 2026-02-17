"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

interface ProductSectionInput {
    title: string;
    title_ar?: string;
    content: string;
    content_ar?: string;
    order: number;
    colorTheme?: string;
}

export async function createProductSection(productId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const colorTheme = (formData.get("colorTheme") as string) || "blue";

    const section = await prisma.productSection.create({
        data: {
            productId,
            title,
            title_ar,
            content,
            content_ar,
            order,
            colorTheme,
        },
    });

    revalidateTag("product-sections", { expire: 0 });
    revalidatePath(`/product/${productId}`);
    return section;
}

export async function updateProductSection(sectionId: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const order = parseInt(formData.get("order") as string) || 0;
    const colorTheme = (formData.get("colorTheme") as string) || "blue";

    const section = await prisma.productSection.update({
        where: { id: sectionId },
        data: {
            title,
            title_ar,
            content,
            content_ar,
            order,
            colorTheme,
        },
    });

    revalidateTag("product-sections", { expire: 0 });
    return section;
}

export async function deleteProductSection(sectionId: string, productId: string) {
    await prisma.productSection.delete({
        where: { id: sectionId },
    });

    revalidateTag("product-sections", { expire: 0 });
    revalidatePath(`/product/${productId}`);
}

export async function getProductSections(productId: string) {
    return prisma.productSection.findMany({
        where: { productId },
        orderBy: { order: 'asc' }
    });
}
