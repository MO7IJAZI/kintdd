"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/auth";
import { ensureCoreCategoriesExist, isProtectedCategorySlug } from "@/lib/data";

import { generateSlug, generateGlobalUniqueSlug, checkSlugExistsGlobal } from "@/lib/slugUtils";

export async function createCategory(formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    try {
        const name = formData.get("name") as string;
        let slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const parentId = formData.get("parentId") as string;
        const image = formData.get("image") as string;
        
        const name_ar = formData.get("name_ar") as string;
        const description_ar = formData.get("description_ar") as string;

        if (!name || !name.trim()) throw new Error("Name is required");
        
        // Ensure slug is present and unique globally
        if (!slug || !slug.trim()) {
            slug = await generateGlobalUniqueSlug(name);
        } else {
            // If user provided a slug, make sure it's URL friendly
            slug = generateSlug(slug);
        }

        if (await checkSlugExistsGlobal(slug)) {
             // If provided slug exists, append a number
             slug = await generateGlobalUniqueSlug(slug);
        }

        const icon = formData.get("icon") as string;

        await prisma.category.create({
            data: {
                name: name.trim(),
                slug: slug.trim(),
                description: description || null,
                parentId: parentId || null,
                name_ar: name_ar?.trim() || name.trim(), // Fallback to name if ar missing
                description_ar: description_ar || null,
                image: image && image.trim() ? image.trim() : null,
                icon: icon && icon.trim() ? icon.trim() : null,
                isActive: true, // Ensure active by default
            },
        });

        revalidateTag("categories", { expire: 0 } as any);
        revalidatePath("/", "layout");
    } catch (error: any) {
        console.error("Create Category Error:", error);
        throw new Error(error.message || "Failed to create category");
    }
}

export async function updateCategory(id: string, formData: FormData) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    let slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const parentId = formData.get("parentId") as string;
    const image = formData.get("image") as string;

    const name_ar = formData.get("name_ar") as string;
    const description_ar = formData.get("description_ar") as string;

    if (!name_ar || !name_ar.trim()) {
        throw new Error("name_ar is required");
    }

    // Ensure slug is valid and unique (excluding current category)
    if (slug && slug.trim()) {
        slug = generateSlug(slug);
    } else {
         // If slug is empty, regenerate from name
         slug = generateSlug(name);
    }

    if (await checkSlugExistsGlobal(slug, id)) {
         // If slug exists on ANOTHER record, generate a unique one
         slug = await generateGlobalUniqueSlug(slug, id);
    }

    const currentCategory = await prisma.category.findUnique({
        where: { id },
        select: { slug: true },
    });

    if (isProtectedCategorySlug(currentCategory?.slug)) {
        // For protected categories, we allow updating names and description and image,
        // but we absolutely prevent changing the slug or parentId.
        await prisma.category.update({
            where: { id },
            data: {
                name,
                description,
                name_ar: name_ar.trim(),
                description_ar,
                image: image && image.trim() ? image.trim() : null,
                icon: formData.get("icon") ? (formData.get("icon") as string).trim() : null,
            },
        });
    } else {
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
                icon: formData.get("icon") ? (formData.get("icon") as string).trim() : null,
            },
        });
    }

    revalidatePath("/admin/categories");
    revalidatePath("/en/admin/categories");
    revalidatePath("/ar/admin/categories");
    revalidateTag("categories", { expire: 0 } as any);
    revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
    const session = await auth();
    if (!session) {
        throw new Error("Unauthorized");
    }

    const category = await prisma.category.findUnique({
        where: { id },
        select: {
            slug: true,
            parent: {
                select: {
                    slug: true,
                },
            },
        },
    });

    if (!category) {
        throw new Error("Category not found");
    }

    if (isProtectedCategorySlug(category.slug) || isProtectedCategorySlug(category.parent?.slug)) {
        throw new Error("Core categories cannot be deleted");
    }

    await prisma.category.delete({
        where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/en/admin/categories");
    revalidatePath("/ar/admin/categories");
    revalidateTag("categories", { expire: 0 } as any);
    revalidatePath("/", "layout");
}

export async function getCategories() {
    try {
        await ensureCoreCategoriesExist();
        return await prisma.category.findMany({
            include: {
                parent: true,
                children: true,
                _count: {
                    select: { products: true },
                },
            },
            orderBy: { order: "asc" },
        });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}
