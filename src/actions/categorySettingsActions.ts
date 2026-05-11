"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface DynamicCategory {
    id: string;
    nameEn: string;
    nameAr: string;
    isDefault?: boolean;
}

const DEFAULT_ANIMAL_CATEGORIES: DynamicCategory[] = [
    { id: "uncategorized", nameEn: "uncategorized", nameAr: "غير مصنف", isDefault: true },
    { id: "poultry", nameEn: "poultry", nameAr: "دواجن" },
    { id: "cattle", nameEn: "cattle", nameAr: "أبقار" },
    { id: "fish", nameEn: "fish", nameAr: "أسماك" },
    { id: "bees", nameEn: "bees", nameAr: "نحل" },
    { id: "other", nameEn: "other", nameAr: "أخرى" }
];

const DEFAULT_CROP_CATEGORIES: DynamicCategory[] = [
    { id: "uncategorized", nameEn: "uncategorized", nameAr: "غير مصنف", isDefault: true },
    { id: "vegetables", nameEn: "vegetables", nameAr: "خضروات" },
    { id: "fruits", nameEn: "fruits", nameAr: "فواكه" },
    { id: "legumes", nameEn: "legumes", nameAr: "بقوليات" },
    { id: "cereals", nameEn: "cereals", nameAr: "حبوب" },
    { id: "industrial", nameEn: "industrial", nameAr: "محاصيل صناعية" },
    { id: "herbs", nameEn: "herbs", nameAr: "أعشاب" }
];

export async function getDynamicCategories(type: 'animal' | 'crop'): Promise<DynamicCategory[]> {
    const key = type === 'animal' ? 'animal_type_categories' : 'crop_categories';
    const defaults = type === 'animal' ? DEFAULT_ANIMAL_CATEGORIES : DEFAULT_CROP_CATEGORIES;

    try {
        let setting = await prisma.setting.findUnique({ where: { key } });

        if (!setting) {
            setting = await prisma.setting.create({
                data: {
                    key,
                    value: JSON.stringify(defaults)
                }
            });
        }

        const categories = JSON.parse(setting.value) as DynamicCategory[];
        
        // Ensure default 'uncategorized' always exists
        if (!categories.find(c => c.id === 'uncategorized')) {
            categories.unshift({ id: "uncategorized", nameEn: "uncategorized", nameAr: "غير مصنف", isDefault: true });
        }

        return categories;
    } catch (error) {
        console.error("Error fetching dynamic categories:", error);
        return defaults;
    }
}

export async function saveDynamicCategories(type: 'animal' | 'crop', categories: DynamicCategory[]) {
    const key = type === 'animal' ? 'animal_type_categories' : 'crop_categories';
    
    // Ensure default 'uncategorized' is never removed or altered structurally
    const defaultCat = categories.find(c => c.id === 'uncategorized') || { id: "uncategorized", nameEn: "uncategorized", nameAr: "غير مصنف", isDefault: true };
    const filteredCategories = categories.filter(c => c.id !== 'uncategorized');
    const finalCategories = [defaultCat, ...filteredCategories];

    try {
        await prisma.setting.upsert({
            where: { key },
            update: { value: JSON.stringify(finalCategories) },
            create: { key, value: JSON.stringify(finalCategories) }
        });
        
        revalidatePath('/admin/animal-types');
        revalidatePath('/admin/crops');
        return { success: true };
    } catch (error) {
        console.error("Error saving dynamic categories:", error);
        return { success: false, error: "Failed to save categories" };
    }
}

export async function deleteDynamicCategory(type: 'animal' | 'crop', categoryId: string) {
    if (categoryId === 'uncategorized') {
        return { success: false, error: "Cannot delete the default category" };
    }

    try {
        const categories = await getDynamicCategories(type);
        const categoryToDelete = categories.find(c => c.id === categoryId);
        
        if (!categoryToDelete) {
            return { success: false, error: "Category not found" };
        }

        const newCategories = categories.filter(c => c.id !== categoryId);

        // Fallback assigned to related entities
        if (type === 'animal') {
            await prisma.animalType.updateMany({
                where: { category: categoryToDelete.nameEn },
                data: { 
                    category: "uncategorized",
                    category_ar: "غير مصنف"
                }
            });
        } else {
            await prisma.crop.updateMany({
                where: { category: categoryToDelete.nameEn },
                data: { 
                    category: "uncategorized",
                    category_ar: "غير مصنف"
                }
            });
        }

        await saveDynamicCategories(type, newCategories);
        return { success: true };
    } catch (error) {
        console.error("Error deleting dynamic category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}
