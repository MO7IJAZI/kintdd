import { getAdminCrops } from '@/actions/cropActions';
import { Link } from '@/navigation';
import DeleteButton from '@/components/admin/DeleteButton';
import { getTranslations, getLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams?: Promise<{ q?: string; category?: string }>;
}

export default async function AdminCrops({ searchParams }: PageProps) {
    const t = await getTranslations('AdminCrops');
    const tCommon = await getTranslations('AdminCommon');
    const locale = await getLocale();
    const isAr = locale === 'ar';
    const params = (await searchParams) || {};
    const q = (params.q || '').trim();
    const category = (params.category || '').trim();

    const crops = await getAdminCrops({ q, category });

    const categoryOptions = Array.from(
        new Map(
            (crops || [])
                .map((c: any) => {
                    const value = (c.category || c.category_ar || '').trim();
                    if (!value) return null;
                    const label = isAr ? (c.category_ar || c.category || value) : (c.category || c.category_ar || value);
                    return [value, { value, label }];
                })
                .filter(Boolean) as Array<[string, { value: string; label: string }]>
        ).values()
    ).sort((a, b) => a.label.localeCompare(b.label, isAr ? 'ar' : 'en'));

    return (
        <div dir={isAr ? 'rtl' : 'ltr'}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
                </div>
                <Link href="/admin/crops/new" className="btn btn-primary">
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
                    name="category"
                    defaultValue={category}
                    className="input"
                    style={{ minWidth: 260, flex: '0 0 260px' }}
                >
                    <option value="">{tCommon('allCategories')}</option>
                    {categoryOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button type="submit" className="btn btn-primary">{tCommon('applyFilters')}</button>
                {(q || category) && (
                    <Link href="/admin/crops" className="btn btn-outline">{tCommon('clearFilters')}</Link>
                )}
            </form>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('name')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('slug')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{tCommon('category')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('stages')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.map((crop: any) => (
                            <tr key={crop.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{isAr ? (crop.name_ar || crop.name) : crop.name}</td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{crop.slug}</td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{isAr ? (crop.category_ar || crop.category || '') : (crop.category || crop.category_ar || '')}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                        {crop._count?.stages || 0} {t('stagesCount')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: isAr ? 'left' : 'right' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.25rem' }}>
                                        <Link href={{pathname: '/admin/crops/[id]', params: {id: crop.id}}} style={{ color: 'var(--primary)', fontWeight: '600' }}>{t('edit')}</Link>
                                        <DeleteButton id={crop.id} type="crop" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {crops.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('noData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
