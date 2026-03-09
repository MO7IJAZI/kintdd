import { Metadata } from 'next';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';
import prisma from '@/lib/prisma';
import { stripScripts } from "@/lib/sanitizeHtml";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isRtl = locale === 'ar';
  const page = await prisma.page.findUnique({ where: { slug: 'export-department' } });
  
  if (page) {
      const title = isRtl ? (page.title_ar || page.title) : page.title;
      return {
          title: `${title} | KINT`,
          description: title
      };
  }

  const t = await getTranslations({ locale, namespace: 'ExportDepartment' });
  return {
    title: `${t('title')} | KINT`,
    description: t('intro').substring(0, 160),
  };
}

export default async function ExportDepartmentPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ExportDepartment' });
  const isRtl = locale === 'ar';

  const page = await prisma.page.findUnique({ where: { slug: 'export-department' } });
  const title = page ? (isRtl ? (page.title_ar || page.title) : page.title) : t('title');
  const content = page ? (isRtl ? (page.content_ar || page.content) : page.content) : null;
  const safeContent = content ? stripScripts(content) : null;

  return (
    <div className="section" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>{title}</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem', alignItems: 'start' }}>
          <div className="card" style={{ padding: '2rem' }}>
            {safeContent ? (
                <div dangerouslySetInnerHTML={{ __html: safeContent }} className="prose" />
            ) : (
                <>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)', lineHeight: '1.7', marginBottom: '2rem' }}>
                        {t('intro')}
                    </p>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>{t('languagesTitle')}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Fallback hardcoded content */}
                    <div>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{t('english')}</h3>
                        <div dir="ltr" style={{ unicodeBidi: 'plaintext' }}>
                            <p style={{ color: 'var(--muted-foreground)' }}>+48 501 492 352 (Europe)</p>
                            <p style={{ color: 'var(--muted-foreground)' }}>+48 509 793 938 (North America)</p>
                            <p style={{ color: 'var(--muted-foreground)' }}>+48 514 438 191 (Latin America)</p>
                            <p style={{ color: 'var(--muted-foreground)' }}>+48 509 793 938</p>
                            <p style={{ color: 'var(--muted-foreground)' }}>+48 511 719 256 (Asia, Africa)</p>
                        </div>
                    </div>
                    {/* ... other languages ... */}
                    </div>
                </>
            )}
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('contactFormTitle')}</h2>
            <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
              {t('contactFormDesc')}
            </p>
            <Link href={{pathname: '/contact', query: {dept: 'export'}}} className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              {t('openFormBtn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
