import { Metadata } from 'next';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LocalRepresentatives' });
  return {
    title: `${t('title')} | KINT`,
    description: t('intro').substring(0, 160),
  };
}

export default async function LocalRepresentativesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'LocalRepresentatives' });
  const isRtl = locale === 'ar';

  return (
    <div className="section" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>{t('title')}</h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
            {t('intro')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('countriesTitle')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('ukraine')}</h3>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+380 67 360 6777</p>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+380 67 467 2378</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('latvia')}</h3>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+371 28 663 126</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('romania')}</h3>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+40 722 572 537</p>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+40 743 488 021</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('brazil')}</h3>
                <p dir="ltr" style={{ color: 'var(--muted-foreground)', unicodeBidi: 'plaintext' }}>+55 14 997 656 969</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('contactFormTitle')}</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              {t('contactFormDesc')}
            </p>
            <Link href={{pathname: '/contact', query: {dept: 'local'}}} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              {t('openFormBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
