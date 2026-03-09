"use client";

import { useState, useMemo } from 'react';
import { Link } from '@/navigation';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

interface Crop {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    metaTitle: string | null;
    description: string | null;
    description_ar?: string | null;
    image: string | null;
    category?: string | null;
    category_ar?: string | null;
}

export default function CropGuidesList({ initialCrops }: { initialCrops: Crop[] }) {
    const t = useTranslations('CropGuides');
    const tNav = useTranslations('Navigation');
    const tContact = useTranslations('Contact');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('ALL');

    const categories = useMemo(() => {
        const keyMap: Record<string, string> = {
            vegetables: 'vegetables',
            fruits: 'fruits',
            legumes: 'legumes',
            cereals: 'cereals',
            industrial: 'industrial',
            herbs: 'herbs'
        };
        const getCategoryLabel = (category: string, categoryAr?: string | null) => {
            if (isRtl && categoryAr) return categoryAr;
            const key = keyMap[category];
            if (key) return t(key);
            return category
                .split('-')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(' ');
        };
        const map = new Map<string, string>();
        initialCrops.forEach((crop) => {
            const category = crop.category?.trim();
            if (!category) return;
            if (!map.has(category)) {
                map.set(category, getCategoryLabel(category, crop.category_ar));
                return;
            }
            if (isRtl && crop.category_ar) {
                map.set(category, crop.category_ar);
            }
        });
        return Array.from(map.entries()).map(([id, label]) => ({ id, label }));
    }, [initialCrops, isRtl, t]);

    const tabs = useMemo(() => {
        return [{ id: 'ALL', label: t('all') }, ...categories];
    }, [categories, t]);

    const filteredCrops = useMemo(() => {
        return initialCrops.filter(crop => {
            const name = (isRtl && crop.name_ar) ? crop.name_ar : crop.name;
            const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
            
            // Map crop.metaTitle to tab IDs if necessary, or assume direct match
            // Assuming crop.metaTitle is stored in English in DB
            // We compare uppercase for consistency
            const matchesTab = activeTab === 'ALL' || crop.category === activeTab;
            
            return matchesSearch && matchesTab;
        });
    }, [initialCrops, searchQuery, activeTab, isRtl]);

    return (
        <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Page Header */}
            <section style={{
                padding: '4rem 0 4rem',
                backgroundColor: 'white',
                borderBottom: '1px solid #eee',
                textAlign: 'center'
            }}>
                <div className="container">
                    {/* Breadcrumbs */}
                    <nav style={{ marginBottom: '2rem', fontSize: '0.8rem', color: '#999', fontWeight: 700, display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                        <Link href="/" style={{ color: '#999' }}>{tNav('home').toUpperCase()}</Link> / <span style={{ color: 'var(--primary)' }}>{t('title').toUpperCase()}</span>
                    </nav>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
                        {t('title').split(' ')[0]} <span style={{ color: 'var(--primary)' }}>{t('title').split(' ').slice(1).join(' ')}</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#666', maxWidth: '700px', margin: '0 auto 3rem' }}>
                        {t('subtitle')}
                    </p>

                    {/* Search Field */}
                    <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: isRtl ? '1.25rem 2rem 1.25rem 3.5rem' : '1.25rem 3.5rem 1.25rem 2rem',
                                borderRadius: '3rem',
                                border: '1px solid #ddd',
                                fontSize: '1rem',
                                outline: 'none',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                            }}
                        />
                        <span style={{ 
                            position: 'absolute', 
                            [isRtl ? 'left' : 'right']: '2rem', 
                            top: '50%', 
                            transform: 'translateY(-50%)', 
                            opacity: 0.3 
                        }}>🔍</span>
                    </div>
                </div>
            </section>

            {/* Tabs / Filters */}
            <section style={{ padding: '2rem 0', position: 'sticky', top: '80px', backgroundColor: 'white', zIndex: 10, borderBottom: '1px solid #eee' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 2rem',
                                    borderRadius: '2rem',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    transition: '0.3s',
                                    backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : '#666',
                                    border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid #ddd',
                                    cursor: 'pointer'
                                }}
                            >
                                {tab.label.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="section">
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '2.5rem'
                    }}>
                        {filteredCrops.map((crop) => {
                            const name = (isRtl && crop.name_ar) ? crop.name_ar : crop.name;
                            const emoji = crop.category === 'fruits'
                                ? '🍎'
                                : crop.category === 'vegetables'
                                ? '🥦'
                                : crop.category === 'cereals'
                                ? '🌾'
                                : crop.category === 'legumes'
                                ? '🌱'
                                : crop.category === 'industrial'
                                ? '⚗️'
                                : crop.category === 'herbs'
                                ? '🌿'
                                : '🥦';
                            return (
                                <Link key={crop.id} href={{pathname: '/crops/[slug]', params: {slug: crop.slug}}} className="card crop-card" style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #eee',
                                    borderRadius: '1.5rem',
                                    background: 'white',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'relative', height: '220px', width: '100%' }}>
                                        {crop.image ? (
                                            <Image
                                                src={crop.image}
                                                alt={name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                            />
                                        ) : (
                                            <div style={{
                                                height: '100%', width: '100%', backgroundColor: '#f3f4f6',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '4rem'
                                            }}>
                                                {emoji}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ padding: '2rem', textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                                            {name}
                                        </h3>
                                        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
                                            {t('subtitle')}
                                        </p>
                                        <div style={{
                                            marginTop: 'auto',
                                            padding: '0.75rem 2rem',
                                            borderRadius: '2rem',
                                            border: '1px solid #ddd',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: 'var(--primary)',
                                            transition: '0.3s'
                                        }} className="view-button">
                                            {t('viewProgram')} {isRtl ? '←' : '→'}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {filteredCrops.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem', color: '#999' }}>
                            {t('noCropsFound')}
                        </div>
                    )}
                </div>
            </section>

            {/* Expert Section */}
            <section className="section" style={{ backgroundColor: 'white' }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4rem',
                        backgroundColor: '#142346',
                        borderRadius: '2rem',
                        color: 'white',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <div style={{ maxWidth: '600px', position: 'relative', zIndex: 1 }}>
                            <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>{t('needCustomProgram')}</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', lineHeight: '1.7' }}>
                                {t('customProgramDesc')}
                            </p>
                            <Link href={`/contact`} className="btn" style={{
                                backgroundColor: 'white', color: '#142346', padding: '1.1rem 2.5rem', fontWeight: 700, borderRadius: '1rem'
                            }}>
                                {t('consultExpert')}
                            </Link>
                        </div>
                        <div style={{ fontSize: '10rem', opacity: 0.1, transform: 'rotate(15deg)', position: 'absolute', [isRtl ? 'left' : 'right']: '5rem' }}>🌾</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
