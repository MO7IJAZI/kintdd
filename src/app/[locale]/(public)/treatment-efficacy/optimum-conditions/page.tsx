import { Link } from '@/navigation';
import {
    Droplets,
    ThermometerSun,
    Sun,
    Wind,
    Beaker,
    Clock,
    FileDown,
    ChevronRight
} from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import prisma from '@/lib/prisma';

export default async function OptimumConditionsPage() {
    const t = await getTranslations('OptimumConditions');
    const tNav = await getTranslations('Navigation');
    const locale = await getLocale();
    const isRtl = locale === 'ar';

    // Get the PDF document from database
    const prismaDocument = (prisma as unknown as { document: { findFirst: (args: unknown) => Promise<{ id: string; title: string; title_ar: string | null; filePath: string } | null> } }).document;
    const document = await prismaDocument.findFirst({
        where: {
            category: 'optimum-conditions',
            isActive: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }} dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Breadcrumb */}
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>{tNav('home')}</Link>
                        {isRtl ? <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> : <ChevronRight size={14} />}
                        <Link href={{pathname: '/treatment-efficacy'}} style={{ textDecoration: 'none', color: 'inherit' }}>{tNav('treatmentEfficacy')}</Link>
                        {isRtl ? <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> : <ChevronRight size={14} />}
                        <span style={{ color: '#059669', fontWeight: 600 }}>{t('breadcrumb')}</span>
                    </nav>
                </div>
            </div>

            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
                padding: '4rem 0',
                color: 'white'
            }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: '1.125rem', color: '#a7f3d0', maxWidth: '600px', lineHeight: 1.6 }}>
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '3rem 1.5rem' }}>

                {/* PDF Download Card */}
                {document && (
                    <div style={{
                        background: 'linear-gradient(135deg, #fce4e9 0%, #f8d7e1 100%)',
                        border: '2px solid #e9496c',
                        borderRadius: '1rem',
                        padding: '1.5rem 2rem',
                        marginBottom: '3rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#e9496c',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FileDown size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem' }}>
                                    {document.title_ar && isRtl ? document.title_ar : document.title}
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>
                                    {t('download.desc')}
                                </p>
                            </div>
                        </div>
                        <a
                            href={`/api/document/download?id=${encodeURIComponent(document.id)}`}
                            download
                            style={{
                                background: '#d63d5c',
                                color: 'white',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            <FileDown size={18} />
                            {t('download.button')}
                        </a>
                    </div>
                )}

                {/* Content Sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Humidity */}
                    <section style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: isRtl ? 'none' : '4px solid #142346',
                        borderRight: isRtl ? '4px solid #142346' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#fce4e9',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Droplets size={24} color="#e9496c" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t('humidity.title')}</h2>
                                <span style={{ 
                                    background: '#fce4e9', 
                                    color: '#be123c', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600 
                                }}>
                                    {t('humidity.optimum')}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
                            <p style={{ marginBottom: '1rem' }}>
                                {t('humidity.desc1')}
                            </p>
                            <p>
                                {t('humidity.desc2')}
                            </p>
                        </div>
                    </section>

                    {/* Temperature */}
                    <section style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: isRtl ? 'none' : '4px solid #f97316',
                        borderRight: isRtl ? '4px solid #f97316' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#fff7ed',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ThermometerSun size={24} color="#ea580c" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t('temperature.title')}</h2>
                                <span style={{ 
                                    background: '#ffedd5', 
                                    color: '#c2410c', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600 
                                }}>
                                    {t('temperature.optimum')}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
                            <p style={{ marginBottom: '1rem' }}>
                                {t('temperature.desc1')}
                            </p>
                            <p style={{ marginBottom: '1rem' }}>
                                {t('temperature.desc2')}
                            </p>
                            <p>
                                {t('temperature.desc3')}
                            </p>
                        </div>
                    </section>

                    {/* Sunlight */}
                    <section style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: isRtl ? 'none' : '4px solid #eab308',
                        borderRight: isRtl ? '4px solid #eab308' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#fefce8',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sun size={24} color="#ca8a04" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t('sunlight.title')}</h2>
                                <span style={{ 
                                    background: '#fef9c3', 
                                    color: '#a16207', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600 
                                }}>
                                    {t('sunlight.badge')}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
                            <p>
                                {t('sunlight.desc')}
                            </p>
                        </div>
                    </section>

                    {/* Wind */}
                    <section style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: isRtl ? 'none' : '4px solid #06b6d4',
                        borderRight: isRtl ? '4px solid #06b6d4' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#ecfeff',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Wind size={24} color="#0891b2" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t('wind.title')}</h2>
                                <span style={{ 
                                    background: '#cffafe', 
                                    color: '#0e7490', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600 
                                }}>
                                    {t('wind.badge')}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
                            <p>
                                {t('wind.desc')}
                            </p>
                        </div>
                    </section>

                    {/* Water Temperature */}
                    <section style={{
                        background: 'white',
                        borderRadius: '1rem',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        borderLeft: isRtl ? 'none' : '4px solid #8b5cf6',
                        borderRight: isRtl ? '4px solid #8b5cf6' : 'none'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#f5f3ff',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Beaker size={24} color="#7c3aed" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.25rem' }}>{t('waterTemperature.title')}</h2>
                                <span style={{ 
                                    background: '#ede9fe', 
                                    color: '#6d28d9', 
                                    padding: '0.25rem 0.75rem', 
                                    borderRadius: '9999px', 
                                    fontSize: '0.875rem', 
                                    fontWeight: 600 
                                }}>
                                    {t('waterTemperature.optimum')}
                                </span>
                            </div>
                        </div>
                        <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem' }}>
                            <p>
                                {t('waterTemperature.desc')}
                            </p>
                        </div>
                    </section>

                    {/* Best Time to Spray */}
                    <section style={{
                        background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
                        borderRadius: '1rem',
                        padding: '2rem',
                        color: 'white'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'rgba(255,255,255,0.15)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Clock size={24} color="#6ee7b7" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('bestTime.title')}</h2>
                        </div>
                        <div style={{ lineHeight: 1.8, fontSize: '1rem', color: '#d1fae5' }}>
                            <p>
                                {t('bestTime.desc')}
                            </p>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
