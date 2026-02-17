import { unstable_cache } from 'next/cache';
import prisma from '@/lib/prisma';

export const getCachedProductCategories = unstable_cache(
    async () => {
        try {
            return await prisma.category.findMany({
                where: { 
                    isActive: true, 
                    parentId: null,
                    NOT: {
                        slug: {
                            in: ['animal', 'vet', 'crop-guides', 'by-animal']
                        }
                    }
                },
                orderBy: [{ order: 'asc' }, { name: 'asc' }],
                select: {
                    id: true,
                    name: true,
                    name_ar: true,
                    slug: true,
                    description: true,
                    description_ar: true,
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
        revalidate: 3600, // Cache for 1 hour
        tags: ['categories']
    }
);
