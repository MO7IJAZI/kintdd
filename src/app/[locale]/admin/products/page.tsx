import { getAdminProducts } from "@/actions/productActions";
import { getCategories } from "@/actions/categoryActions";
import { Link } from '@/navigation';
import Image from "next/image";
import DeleteButton from "@/components/admin/DeleteButton";
import { getLocale, getTranslations } from 'next-intl/server';
import { filterProductAssignmentCategories } from "@/lib/data";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams?: Promise<{ q?: string; categoryId?: string }>;
}

export default async function AdminProducts({ searchParams }: PageProps) {
    const params = (await searchParams) || {};
    const q = (params.q || "").trim();
    const categoryId = (params.categoryId || "").trim();
    const products = await getAdminProducts({ q, categoryId });
    const categoriesRaw = await getCategories();
    const categories = filterProductAssignmentCategories(categoriesRaw as any[]);
    const t = await getTranslations('AdminProducts');
    const tCommon = await getTranslations('AdminCommon');
    const locale = await getLocale();
    const isAr = locale === 'ar';

    const labelForCategory = (c: any) => (isAr ? (c.name_ar || c.name) : c.name);

    const allowedIds = new Set((categories as any[]).map(c => c.id));

    const categoriesByParent = new Map<string, any[]>();
    for (const c of categories as any[]) {
        const parentKey = c.parentId || "";
        const arr = categoriesByParent.get(parentKey) || [];
        arr.push(c);
        categoriesByParent.set(parentKey, arr);
    }
    for (const arr of categoriesByParent.values()) {
        arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    const buildOptions = (parentId: string | null, depth: number): Array<{ id: string; label: string }> => {
        const key = parentId || "";
        const arr = categoriesByParent.get(key) || [];
        const prefix = depth > 0 ? `${'—'.repeat(Math.min(depth, 6))} ` : "";
        const out: Array<{ id: string; label: string }> = [];
        for (const c of arr) {
            out.push({ id: c.id, label: `${prefix}${labelForCategory(c)}` });
            out.push(...buildOptions(c.id, depth + 1));
        }
        return out;
    };
    const roots = (categories as any[]).filter(c => !c.parentId || !allowedIds.has(c.parentId));
    const categoryOptions = roots.flatMap(r => [{ id: r.id, label: labelForCategory(r) }, ...buildOptions(r.id, 1)]);

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

            <form method="get" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <input
                    name="q"
                    type="search"
                    defaultValue={q}
                    className="input"
                    placeholder={tCommon('searchPlaceholder')}
                    style={{ minWidth: 260, flex: '1 1 260px' }}
                />
                <select
                    name="categoryId"
                    defaultValue={categoryId}
                    className="input"
                    style={{ minWidth: 260, flex: '0 0 260px' }}
                >
                    <option value="">{tCommon('allCategories')}</option>
                    {categoryOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary">{tCommon('applyFilters')}</button>
                {(q || categoryId) && (
                    <Link href="/admin/products" className="btn btn-outline">{tCommon('clearFilters')}</Link>
                )}
            </form>

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
                                        <Image src={product.image || '/images/cat-biostimulants.png'} alt={isAr ? (product.name_ar || product.name) : product.name} fill style={{ objectFit: 'contain', padding: '0.25rem' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{isAr ? (product.name_ar || product.name) : product.name}</div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{product.slug}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ fontSize: '0.875rem' }}>{isAr ? (product.category?.name_ar || product.category?.name) : product.category?.name}</span>
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
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', alignItems: 'center' }}>
                                    <Link href={{pathname: '/admin/products/[id]', params: {id: product.id}}} style={{ color: 'var(--primary)', fontWeight: '600' }}>{tCommon('edit')}</Link>
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
