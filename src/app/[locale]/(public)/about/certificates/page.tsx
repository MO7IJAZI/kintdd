import prisma from '@/lib/prisma';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'About' });
    return {
        title: `${t('certificatesTitle')} | KINT`,
        description: t('certificatesSubtitle'),
    };
}

export default async function CertificatesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'About' });
    const isRtl = locale === 'ar';

    const certificates = await prisma.certificate.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
    });

    return (
        <div className={`about-page certificates-page ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">{t('certificatesTitle')}</h1>
                        <p className="hero-subtitle">
                            {t('certificatesSubtitle')}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="section">
                <div className="container">
                    {/* Certificate Gallery */}
                    {certificates.length > 0 ? (
                        <div className="certificates-gallery-section">
                            <div className="certificate-gallery">
                                {certificates.map((cert: any) => (
                                    <div key={cert.id} className="gallery-item">
                                        <div className="gallery-image">
                                            <Image 
                                                src={cert.imageUrl} 
                                                alt={isRtl && cert.title_ar ? cert.title_ar : cert.title}
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                        <div className="gallery-overlay">
                                            <span className="gallery-title">{isRtl && cert.title_ar ? cert.title_ar : cert.title}</span>
                                            {(isRtl && cert.description_ar ? cert.description_ar : cert.description) && (
                                                <p className="gallery-description">
                                                    {isRtl && cert.description_ar ? cert.description_ar : cert.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <p style={{ color: '#666' }}>{t('noCertificates')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
