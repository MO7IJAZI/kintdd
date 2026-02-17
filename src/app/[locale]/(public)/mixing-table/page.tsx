import { FileDown } from "lucide-react";
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'MixingTable' });
  return {
    title: `${t('title')} | KINT`,
    description: t('description'),
  };
}

export default async function MixingTable() {
    const locale = await getLocale();
    const t = await getTranslations('MixingTable');
    const isRtl = locale === 'ar';
    const dir = isRtl ? 'rtl' : 'ltr';

    const prismaDocument = (prisma as unknown as { document: { findFirst: (args: unknown) => Promise<{ filePath: string } | null> } }).document;
    const document = await prismaDocument.findFirst({
        where: {
            category: 'mixing-table',
            isActive: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const pdfHref = document?.filePath || "/documents/optimum-conditions-foliar-treatments.pdf";

    return (
        <div className="section" dir={dir} style={{ minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t('title')} <span style={{ color: 'var(--primary)' }}>{t('year')}</span></h1>
                    <p style={{ fontSize: '1.1rem', color: 'var(--muted-foreground)' }}>
                        {t('description')}
                    </p>
                </div>

                {/* PDF Download Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #fce4e9 0%, #f8d7e1 100%)',
                    border: '2px solid #e9496c',
                    borderRadius: '1rem',
                    padding: '2rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            background: '#e9496c',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FileDown size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 700, color: '#991b1b', marginBottom: '0.25rem', fontSize: '1.1rem' }}>{t('downloadBoxTitle')}</h3>
                            <p style={{ fontSize: '0.875rem', color: '#b91c1c' }}>{t('downloadBoxDesc')}</p>
                        </div>
                    </div>
                    <a
                        href={pdfHref}
                        download
                        style={{
                            background: '#d63d5c',
                            color: 'white',
                            padding: '0.875rem 1.75rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem'
                        }}
                    >
                        <FileDown size={20} />
                        {t('downloadBtn')}
                    </a>
                </div>
            </div>
        </div>
    );
}
