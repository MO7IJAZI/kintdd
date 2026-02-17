'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function RdCentrePage() {
    const t = useTranslations('RdCentre');
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
                                        src="/images/about/rd-top.webp" 
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
                        <h2>{t('formulationLab.title')}</h2>
                        <p>
                            {t('formulationLab.desc')}
                        </p>
                    </div>

                    {/* Analytical Laboratory */}
                    <div className="lab-section">
                        <h2>{t('analyticalLab.title')}</h2>
                        <p>
                            {t('analyticalLab.desc')}
                        </p>
                    </div>

                    {/* Biotechnology Laboratory */}
                    <div className="lab-section">
                        <h2>{t('biotechLab.title')}</h2>
                        <p>
                            {t('biotechLab.desc')}
                        </p>
                    </div>

                    {/* Biological Research Laboratory */}
                    <div className="lab-section">
                        <h2>{t('biologicalLab.title')}</h2>
                        <p>
                            {t('biologicalLab.desc')}
                        </p>
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

                .intro-section {
                    margin-bottom: 4rem;
                }

                .intro-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4rem;
                    align-items: center;
                }

                .section-title {
                    color: #142346;
                    font-size: 2.5rem;
                    margin-bottom: 1.5rem;
                    font-family: var(--font-heading);
                }

                .intro-text p {
                    color: #4a5568;
                    line-height: 1.8;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                .image-placeholder {
                    position: relative;
                    width: 100%;
                    height: 400px;
                    background: #f0f4f8;
                    border-radius: 1rem;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }

                .labs-section {
                    max-width: 800px;
                    margin: 0 auto 4rem;
                    text-align: center;
                }

                .labs-section p {
                    font-size: 1.2rem;
                    color: #2d3748;
                    line-height: 1.8;
                }

                .lab-section {
                    background: white;
                    padding: 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.3s ease;
                }

                .lab-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .lab-section h2 {
                    color: #1a73e8;
                    font-size: 1.8rem;
                    margin-bottom: 1rem;
                    font-family: var(--font-heading);
                }

                .lab-section p {
                    color: #4a5568;
                    line-height: 1.7;
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .intro-grid {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }

                    .hero-title {
                        font-size: 2.5rem;
                    }

                    .image-placeholder {
                        height: 300px;
                    }
                }
            `}</style>
        </div>
    );
}
