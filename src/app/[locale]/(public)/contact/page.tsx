import ContactForm from "@/components/ContactForm";
import { Suspense } from "react";
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Contact');
    const tPage = await getTranslations('ContactPage');
    const isAr = locale === 'ar';

    return (
        <div className="section" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '6rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3.5rem', marginBottom: '2rem', lineHeight: '1' }}>
                            {tPage('titlePart1')} <br /><span style={{ color: 'var(--primary)' }}>{tPage('titlePart2')}</span>
                        </h1>
                        <p style={{ fontSize: '1.2rem', color: 'var(--muted-foreground)', marginBottom: '3.5rem', lineHeight: '1.7' }}>
                            {t('contactIntro')}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>📍</div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('globalHeadquarters')}</h4>
                                    <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.5' }}>
                                        {t('addressPoland')}
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>📧</div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('directContact')}</h4>
                                    <p style={{ color: 'var(--muted-foreground)' }}>
                                        {t('generalInquiries')}: <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>info@kint-group.com</span>
                                    </p>
                                    <p style={{ color: 'var(--muted-foreground)' }}>
                                        {t('exportDept')}: <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>export@kint-group.com</span>
                                    </p>
                                    <p style={{ color: 'var(--muted-foreground)' }}>
                                        {t('support')}: <span dir="ltr" style={{ unicodeBidi: 'plaintext' }}>+48 12 345 67 89</span>
                                    </p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '2rem' }}>⏰</div>
                                <div>
                                    <h4 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{t('businessHours')}</h4>
                                    <p style={{ color: 'var(--muted-foreground)' }}>{t('monFri')}</p>
                                    <p style={{ color: 'var(--muted-foreground)' }}>{t('weekendClosed')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '4rem', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.75rem', marginBottom: '2.5rem' }}>{t('sendInquiry')}</h3>
                        <Suspense fallback={<div>Loading form...</div>}>
                            <ContactForm />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}
