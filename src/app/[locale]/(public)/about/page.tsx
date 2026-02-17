import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/navigation';

export const metadata = {
  title: 'About Us - KINT',
  description: 'Get to know KINT, our mission, and our ambition.',
};

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('AboutNew');
    const tCommon = await getTranslations('Navigation');
    const isRtl = locale === 'ar';

    return (
        <div style={{ backgroundColor: '#f8fafc', overflowX: 'hidden' }} dir={isRtl ? 'rtl' : 'ltr'}>
             {/* Hero Section */}
             <section className="hero-section" style={{
                position: 'relative',
                background: 'linear-gradient(rgba(20, 35, 70, 0.8), rgba(20, 35, 70, 0.7)), url(/images/about/company-overview.webp)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                padding: '8rem 0',
                textAlign: 'center',
                marginBottom: '0'
             }}>
                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        fontWeight: 800, 
                        marginBottom: '1rem',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        {tCommon('about')}
                    </h1>
                    <p style={{ 
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)', 
                        opacity: 0.9, 
                        maxWidth: '800px', 
                        margin: '0 auto',
                        lineHeight: 1.6
                    }}>
                        {t('whoWeAre.tagline')}
                    </p>
                </div>
            </section>

            {/* Section 1: Who We Are */}
            <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    <div className={isRtl ? 'fade-in-right' : 'fade-in-left'}>
                         <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('whoWeAre.title')}
                        </h4>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            {t('whoWeAre.subtitle')}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {t('whoWeAre.description')}
                        </p>
                    </div>
                     <div className={isRtl ? 'fade-in-left' : 'fade-in-right'}>
                        <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <Image 
                                src="/images/about/company-overview.webp" 
                                alt={t('whoWeAre.title')} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 2: Mission */}
            <section style={{ padding: '6rem 0', backgroundColor: '#f0f9ff' }}>
                 <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    <div style={{ order: isRtl ? 1 : 2 }} className={isRtl ? 'fade-in-left' : 'fade-in-right'}>
                         <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('mission.title')}
                        </h4>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            {t('mission.subtitle')}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {t('mission.description')}
                        </p>
                    </div>
                    <div style={{ order: isRtl ? 2 : 1 }} className={isRtl ? 'fade-in-right' : 'fade-in-left'}>
                         <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <Image 
                                src="/images/about/abouts us.jpg" 
                                alt={t('mission.title')} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Ambition */}
             <section style={{ padding: '6rem 0', backgroundColor: 'white' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                    <div className={isRtl ? 'fade-in-right' : 'fade-in-left'}>
                         <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {t('ambition.title')}
                        </h4>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', lineHeight: 1.2 }}>
                            {t('ambition.subtitle')}
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                            {t('ambition.description')}
                        </p>
                    </div>
                     <div className={isRtl ? 'fade-in-left' : 'fade-in-right'}>
                        <div style={{ position: 'relative', height: '500px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                            <Image 
                                src="/images/banners/laboratory-research.jpg" 
                                alt={t('ambition.title')} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
