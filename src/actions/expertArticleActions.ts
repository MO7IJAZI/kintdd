"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { syncArticleToSeeder, removeArticleFromSeeder, formatRichText } from "@/lib/seed-utils";
import { auth } from "@/auth";

function sanitizeSlug(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export async function createExpertArticle(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const rawSlug = formData.get("slug") as string;
    const slug = sanitizeSlug(rawSlug || title); // Fallback to title if slug is empty
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const rawContent = formData.get("content") as string;
    const content = formatRichText(rawContent);
    const rawContentAr = formData.get("content_ar") as string;
    const content_ar = formatRichText(rawContentAr);
    const image = formData.get("image") as string;
    const category = formData.get("category") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;
    const isPublished = formData.get("isPublished") === "true";
    const order = parseInt(formData.get("order") as string || "0");
    const publishedAtDate = formData.get("publishedAt") as string;

    const article = await prisma.expertArticle.create({
        data: {
            title,
            title_ar,
            slug,
            excerpt,
            excerpt_ar,
            content,
            content_ar,
            image,
            category,
            order,
            metaTitle,
            metaTitle_ar,
            metaDesc,
            metaDesc_ar,
            isPublished,
            publishedAt: publishedAtDate ? new Date(publishedAtDate) : (isPublished ? new Date() : null),
        },
    });

    // Sync to seeder
    await syncArticleToSeeder({
        title,
        slug,
        excerpt,
        content,
        image,
        category,
        order,
        isPublished,
        metaTitle,
        metaDesc,
        publishedAt: article.publishedAt,
    });

    revalidatePath("/admin/expert-articles");
    revalidatePath("/experts-forum");
    revalidateTag("expert-articles", { expire: 0 });
}

export async function updateExpertArticle(id: string, formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const rawSlug = formData.get("slug") as string;
    const slug = sanitizeSlug(rawSlug || title);
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const rawContent = formData.get("content") as string;
    const content = formatRichText(rawContent);
    const rawContentAr = formData.get("content_ar") as string;
    const content_ar = formatRichText(rawContentAr);
    const image = formData.get("image") as string;
    const category = formData.get("category") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;
    const isPublished = formData.get("isPublished") === "true";
    const order = parseInt(formData.get("order") as string || "0");
    const publishedAtDate = formData.get("publishedAt") as string;

    const article = await prisma.expertArticle.findUnique({ where: { id } });

    const updatedArticle = await prisma.expertArticle.update({
        where: { id },
        data: {
            title,
            title_ar,
            slug,
            excerpt,
            excerpt_ar,
            content,
            content_ar,
            image,
            category,
            order,
            metaTitle,
            metaTitle_ar,
            metaDesc,
            metaDesc_ar,
            isPublished,
            publishedAt: publishedAtDate ? new Date(publishedAtDate) : (isPublished && !article?.publishedAt ? new Date() : article?.publishedAt),
        },
    });

    // Sync to seeder
    await syncArticleToSeeder({
        title,
        slug,
        excerpt,
        content,
        image,
        category,
        order,
        isPublished,
        metaTitle,
        metaDesc,
        publishedAt: updatedArticle.publishedAt,
    });

    revalidatePath("/admin/expert-articles");
    revalidatePath("/experts-forum");
    revalidatePath(`/experts-forum/${slug}`);
    revalidateTag("expert-articles", { expire: 0 });
}

export async function deleteExpertArticle(id: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const article = await prisma.expertArticle.findUnique({ where: { id } });
    if (article) {
        await removeArticleFromSeeder(article.slug);
    }
    
    await prisma.expertArticle.delete({
        where: { id },
    });

    revalidatePath("/admin/expert-articles");
    revalidatePath("/experts-forum");
    revalidateTag("expert-articles", { expire: 0 });
}

const getExpertArticlesCached = unstable_cache(
    async () =>
        prisma.expertArticle.findMany({
            orderBy: { createdAt: "desc" },
        }),
    ["expert-articles:list"],
    { revalidate: 10, tags: ["expert-articles"] }
);

const getExpertArticleBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.expertArticle.findUnique({
            where: { slug },
        }),
    ["expert-articles:by-slug"],
    { revalidate: 10, tags: ["expert-articles"] }
);

const getExpertArticleByIdCached = unstable_cache(
    async (id: string) =>
        prisma.expertArticle.findUnique({
            where: { id },
        }),
    ["expert-articles:by-id"],
    { revalidate: 10, tags: ["expert-articles"] }
);

const getExpertArticlesByCategoryCached = unstable_cache(
    async () => {
        const articles = await prisma.expertArticle.findMany({
            where: { isPublished: true },
            orderBy: { order: "asc" },
        });

        return {
            arable: articles.filter((article: any) => article.category === "arable"),
            fruit: articles.filter((article: any) => article.category === "fruit"),
            vegetable: articles.filter((article: any) => article.category === "vegetable"),
        };
    },
    ["expert-articles:by-category"],
    { revalidate: 10, tags: ["expert-articles"] }
);

export async function getExpertArticles() {
    return getExpertArticlesCached();
}

export async function getExpertArticleBySlug(slug: string) {
    return getExpertArticleBySlugCached(slug);
}

export async function getExpertArticleById(id: string) {
    return getExpertArticleByIdCached(id);
}

export async function getExpertArticlesByCategory() {
    return getExpertArticlesByCategoryCached();
}
