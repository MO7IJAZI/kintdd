import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Headquarter' });
  return {
    title: `${t('title')} | KINT`,
    description: t('title'), // Using title as description fallback since no specific desc key
  };
}

export default async function HeadquarterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Headquarter' });
  const isRtl = locale === 'ar';
  
  const headquarter = await prisma.headquarter.findFirst();

  const getEmbedUrl = () => {
    let q = '';
    if (headquarter?.latitude && headquarter?.longitude) {
      q = `${headquarter.latitude},${headquarter.longitude}`;
    } else if (headquarter?.address) {
      q = headquarter.address;
    }
    
    if (!q) return '';
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const title = isRtl ? (headquarter?.title_ar || headquarter?.title) : headquarter?.title;
  const content = isRtl ? (headquarter?.content_ar || headquarter?.content) : headquarter?.content;
  const address = isRtl ? (headquarter?.address_ar || headquarter?.address) : headquarter?.address;

  return (
    <div className="section" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            {title || t('title')}
          </h1>
          {content ? (
            <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
              {content}
            </p>
          ) : (
            <p style={{ color: 'var(--muted-foreground)' }}>{t('noInfo')}</p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {address && (
              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>📍 {t('addressLabel')}</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  {address}
                </p>
              </div>
            )}
          </div>

          <div className="card" style={{ overflow: 'hidden', height: '420px' }}>
            {getEmbedUrl() ? (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={getEmbedUrl()}
                allowFullScreen
                title={t('title')}
              ></iframe>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)' }}>
                {t('noMap')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
