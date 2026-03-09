import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

const CORE_PARENT_CATEGORIES = [
    {
        slug: 'livestock',
        name: 'Livestock',
        name_ar: 'الثروة الحيوانية',
        description: 'Veterinary products and animal nutrition solutions',
        description_ar: 'منتجات الثروة الحيوانية وحلول تغذية الحيوان',
        order: 1,
        image: '/images/livestock.jpg',
    },
    {
        slug: 'plant-wealth',
        name: 'Plant Wealth',
        name_ar: 'الثروة النباتية',
        description: 'Agricultural products for crop nutrition and protection',
        description_ar: 'منتجات الثروة النباتية لتغذية وحماية المحاصيل',
        order: 2,
        image: '/images/planet.webp',
    },
] as const;

const CORE_CHILD_CATEGORIES = [
    {
        slug: 'animal-products',
        name: 'Animal Products',
        name_ar: 'المنتجات الحيوانية',
        description: 'General animal health and nutrition products',
        description_ar: 'منتجات عامة لصحة وتغذية الحيوان',
        parentSlug: 'livestock',
        order: 1,
    },
    {
        slug: 'by-animal-type',
        name: 'By Animal Type',
        name_ar: 'حسب نوع الحيوان',
        description: 'Products categorized by animal type',
        description_ar: 'منتجات مصنفة حسب نوع الحيوان',
        parentSlug: 'livestock',
        order: 2,
    },
    {
        slug: 'plant-products',
        name: 'Plant Products',
        name_ar: 'المنتجات النباتية',
        description: 'Products for general plant care and fertilization',
        description_ar: 'منتجات للعناية العامة بالنبات والتسميد',
        parentSlug: 'plant-wealth',
        order: 1,
    },
    {
        slug: 'crops',
        name: 'Crops',
        name_ar: 'المحاصيل',
        description: 'Specialized crop-specific solutions',
        description_ar: 'حلول متخصصة خاصة بالمحاصيل',
        parentSlug: 'plant-wealth',
        order: 2,
    },
] as const;

const PROTECTED_CATEGORY_SLUGS: Set<string> = new Set([
    ...CORE_PARENT_CATEGORIES.map((category) => category.slug),
    ...CORE_CHILD_CATEGORIES.map((category) => category.slug),
]);

const HIDDEN_PRODUCT_ASSIGNMENT_SLUGS: Set<string> = new Set([
    'livestock',
    'plant-wealth',
    'by-animal-type',
    'crops',
]);

export function isProtectedCategorySlug(slug?: string | null) {
    if (!slug) return false;
    return PROTECTED_CATEGORY_SLUGS.has(slug);
}

export function isHiddenProductAssignmentCategory(slug?: string | null) {
    if (!slug) return false;
    return HIDDEN_PRODUCT_ASSIGNMENT_SLUGS.has(slug);
}

export function filterProductAssignmentCategories<T extends { slug?: string | null }>(categories: T[]) {
    return categories.filter((category) => !isHiddenProductAssignmentCategory(category.slug));
}

export async function ensureCoreCategoriesExist() {
    const parentsBySlug = new Map<string, string>();

    for (const category of CORE_PARENT_CATEGORIES) {
        const upserted = await prisma.category.upsert({
            where: { slug: category.slug },
            update: {
                name: category.name,
                name_ar: category.name_ar,
                description: category.description,
                description_ar: category.description_ar,
                parentId: null,
                isActive: true,
                order: category.order,
                image: category.image,
            },
            create: {
                slug: category.slug,
                name: category.name,
                name_ar: category.name_ar,
                description: category.description,
                description_ar: category.description_ar,
                parentId: null,
                isActive: true,
                order: category.order,
                image: category.image,
            },
            select: { id: true, slug: true },
        });

        parentsBySlug.set(upserted.slug, upserted.id);
    }

    for (const category of CORE_CHILD_CATEGORIES) {
        const parentId = parentsBySlug.get(category.parentSlug);
        if (!parentId) continue;

        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {
                name: category.name,
                name_ar: category.name_ar,
                description: category.description,
                description_ar: category.description_ar,
                parentId,
                isActive: true,
                order: category.order,
            },
            create: {
                slug: category.slug,
                name: category.name,
                name_ar: category.name_ar,
                description: category.description,
                description_ar: category.description_ar,
                parentId,
                isActive: true,
                order: category.order,
            },
        });
    }
}

export const getCachedProductCategories = unstable_cache(
    async () => {
        try {
            await ensureCoreCategoriesExist();
            return await prisma.category.findMany({
                where: { 
                    isActive: true, 
                    parentId: null
                },
                orderBy: [{ order: 'asc' }, { name: 'asc' }],
                select: {
                    id: true,
                    name: true,
                    name_ar: true,
                    slug: true,
                    description: true,
                    description_ar: true,
                    image: true,
                    children: {
                        where: { isActive: true },
                        orderBy: [{ order: 'asc' }, { name: 'asc' }],
                        select: {
                            id: true,
                            name: true,
                            name_ar: true,
                            slug: true,
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Failed to fetch product categories:", error);
            return [];
        }
    },
    ['product-categories-header'],
    {
        revalidate: 300, // Cache for 5 minutes
        tags: ['categories']
    }
);
