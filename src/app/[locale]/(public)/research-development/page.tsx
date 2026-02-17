'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function RDPage() {
    const t = useTranslations('ResearchDevelopment');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    return (
        <div className="about-page" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">{t('title')}</h1>
                        <p className="hero-subtitle">
                            {t('subtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section">
                <div className="container">
                    {/* Intro */}
                    <div className="intro-section">
                        <div className="intro-grid">
                            <div className="intro-text">
                                <h2 className="section-title">{t('sectionTitle')}</h2>
                                <p>
                                    {t('intro')}
                                </p>
                            </div>
                            <div className="intro-image">
                                <div className="image-placeholder">
                                    <Image 
                                        src="/images/about/RD top.webp" 
                                        alt={t('title')} 
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Laboratories */}
                    <div className="labs-section">
                        <p>
                            {t('labsIntro')}
                        </p>
                    </div>

                    {/* Formulation Research Laboratory */}
                    <div className="lab-section">
                        <h2>{t('labs.formulation.title')}</h2>
                        <p>
                            {t('labs.formulation.desc')}
                        </p>
                    </div>

                    {/* Analytical Laboratory */}
                    <div className="lab-section">
                        <h2>{t('labs.analytical.title')}</h2>
                        <p>
                            {t('labs.analytical.desc')}
                        </p>
                    </div>

                    {/* Biotechnology Laboratory */}
                    <div className="lab-section">
                        <h2>{t('labs.biotech.title')}</h2>
                        <p>
                            {t('labs.biotech.desc')}
                        </p>
                    </div>

                    {/* Biological Research Laboratory */}
                    <div className="lab-section">
                        <h2>{t('labs.biological.title')}</h2>
                        <p>
                            {t('labs.biological.desc')}
                        </p>
                    </div>

                    {/* Mission Statement */}
                    <div className="mission-section">
                        <p>
                            {t('mission')}
                        </p>
                    </div>

                    {/* Gallery Section */}
                    <div className="gallery-section">
                        <h2 className="section-title center">{t('facilities')}</h2>
                        <div className="gallery-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                <div key={num} className="gallery-item">
                                    <div className="image-placeholder">
                                        <Image 
                                            src={`/images/about/gallery/RD_${num}.webp`} 
                                            alt={`${t('title')} ${num}`} 
                                            fill
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <style jsx>{`
                .hero-section {
                    position: relative;
                    min-height: 40vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #142346 0%, #1a2f5c 100%);
                    color: white;
                    text-align: center;
                    padding: 4rem 0;
                }
                
                .hero-content {
                    position: relative;
                    z-index: 2;
                }
                
                .hero-title {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 1rem;
                    font-family: var(--font-heading);
                }
                
                .hero-subtitle {
                    font-size: 1.3rem;
                    opacity: 0.9;
                }

                .section {
                    padding: 4rem 0;
                }

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 2rem;
                }

                .section-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 1.5rem;
                    color: #142346;
                    font-family: var(--font-heading);
                }

                .section-title.center {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .intro-section {
                    margin-bottom: 3rem;
                }

                .intro-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    align-items: center;
                }

                .intro-text p {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #4a5568;
                }

                .image-placeholder {
                    position: relative;
                    width: 100%;
                    padding-bottom: 66%; /* 3:2 Aspect Ratio */
                    background-color: #f3f4f6;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .labs-section {
                    margin-bottom: 4rem;
                }

                .labs-section p {
                    font-size: 1.2rem;
                    line-height: 1.8;
                    color: #4a5568;
                    text-align: center;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .lab-section {
                    margin-bottom: 3rem;
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .lab-section h2 {
                    font-size: 1.5rem;
                    color: #142346;
                    margin-bottom: 1rem;
                    font-weight: 600;
                }

                .lab-section p {
                    font-size: 1.1rem;
                    line-height: 1.7;
                    color: #4a5568;
                }

                .mission-section {
                    margin: 4rem 0;
                    padding: 3rem;
                    background: #f8fafc;
                    border-radius: 1rem;
                    text-align: center;
                }

                .mission-section p {
                    font-size: 1.25rem;
                    line-height: 1.8;
                    color: #2d3748;
                    font-weight: 500;
                    font-style: italic;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .gallery-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: 2.5rem;
                    }
                    
                    .intro-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
