import prisma from "@/lib/prisma";
import { Suspense } from "react";
import JobListClient from "@/components/career/JobListClient";
import { getTranslations, getLocale } from 'next-intl/server';
import { Link } from '@/navigation';

export const revalidate = 300;

interface JobOffer {
    id: string;
    title: string;
    title_ar?: string | null;
    location: string | null;
    location_ar?: string | null;
    workType: string | null;
    workType_ar?: string | null;
    contractType: string | null;
    contractType_ar?: string | null;
    employmentType: string | null;
    employmentType_ar?: string | null;
    companyIntro: string | null;
    companyIntro_ar?: string | null;
    responsibilities: string | null;
    responsibilities_ar?: string | null;
    benefits: string | null;
    benefits_ar?: string | null;
    qualifications: string | null;
    qualifications_ar?: string | null;
    isActive: boolean;
}

async function JobsContent() {
    let jobOffers: JobOffer[] = [];
    
    try {
        jobOffers = await prisma.jobOffer.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        }) as JobOffer[];
    } catch (error) {
        console.error("Failed to load job offers:", error);
    }

    return <JobListClient initialJobs={jobOffers} />;
}

function JobsLoading() {
    return (
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>Loading job opportunities...</p>
        </div>
    );
}

export default async function CareerPage() {
    const t = await getTranslations('Career');
    const locale = await getLocale();
    const isRtl = locale === 'ar';

    return (
        <div className="about-page" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="hero-section" style={{
                position: 'relative',
                minHeight: '40vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #142346 0%, #1a2f5c 100%)',
                color: 'white',
                textAlign: 'center',
                padding: '4rem 0'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
                        <h1 className="hero-title" style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem' }}>{t('title')}</h1>
                        <p className="hero-subtitle" style={{ fontSize: '1.3rem', opacity: 0.9 }}>
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section" style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    {/* Intro Section */}
                    <div className="intro-section" style={{ marginBottom: '3rem' }}>
                        <h2 className="section-title center" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#142346', textAlign: 'center' }}>{t('opportunities')}</h2>
                        <h3 className="subtitle center" style={{ fontSize: '1.3rem', color: '#e9496c', marginBottom: '2rem', fontWeight: 600, textAlign: 'center' }}>{t('joinTeam')}</h3>
                        <div className="intro-text" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#4a5568', textAlign: 'center' }}>
                                {t('introText')}
                            </p>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="values-section" style={{ marginBottom: '4rem' }}>
                        <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div className="value-card" style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div className="value-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                                <h3 style={{ fontSize: '1.2rem', color: '#142346', marginBottom: '0.75rem' }}>{t('developingTalents')}</h3>
                                <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {t('developingTalentsText')}
                                </p>
                            </div>
                            <div className="value-card" style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div className="value-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎓</div>
                                <h3 style={{ fontSize: '1.2rem', color: '#142346', marginBottom: '0.75rem' }}>{t('workforceDevelopment')}</h3>
                                <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {t('workforceDevelopmentText')}
                                </p>
                            </div>
                            <div className="value-card" style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div className="value-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💡</div>
                                <h3 style={{ fontSize: '1.2rem', color: '#142346', marginBottom: '0.75rem' }}>{t('recognizingInnovation')}</h3>
                                <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {t('recognizingInnovationText')}
                                </p>
                            </div>
                            <div className="value-card" style={{ background: 'white', borderRadius: '1rem', padding: '2rem', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                <div className="value-icon" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤝</div>
                                <h3 style={{ fontSize: '1.2rem', color: '#142346', marginBottom: '0.75rem' }}>{t('engagingSuccess')}</h3>
                                <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.95rem' }}>
                                    {t('engagingSuccessText')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Job Offers */}
                    <div className="jobs-section" style={{ marginBottom: '4rem' }}>
                        <h2 className="section-title center" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: '#142346', textAlign: 'center' }}>{t('currentOpenings')}</h2>
                        
                        <Suspense fallback={<JobsLoading />}>
                            <JobsContent />
                        </Suspense>
                    </div>

                    {/* Contact */}
                    <div className="cta-section" style={{ marginBottom: '2rem' }}>
                        <div className="cta-card" style={{ background: 'linear-gradient(135deg, #142346 0%, #1a2f5c 100%)', borderRadius: '2rem', padding: '3rem', textAlign: 'center', color: 'white' }}>
                            <p style={{ fontSize: '1.15rem', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto 1.5rem', opacity: 0.95 }}>
                                {t('ctaText')}
                            </p>
                            <Link href={`/contact`} className="cta-button" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #e9496c 0%, #d63d5c 100%)', color: 'white', padding: '1rem 2rem', borderRadius: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                                {t('ctaButton')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
