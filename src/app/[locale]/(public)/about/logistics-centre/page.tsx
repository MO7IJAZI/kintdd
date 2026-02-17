'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function LogisticsCentrePage() {
    const t = useTranslations('LogisticsCentre');
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
                                    {t('intro1')}
                                </p>
                                <p>
                                    {t('intro2')}
                                </p>
                            </div>
                            <div className="intro-image">
                                <div className="image-placeholder">
                                    <Image 
                                        src="/images/about/factory.jpeg" 
                                        alt={t('title')}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Production Planning */}
                    <div className="content-section">
                        <p>
                            {t('planning')}
                        </p>
                    </div>

                    {/* Warehouse Areas */}
                    <div className="warehouse-section">
                        <h2>{t('warehouseAreas.title')}</h2>
                        
                        <div className="warehouse-grid">
                            <div className="warehouse-card">
                                <div className="warehouse-icon">📦</div>
                                <h3>{t('warehouseAreas.collection.title')}</h3>
                                <p>
                                    {t('warehouseAreas.collection.desc')}
                                </p>
                            </div>
                            
                            <div className="warehouse-card">
                                <div className="warehouse-icon">🏪</div>
                                <h3>{t('warehouseAreas.storage.title')}</h3>
                                <p>
                                    {t('warehouseAreas.storage.desc')}
                                </p>
                            </div>
                            
                            <div className="warehouse-card">
                                <div className="warehouse-icon">🚚</div>
                                <h3>{t('warehouseAreas.release.title')}</h3>
                                <p>
                                    {t('warehouseAreas.release.desc')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Loading Capacity */}
                    <div className="capacity-section">
                        <p>
                            {t('loading')}
                        </p>
                    </div>

                    {/* Process Optimization */}
                    <div className="optimization-section">
                        {/* Additional content can go here */}
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

                .content-section {
                    background: white;
                    padding: 3rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    margin-bottom: 2rem;
                    border: 1px solid #e2e8f0;
                    text-align: center;
                }

                .content-section p {
                    color: #4a5568;
                    font-size: 1.2rem;
                    line-height: 1.8;
                    margin: 0;
                }

                .warehouse-section {
                    margin-bottom: 4rem;
                }

                .warehouse-section h2 {
                    text-align: center;
                    color: #142346;
                    font-size: 2rem;
                    margin-bottom: 3rem;
                    font-family: var(--font-heading);
                }

                .warehouse-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 2rem;
                }

                .warehouse-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                    text-align: center;
                    border: 1px solid #e2e8f0;
                    transition: transform 0.3s ease;
                }

                .warehouse-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                }

                .warehouse-icon {
                    font-size: 3rem;
                    margin-bottom: 1.5rem;
                }

                .warehouse-card h3 {
                    color: #1a73e8;
                    font-size: 1.3rem;
                    margin-bottom: 1rem;
                    font-family: var(--font-heading);
                }

                .warehouse-card p {
                    color: #4a5568;
                    line-height: 1.6;
                }

                .capacity-section {
                    background: #f8fafc;
                    padding: 3rem;
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                    border-left: 4px solid #1a73e8;
                    text-align: center;
                }
                
                [dir="rtl"] .capacity-section {
                    border-left: none;
                    border-right: 4px solid #1a73e8;
                }

                .capacity-section p {
                    color: #2d3748;
                    font-size: 1.2rem;
                    line-height: 1.8;
                    margin: 0;
                }

                @media (max-width: 900px) {
                    .warehouse-grid {
                        grid-template-columns: 1fr;
                    }
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
