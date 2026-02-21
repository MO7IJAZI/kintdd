import { getCategories } from "@/actions/categoryActions";
import { getProductById } from "@/actions/productActions";
import { getProductSections } from "@/actions/productSectionActions";
import ProductForm from "@/components/admin/ProductForm";
import { Tab } from "@/components/admin/TabsManager";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

interface TableRow {
    [key: string]: string;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const t = await getTranslations('AdminProductForm');
    const allCategories = await getCategories();
    // Only show subcategories (categories with parent)
    const categories = allCategories.filter((c: any) => c.parentId);
    const [product, sections] = await Promise.all([
        getProductById(id),
        getProductSections(id)
    ]);

    if (!product) {
        notFound();
    }

    // Transform product data to handle JsonValue types
    const transformedProduct = {
        ...product,
        compTable: Array.isArray(product.compTable) ? (product.compTable as TableRow[]) : undefined,
        compTable_ar: Array.isArray(product.compTable_ar) ? (product.compTable_ar as TableRow[]) : undefined,
        usageTable: Array.isArray(product.usageTable) ? (product.usageTable as TableRow[]) : undefined,
        usageTable_ar: Array.isArray(product.usageTable_ar) ? (product.usageTable_ar as TableRow[]) : undefined,
        tabs: Array.isArray(product.tabs) ? (product.tabs as unknown as Tab[]) : undefined,
        tabs_ar: Array.isArray(product.tabs_ar) ? (product.tabs_ar as unknown as Tab[]) : undefined,
    };

    return (
        <div className="bg-slate-50/50 min-h-screen">
            <ProductForm 
                categories={categories} 
                initialData={transformedProduct} 
                initialSections={sections} 
            />
        </div>
    );
}
