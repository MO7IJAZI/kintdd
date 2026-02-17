'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function ProductionPlantsPage() {
    const t = useTranslations('ProductionPlants');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const productsList = t.raw('products.list') as string[];
    const facilitiesList = t.raw('facilities.list') as string[];

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
                                        src="/images/about/production.jpg" 
                                        alt={t('title')}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manufactured Products */}
                    <div className="content-section">
                        <h2>{t('products.title')}</h2>
                        <p>{t('products.desc')}</p>
                        <ul className="product-list">
                            {productsList.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Production Facilities */}
                    <div className="content-section">
                        <h2>{t('facilities.title')}</h2>
                        <p>{t('facilities.desc')}</p>
                        <ul className="product-list">
                            {facilitiesList.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Production Capabilities */}
                    <div className="capability-section">
                        <p>
                            {t('capabilities')}
                        </p>
                    </div>

                    {/* Quality & Safety */}
                    <div className="quality-section">
                        <p>
                            {t('quality')}
                        </p>
                    </div>

                    {/* Gallery Section */}
                    <div className="gallery-section">
                        {/* Gallery implementation can be added here later */}
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
                }

                .content-section h2 {
                    color: #1a73e8;
                    font-size: 1.8rem;
                    margin-bottom: 1.5rem;
                    font-family: var(--font-heading);
                }

                .content-section p {
                    color: #4a5568;
                    font-size: 1.1rem;
                    margin-bottom: 1.5rem;
                }

                .product-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .product-list li {
                    position: relative;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                    color: #2d3748;
                    font-size: 1.1rem;
                    line-height: 1.6;
                }

                .product-list li::before {
                    content: "•";
                    color: #1a73e8;
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                
                [dir="rtl"] .product-list li {
                    padding-left: 0;
                    padding-right: 1.5rem;
                }
                
                [dir="rtl"] .product-list li::before {
                    left: auto;
                    right: 0;
                }

                .capability-section, .quality-section {
                    background: #f8fafc;
                    padding: 3rem;
                    border-radius: 1rem;
                    margin-bottom: 2rem;
                    border-left: 4px solid #1a73e8;
                }
                
                [dir="rtl"] .capability-section, 
                [dir="rtl"] .quality-section {
                    border-left: none;
                    border-right: 4px solid #1a73e8;
                }

                .capability-section p, .quality-section p {
                    color: #2d3748;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    margin: 0;
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
