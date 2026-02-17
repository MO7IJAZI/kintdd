"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCrops, deleteCrop } from '@/actions/cropActions';
import { Link } from '@/navigation';
import { useTranslations } from 'next-intl';

interface CropStage {
    id?: string;
    name?: string;
    order?: number;
}

interface Crop {
    id: string;
    name: string;
    slug: string;
    stages?: CropStage[];
}

export default function AdminCrops() {
    const t = useTranslations('AdminCrops');
    const tCommon = useTranslations('AdminCommon');
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchCrops = useCallback(async () => {
        const data = await getCrops();
        setCrops(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchCrops();
        };
        load();
    }, [fetchCrops]);

    async function handleDelete(id: string) {
        if (!confirm(t('deleteConfirm'))) return;
        setIsLoading(true);
        await deleteCrop(id);
        void fetchCrops();
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
                </div>
                <Link href="/admin/crops/new" className="btn btn-primary">
                    {t('addNew')}
                </Link>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('name')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('slug')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('stages')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {crops.map((crop) => (
                            <tr key={crop.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem', fontWeight: '600' }}>{crop.name}</td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{crop.slug}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                        {crop.stages?.length || 0} {t('stagesCount')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <Link href={`/admin/crops/${crop.id}`} style={{ color: 'var(--primary)', fontWeight: '600', marginRight: '1rem' }}>{t('edit')}</Link>
                                    <button onClick={() => handleDelete(crop.id)} style={{ color: '#ef4444', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer' }}>{t('delete')}</button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && crops.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('noData')}
                                </td>
                            </tr>
                        )}
                        {isLoading && (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}>{tCommon('loading')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
