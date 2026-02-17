"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function createPage(formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const template = formData.get("template") as string;
    const isActive = formData.get("isActive") === "true";

    await prisma.page.create({
        data: {
            title,
            title_ar,
            slug,
            content,
            content_ar,
            template,
            isActive,
        },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${slug}`);
    revalidatePath(`/page/${slug}`);
    revalidateTag("pages", { expire: 0 });
}

export async function updatePage(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const template = formData.get("template") as string;
    const isActive = formData.get("isActive") === "true";

    const page = await prisma.page.findUnique({ where: { id } });

    await prisma.page.update({
        where: { id },
        data: {
            title,
            title_ar,
            slug,
            content,
            content_ar,
            template,
            isActive,
        },
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${slug}`);
    revalidatePath(`/page/${slug}`);
    if (page?.slug && page.slug !== slug) {
        revalidatePath(`/${page.slug}`);
    }
    revalidateTag("pages", { expire: 0 });
}

export async function deletePage(id: string) {
    const page = await prisma.page.findUnique({ where: { id } });
    
    await prisma.page.delete({
        where: { id },
    });

    revalidatePath("/admin/pages");
    if (page) {
        revalidatePath(`/${page.slug}`);
        revalidatePath(`/page/${page.slug}`);
    }
    revalidateTag("pages", { expire: 0 });
}

const getPagesCached = unstable_cache(
    async () =>
        prisma.page.findMany({
            orderBy: { updatedAt: "desc" },
        }),
    ["pages:list"],
    { revalidate: 10, tags: ["pages"] }
);

const getPageBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.page.findUnique({
            where: { slug },
        }),
    ["pages:by-slug"],
    { revalidate: 10, tags: ["pages"] }
);

const getPageByIdCached = unstable_cache(
    async (id: string) =>
        prisma.page.findUnique({
            where: { id },
        }),
    ["pages:by-id"],
    { revalidate: 10, tags: ["pages"] }
);

export async function getPages() {
    return getPagesCached();
}

export async function getPageBySlug(slug: string) {
    return getPageBySlugCached(slug);
}

export async function getPageById(id: string) {
    return getPageByIdCached(id);
}
