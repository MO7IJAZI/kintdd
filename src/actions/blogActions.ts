"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { auth } from "@/auth";

import { generateSlug, generateGlobalUniqueSlug, checkSlugExistsGlobal } from "@/lib/slugUtils";

export async function createBlogPost(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    let slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const author = formData.get("author") as string;
    const author_ar = formData.get("author_ar") as string;
    const image = formData.get("image") as string;
    const tagsRaw = formData.get("tags") as string;
    const tagsRaw_ar = formData.get("tags_ar") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;
    const isPublished = formData.get("isPublished") === "true";
    const publishedAtDate = formData.get("publishedAt") as string;

    // Ensure slug is present and unique globally
    if (!slug || !slug.trim()) {
        slug = await generateGlobalUniqueSlug(title);
    } else {
        // If user provided a slug, make sure it's URL friendly
        slug = generateSlug(slug);
    }

    if (await checkSlugExistsGlobal(slug)) {
         // If provided slug exists, append a number
         slug = await generateGlobalUniqueSlug(slug);
    }

    // Process tags from comma-separated string to JSON array
    const tags = tagsRaw 
        ? JSON.stringify(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))
        : "[]";
    const tags_ar = tagsRaw_ar
        ? JSON.stringify(tagsRaw_ar.split(',').map(t => t.trim()).filter(Boolean))
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
            author_ar,
            image,
            tags,
            tags_ar,
            metaTitle,
            metaTitle_ar,
            metaDesc,
            metaDesc_ar,
            isPublished,
            publishedAt: publishedAtDate ? new Date(publishedAtDate) : (isPublished ? new Date() : null),
        },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidateTag("blog-posts", { expire: 0 });
}

export async function updateBlogPost(id: string, formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const title = formData.get("title") as string;
    const title_ar = formData.get("title_ar") as string;
    let slug = formData.get("slug") as string;
    const excerpt = formData.get("excerpt") as string;
    const excerpt_ar = formData.get("excerpt_ar") as string;
    const content = formData.get("content") as string;
    const content_ar = formData.get("content_ar") as string;
    const author = formData.get("author") as string;
    const author_ar = formData.get("author_ar") as string;
    const image = formData.get("image") as string;
    const tagsRaw = formData.get("tags") as string;
    const tagsRaw_ar = formData.get("tags_ar") as string;
    const metaTitle = formData.get("metaTitle") as string;
    const metaTitle_ar = formData.get("metaTitle_ar") as string;
    const metaDesc = formData.get("metaDesc") as string;
    const metaDesc_ar = formData.get("metaDesc_ar") as string;
    const isPublished = formData.get("isPublished") === "true";
    const publishedAtDate = formData.get("publishedAt") as string;

    // Ensure slug is valid and unique (excluding current post)
    if (slug && slug.trim()) {
        slug = generateSlug(slug);
    } else {
         // If slug is empty, regenerate from title
         slug = generateSlug(title);
    }

    if (await checkSlugExistsGlobal(slug, id)) {
         // If slug exists on ANOTHER record, generate a unique one
         slug = await generateGlobalUniqueSlug(slug, id);
    }

    // Process tags
    const tags = tagsRaw 
        ? JSON.stringify(tagsRaw.split(',').map(t => t.trim()).filter(Boolean))
        : "[]";
    const tags_ar = tagsRaw_ar
        ? JSON.stringify(tagsRaw_ar.split(',').map(t => t.trim()).filter(Boolean))
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
            author_ar,
            image,
            tags,
            tags_ar,
            metaTitle,
            metaTitle_ar,
            metaDesc,
            metaDesc_ar,
            isPublished,
            publishedAt: publishedAtDate ? new Date(publishedAtDate) : (isPublished && !post?.publishedAt ? new Date() : post?.publishedAt),
        },
    });

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${slug}`);
    revalidateTag("blog-posts", { expire: 0 });
}

export async function deleteBlogPost(id: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

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
