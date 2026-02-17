import { getProducts } from "@/actions/productActions";
import { Link } from '@/navigation';
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function AdminProducts() {
    const products = await getProducts();
    const t = await getTranslations('AdminProducts');
    const tCommon = await getTranslations('AdminCommon');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
                </div>
                <Link href="/admin/products/new" className="btn btn-primary">
                    {t('addNew')}
                </Link>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('product')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('category')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{tCommon('status')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{tCommon('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product: any) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '0.5rem', overflow: 'hidden' }}>
                                        <Image src={product.image || '/images/cat-biostimulants.png'} alt={product.name} fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{product.slug}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.875rem' }}>{product.category.name}</span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        backgroundColor: product.isActive ? '#ecfdf5' : '#fff1f2',
                                        color: product.isActive ? '#059669' : '#e11d48'
                                    }}>
                                        {product.isActive ? tCommon('active') : tCommon('inactive')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <Link href={`/admin/products/${product.id}`} style={{ color: 'var(--primary)', fontWeight: '600', marginRight: '1rem' }}>{tCommon('edit')}</Link>
                                    <DeleteButton id={product.id} type="product" />
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('notFound')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
