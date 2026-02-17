import React from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FlaskConical, Sprout, Sun } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function TreatmentEfficacyPage() {
    const t = await getTranslations('TreatmentEfficacy');
    const locale = await getLocale();
    const isRtl = locale === 'ar';

    const features = [
        { key: "yield", icon: <Sprout size={24} color="#e9496c" /> },
        { key: "waste", icon: <CheckCircle2 size={24} color="#e9496c" /> },
        { key: "cost", icon: <FlaskConical size={24} color="#e9496c" /> },
        { key: "environment", icon: <Sun size={24} color="#e9496c" /> }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: '60vh',
                minHeight: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                backgroundColor: '#064e3b'
            }}>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
                    <Image
                        src="/images/banners/laboratory-research.jpg"
                        alt="Scientific Research involved in Treatment Efficacy"
                        fill
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>

                <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', color: 'white', padding: '0 1rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        marginBottom: '1.5rem'
                    }}>
                        <FlaskConical size={20} color="#6ee7b7" />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{t('advancedScience')}</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', lineHeight: 1.1 }}>
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#f3f4f6', maxWidth: '42rem', margin: '0 auto 2.5rem', fontWeight: 300 }}>
                        {t('subtitle')}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <Link href="optimum-conditions" style={{ textDecoration: 'none' }}>
                            <Button size="lg" variant="primary">
                                {t('viewConditions')}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', marginBottom: '5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
                                {t('whyMatters')}
                            </h2>
                            <div style={{ color: '#475569', fontSize: '1.125rem', lineHeight: 1.7, marginBottom: '2rem' }}>
                                <p style={{ marginBottom: '1rem' }}>
                                    {t('whyMattersDesc1')}
                                </p>
                                <p>
                                    {t('whyMattersDesc2')}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                                {features.map((item) => (
                                    <div key={item.key} className="feature-card" style={{ padding: '1.5rem' }}>
                                        <div className="feature-icon-wrapper" style={{ backgroundColor: '#fce4e9', marginBottom: '1rem', width: '48px', height: '48px' }}>
                                            {item.icon}
                                        </div>
                                        <h4 style={{ fontWeight: 700, color: '#1e293b' }}>{t(`features.${item.key}`)}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{
                            position: 'relative',
                            height: '500px',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ position: 'absolute', inset: 0, backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sprout size={80} color="#cbd5e1" />
                            </div>
                            <Image
                                src="/images/banners/field-check.jpg"
                                alt="Agronomist checking efficacy in field"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* Key Articles Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        <Link href="optimum-conditions" style={{ textDecoration: 'none' }}>
                            <Card style={{ height: '100%', cursor: 'pointer' }}>
                                <div style={{ position: 'relative', height: '16rem', overflow: 'hidden' }}>
                                    <Image
                                        src="/images/banners/sun-water.jpg"
                                        alt="Optimum Conditions"
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '50%' }}>
                                        <Sun size={24} color="#065f46" />
                                    </div>
                                </div>
                                <CardHeader>
                                    <CardTitle>{t('cards.optimum.title')}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p style={{ color: '#475569', marginBottom: '1rem' }}>
                                        {t('cards.optimum.desc')}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#e9496c', fontWeight: 500 }}>
                                        {t('cards.optimum.read')} <ArrowRight size={16} style={{ marginLeft: '0.25rem' }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Placeholders */}
                        <Card style={{ height: '100%', opacity: 0.7 }}>
                            <div style={{ height: '16rem', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FlaskConical size={48} color="#94a3b8" />
                            </div>
                            <CardHeader>
                                <CardTitle>{t('cards.water')}</CardTitle>
                            </CardHeader>
                        </Card>

                        <Card style={{ height: '100%', opacity: 0.7 }}>
                            <div style={{ height: '16rem', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Sprout size={48} color="#94a3b8" />
                            </div>
                            <CardHeader>
                                <CardTitle>{t('cards.adjuvants')}</CardTitle>
                            </CardHeader>
                        </Card>

                    </div>
                </div>
            </section>
        </div>
    );
}