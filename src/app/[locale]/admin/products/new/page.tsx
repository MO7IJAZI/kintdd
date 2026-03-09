import { getCategories } from "@/actions/categoryActions";
import ProductForm from "@/components/admin/ProductForm";
import { filterProductAssignmentCategories } from "@/lib/data";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    const categories = filterProductAssignmentCategories(await getCategories());
    const t = await getTranslations('AdminProductForm');

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <ProductForm categories={categories} />
        </div>
    );
}
