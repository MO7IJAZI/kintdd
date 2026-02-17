import { getCategories } from "@/actions/categoryActions";
import ProductForm from "@/components/admin/ProductForm";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
    const categories = await getCategories();
    const t = await getTranslations('AdminProductForm');

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('newProductTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('newProductDesc')}</p>
            </div>

            <ProductForm categories={categories} />
        </div>
    );
}
