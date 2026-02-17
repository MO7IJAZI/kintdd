"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

interface DownloadInput {
    title: string;
    type: string;
    fileUrl: string;
}

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string;
    const description = formData.get("description") as string;
    const shortDesc = formData.get("shortDesc") as string;
    const categoryId = formData.get("categoryId") as string;
    const isFeatured = formData.get("isFeatured") === "true";
    const isOrganic = formData.get("isOrganic") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const colorTheme = (formData.get("colorTheme") as string) || "blue";
    const image = formData.get("image") as string;
    const benefits = formData.get("benefits") as string;
    const usage = formData.get("usage") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDesc = formData.get("metaDesc") as string;

    const name_ar = formData.get("name_ar") as string;
    const description_ar = formData.get("description_ar") as string;
    const shortDesc_ar = formData.get("shortDesc_ar") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;
    const benefits_ar = formData.get("benefits_ar") as string;
    const usage_ar = formData.get("usage_ar") as string;

    const usageTableStr = formData.get("usageTable") as string;
    const compTableStr = formData.get("compTable") as string;
    const tabsStr = formData.get("tabs") as string;
    const tabsArStr = formData.get("tabs_ar") as string;
    const downloadsStr = formData.get("downloads") as string;

    const usageTable = usageTableStr ? JSON.parse(usageTableStr) : null;
    const compTable = compTableStr ? JSON.parse(compTableStr) : null;
    const tabs = tabsStr ? JSON.parse(tabsStr) : null;
    const tabs_ar = tabsArStr ? JSON.parse(tabsArStr) : null;
    const downloads = downloadsStr ? (JSON.parse(downloadsStr) as DownloadInput[]) : [];

    await prisma.product.create({
        data: {
            name,
            slug,
            sku,
            description,
            shortDesc,
            categoryId,
            isFeatured,
            isOrganic,
            order,
            colorTheme,
            image,
            benefits,
            usage,
            usageTable,
            compTable,
            tabs,
            tabs_ar,
            metaTitle,
            metaDesc,
            name_ar,
            description_ar,
            shortDesc_ar,
            benefits_ar,
            usage_ar,
            metaTitle_ar,
            metaDesc_ar,
            downloads: {
                create: downloads.map((d) => ({
                    title: d.title,
                    type: d.type,
                    fileUrl: d.fileUrl
                }))
            }
        },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/product/${slug}`);
    revalidateTag("products", { expire: 0 });
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const sku = formData.get("sku") as string;
    const description = formData.get("description") as string;
    const shortDesc = formData.get("shortDesc") as string;
    const categoryId = formData.get("categoryId") as string;
    const isFeatured = formData.get("isFeatured") === "true";
    const isOrganic = formData.get("isOrganic") === "true";
    const order = parseInt(formData.get("order") as string) || 0;
    const colorTheme = (formData.get("colorTheme") as string) || "blue";
    const image = formData.get("image") as string;
    const benefits = formData.get("benefits") as string;
    const usage = formData.get("usage") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDesc = formData.get("metaDesc") as string;

    // Arabic Fields
    const name_ar = formData.get("name_ar") as string;
    const description_ar = formData.get("description_ar") as string;
    const shortDesc_ar = formData.get("shortDesc_ar") as string;
    const benefits_ar = formData.get("benefits_ar") as string;
    const usage_ar = formData.get("usage_ar") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;

    const usageTableStr = formData.get("usageTable") as string;
    const compTableStr = formData.get("compTable") as string;
    const tabsStr = formData.get("tabs") as string;
    const downloadsStr = formData.get("downloads") as string;
    
    // Arabic JSON Fields
    const usageTableArStr = formData.get("usageTable_ar") as string;
    const compTableArStr = formData.get("compTable_ar") as string;
    const tabsArStr = formData.get("tabs_ar") as string;

    const usageTable = usageTableStr ? JSON.parse(usageTableStr) : null;
    const compTable = compTableStr ? JSON.parse(compTableStr) : null;
    const tabs = tabsStr ? JSON.parse(tabsStr) : null;
    const downloads = downloadsStr ? (JSON.parse(downloadsStr) as DownloadInput[]) : [];
    
    const usageTable_ar = usageTableArStr ? JSON.parse(usageTableArStr) : null;
    const compTable_ar = compTableArStr ? JSON.parse(compTableArStr) : null;
    const tabs_ar = tabsArStr ? JSON.parse(tabsArStr) : null;

    await prisma.product.update({
        where: { id },
        data: {
            name,
            slug,
            sku,
            description,
            shortDesc,
            categoryId,
            isFeatured,
            isOrganic,
            order,
            colorTheme,
            image,
            benefits,
            usage,
            usageTable,
            compTable,
            tabs,
            metaTitle,
            metaDesc,
            // Arabic Data
            name_ar,
            description_ar,
            shortDesc_ar,
            benefits_ar,
            usage_ar,
            usageTable_ar,
            compTable_ar,
            tabs_ar,
            metaTitle_ar,
            metaDesc_ar,
            downloads: {
                deleteMany: {},
                create: downloads.map((d) => ({
                    title: d.title,
                    type: d.type,
                    fileUrl: d.fileUrl
                }))
            }
        },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/product/${slug}`);
    revalidateTag("products", { expire: 0 });
}

export async function deleteProduct(id: string) {
    await prisma.product.delete({
        where: { id },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidateTag("products", { expire: 0 });
}

const getProductsCached = unstable_cache(
    async () =>
        prisma.product.findMany({
            include: {
                category: true,
            },
            orderBy: { createdAt: "desc" },
        }),
    ["products:list"],
    { revalidate: 10, tags: ["products"] }
);

const getProductBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                images: true,
                downloads: true,
            },
        }),
    ["products:by-slug"],
    { revalidate: 10, tags: ["products"] }
);

const getProductByIdCached = unstable_cache(
    async (id: string) =>
        prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                downloads: true,
            },
        }),
    ["products:by-id"],
    { revalidate: 10, tags: ["products"] }
);

export async function getProducts() {
    return getProductsCached();
}

export async function getProductBySlug(slug: string) {
    return getProductBySlugCached(slug);
}
export async function getProductById(id: string) {
    return getProductByIdCached(id);
}
