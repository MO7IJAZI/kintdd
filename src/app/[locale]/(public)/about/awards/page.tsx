import prisma from '@/lib/prisma';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return {
    title: `${t('awardsTitle')} | KINT`,
    description: t('awardsSubtitle'),
  };
}

export default async function AwardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });
  const isRtl = locale === 'ar';
  
  const awards = await prisma.award.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className={`about-page certificates-page ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t('awardsTitle')}</h1>
            <p className="hero-subtitle">
              {t('awardsSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section">
        <div className="container">
          {/* Awards Gallery */}
          {awards.length > 0 ? (
            <div className="certificates-gallery-section">
              <div className="certificate-gallery">
                {awards.map((award: any) => (
                  <div key={award.id} className="gallery-item">
                    <div className="gallery-image">
                      <Image 
                        src={award.imageUrl} 
                        alt={isRtl && award.title_ar ? award.title_ar : award.title}
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    <div className="gallery-overlay">
                      <span className="gallery-title">{isRtl && award.title_ar ? award.title_ar : award.title}</span>
                      {(isRtl && award.description_ar ? award.description_ar : award.description) && (
                        <p className="gallery-description">
                          {isRtl && award.description_ar ? award.description_ar : award.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ color: '#666' }}>{t('noAwards')}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
