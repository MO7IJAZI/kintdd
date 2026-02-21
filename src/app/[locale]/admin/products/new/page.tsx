import { getCategories } from "@/actions/categoryActions";
import ProductForm from "@/components/admin/ProductForm";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    const allCategories = await getCategories();
    // Only show subcategories (categories with parent)
    const categories = allCategories.filter((c: any) => c.parentId);
    const t = await getTranslations('AdminProductForm');

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <ProductForm categories={categories} />
        </div>
    );
}
