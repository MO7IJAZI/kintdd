"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

export async function createBlogPost(formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const author = formData.get("author") as string;
    const image = formData.get("image") as string;
    const tagsRaw = formData.get("tags") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const isPublished = formData.get("isPublished") === "true";

    // Process tags from comma-separated string to JSON array
    const tags = tagsRaw 
        ? JSON.stringify(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))
        : "[]";

    await prisma.blogPost.create({
        data: {
            title,
            title_ar,
            slug,
            excerpt,
            excerpt_ar,
            content,
            content_ar,
            author,
            image,
            tags,
            metaTitle,
            metaDesc,
            isPublished,
            publishedAt: isPublished ? new Date() : null,
        },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidateTag("blog-posts", { expire: 0 });
}

export async function updateBlogPost(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    const slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const author = formData.get("author") as string;
    const image = formData.get("image") as string;
    const tagsRaw = formData.get("tags") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const isPublished = formData.get("isPublished") === "true";

    // Process tags
    const tags = tagsRaw 
        ? JSON.stringify(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))
        : "[]";

    const post = await prisma.blogPost.findUnique({ where: { id } });

    await prisma.blogPost.update({
        where: { id },
        data: {
            title,
            title_ar,
            slug,
            excerpt,
            excerpt_ar,
            content,
            content_ar,
            author,
            image,
            tags,
            metaTitle,
            metaDesc,
            isPublished,
            publishedAt: isPublished && !post?.publishedAt ? new Date() : post?.publishedAt,
        },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidateTag("blog-posts", { expire: 0 });
}

export async function deleteBlogPost(id: string) {
    await prisma.blogPost.delete({
        where: { id },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidateTag("blog-posts", { expire: 0 });
}

const getBlogPostsCached = unstable_cache(
    async () =>
        prisma.blogPost.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                author: true,
                isPublished: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        }),
    ["blog-posts:list"],
    { revalidate: 10, tags: ["blog-posts"] }
);

const getBlogPostBySlugCached = unstable_cache(
    async (slug: string) =>
        prisma.blogPost.findUnique({
            where: { slug },
        }),
    ["blog-posts:by-slug"],
    { revalidate: 10, tags: ["blog-posts"] }
);

const getBlogPostByIdCached = unstable_cache(
    async (id: string) =>
        prisma.blogPost.findUnique({
            where: { id },
        }),
    ["blog-posts:by-id"],
    { revalidate: 10, tags: ["blog-posts"] }
);

export async function getBlogPosts() {
    return getBlogPostsCached();
}

export async function getBlogPostBySlug(slug: string) {
    return getBlogPostBySlugCached(slug);
}
export async function getBlogPostById(id: string) {
    return getBlogPostByIdCached(id);
}
