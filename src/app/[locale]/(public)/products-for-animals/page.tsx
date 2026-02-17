import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';

export default async function ProductsForAnimalsPage() {
  const t = await getTranslations('ProductsForAnimals');
  const locale = await getLocale();
  const isRtl = locale === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <section className="section">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', color: 'var(--primary)', lineHeight: '1.1' }}>{t('title')}</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)', lineHeight: '1.8' }}>
              {t('description')}
            </p>
          </div>
          <div style={{ position: 'relative', height: '420px', borderRadius: '2rem', overflow: 'hidden' }}>
            <Image src="/images/animals-hero.png" alt={t('title')} fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ position: 'relative', height: '320px', borderRadius: '1.5rem', overflow: 'hidden' }}>
            <Image src="/images/animals-feature.bmp" alt="Animal nutrition" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem' }}>
            <Link href="/products-for-animals/poultry" className="card" style={{ padding: '2rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '72px', height: '72px', marginBottom: '1.25rem', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
                <Image src="/images/chk.jpg" alt={t('poultry.title')} fill style={{ objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('poultry.title')}</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>{t('poultry.description')}</p>
            </Link>

            <Link href="/products-for-animals/ruminants" className="card" style={{ padding: '2rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '72px', height: '72px', marginBottom: '1.25rem', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
                <Image src="/images/caow.jpg" alt={t('ruminants.title')} fill style={{ objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('ruminants.title')}</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>{t('ruminants.description')}</p>
            </Link>

            <Link href="/products-for-animals/swine" className="card" style={{ padding: '2rem', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '72px', height: '72px', marginBottom: '1.25rem', position: 'relative', borderRadius: '1rem', overflow: 'hidden' }}>
                <Image src="/images/pig.jpg" alt={t('swine.title')} fill style={{ objectFit: 'cover' }} />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{t('swine.title')}</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>{t('swine.description')}</p>
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '6rem 0', backgroundImage: "url('/images/about-bottom.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '720px', padding: '3rem', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: '1.5rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'white' }}>{t('aboutKint.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              {t('aboutKint.description')}
            </p>
            <Link href="/about" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              {t('aboutKint.button')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{t('commonIssues')}</h2>

          <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{t('poultry.title')}</h3>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>{t('poultry.coccidiosis')}</h4>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
              {t('poultry.coccidiosisDesc')}
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginTop: '1rem' }}>
              {t('poultry.coccidiosisSolution')}
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginTop: '1rem' }}>
              {t('poultry.coccidiosisMechanism')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/products-for-animals/poultry" className="btn btn-primary">{t('more')}</Link>
              <Link href="/contact" className="btn btn-outline">{t('contactUs')}</Link>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{t('ruminants.title')}</h3>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>{t('ruminants.ketosis')}</h4>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
              {t('ruminants.ketosisDesc')}
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginTop: '1rem' }}>
              {t('ruminants.ketosisStats')}
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginTop: '1rem' }}>
              {t('ruminants.ketosisSolution')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/products-for-animals/ruminants" className="btn btn-primary">{t('more')}</Link>
              <Link href="/contact" className="btn btn-outline">{t('contactUs')}</Link>
            </div>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            <h3 style={{ fontSize: '1.6rem', marginBottom: '0.5rem' }}>{t('swine.title')}</h3>
            <h4 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--primary)' }}>{t('swine.quickStart')}</h4>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7' }}>
              {t('swine.quickStartDesc')}
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginTop: '1rem' }}>
              {t('swine.quickStartSolution')}
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <Link href="/products-for-animals/swine" className="btn btn-primary">{t('more')}</Link>
              <Link href="/contact" className="btn btn-outline">{t('contactUs')}</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
