import { getProducts } from "@/actions/productActions";
import CropForm from "@/components/admin/CropForm";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewCropPage() {
    const products = await getProducts();
    const t = await getTranslations('AdminCrops');

    return (
        <div style={{ padding: '0 2rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t('createTitle')} <span style={{ color: 'var(--primary)' }}>{t('guide')}</span></h1>
                <nav style={{ fontSize: '0.875rem', opacity: 0.6 }}>
                    {t('breadcrumbsNew')}
                </nav>
            </div>

            <CropForm products={products} />
        </div>
    );
}
