import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Sprout, Users, ArrowRight } from 'lucide-react';

export const revalidate = 300;

export default async function ProductsPage() {
    const locale = await getLocale();
    const t = await getTranslations('ProductsPage');
    const tNav = await getTranslations('Navigation');
    const tHomeNew = await getTranslations('HomeNew');
    const isAr = locale === 'ar';

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            {/* Hero Section */}
            <section style={{ 
                padding: '8rem 0',
                backgroundColor: 'var(--secondary)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundColor: 'var(--primary)', 
                    opacity: 0.05,
                    backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }} />
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ 
                        fontSize: 'clamp(3rem, 7vw, 5rem)', 
                        marginBottom: '1.5rem', 
                        fontWeight: 900,
                        letterSpacing: '-0.02em'
                    }}>
                        {t('title')}
                    </h1>
                    <p style={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '1.25rem', 
                        maxWidth: '700px', 
                        margin: '0 auto', 
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Main Product Sectors Grid */}
            <section style={{ padding: '8rem 0', backgroundColor: '#fff' }}>
                <div className="container">
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
                        gap: 'var(--space-12)', 
                        maxWidth: '1300px', 
                        margin: '0 auto' 
                    }}>
                        {/* Agricultural Products Card */}
                        <div className="card" style={{ 
                            overflow: 'hidden', 
                            borderRadius: 'var(--radius-3xl)', 
                            backgroundColor: 'white', 
                            boxShadow: 'var(--shadow-2xl)', 
                            border: '1px solid var(--border)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%',
                            transition: 'transform 0.3s ease, boxShadow 0.3s ease'
                        }}>
                            <div style={{ position: 'relative', height: '400px' }}>
                                <Image 
                                    src="/images/plant_production.webp" 
                                    alt={t('agriTitle')} 
                                    fill 
                                    style={{ objectFit: 'cover' }} 
                                />
                                <div style={{ 
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)'
                                }} />
                                <div style={{ 
                                    position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                                    backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)',
                                    color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
                                }}>
                                    <Sprout size={32} />
                                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>{t('agriTitle')}</span>
                                </div>
                            </div>
                            <div style={{ padding: '4rem 3rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 900, color: 'var(--secondary)' }}>{t('agriTitle')}</h2>
                                <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem', lineHeight: 1.8, fontSize: '1.15rem' }}>
                                    {t('agriDesc')}
                                </p>
                                <Link href="/products/agricultural" className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                    {tHomeNew('viewProducts')} <ArrowRight size={22} style={{ marginLeft: isAr ? 0 : '0.75rem', marginRight: isAr ? '0.75rem' : 0 }} />
                                </Link>
                            </div>
                        </div>

                        {/* Animal Products Card */}
                        <div className="card" style={{ 
                            overflow: 'hidden', 
                            borderRadius: 'var(--radius-3xl)', 
                            backgroundColor: 'white', 
                            boxShadow: 'var(--shadow-2xl)', 
                            border: '1px solid var(--border)',
                            display: 'flex', 
                            flexDirection: 'column', 
                            height: '100%',
                            transition: 'transform 0.3s ease, boxShadow 0.3s ease'
                        }}>
                            <div style={{ position: 'relative', height: '400px' }}>
                                <Image 
                                    src="/images/animals-hero.png" 
                                    alt={t('animalTitle')} 
                                    fill 
                                    style={{ objectFit: 'cover' }} 
                                />
                                <div style={{ 
                                    position: 'absolute', inset: 0,
                                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, transparent 60%)'
                                }} />
                                <div style={{ 
                                    position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                                    backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-lg)',
                                    color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
                                }}>
                                    <Users size={32} />
                                    <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--secondary)' }}>{t('animalTitle')}</span>
                                </div>
                            </div>
                            <div style={{ padding: '4rem 3rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 900, color: 'var(--secondary)' }}>{t('animalTitle')}</h2>
                                <p style={{ color: 'var(--muted-foreground)', marginBottom: '3rem', lineHeight: 1.8, fontSize: '1.15rem' }}>
                                    {t('animalDesc')}
                                </p>
                                <Link href="/products/animal" className="btn btn-secondary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1.25rem 3rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                    {tHomeNew('viewProducts')} <ArrowRight size={22} style={{ marginLeft: isAr ? 0 : '0.75rem', marginRight: isAr ? '0.75rem' : 0 }} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
