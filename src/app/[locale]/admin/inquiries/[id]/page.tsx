import Link from "next/link";
import { notFound } from "next/navigation";
import { getInquiry, markAsRead } from "@/actions/inquiryActions";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminInquiryDetails({ params }: { params: { locale: string; id: string } }) {
    const inquiry = await getInquiry(params.id);
    if (!inquiry) {
        notFound();
    }

    if (!inquiry.isRead) {
        await markAsRead(params.id);
    }

    const t = await getTranslations('AdminInquiries');

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <Link
                    href={`/${params.locale}/admin/inquiries`}
                    style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}
                >
                    ← {t('back')}
                </Link>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('detailsTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
            </div>

            <div className="card" style={{ overflow: 'hidden', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                        <strong>{t('sentAt')}</strong>
                        <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
                        <strong>{t('sender')}</strong>
                        <span>{inquiry.name}</span>
                        <strong>Email</strong>
                        <span>{inquiry.email}</span>
                        <strong>{t('phone')}</strong>
                        <span>{inquiry.phone || '-'}</span>
                        <strong>{t('department')}</strong>
                        <span>{inquiry.department || '-'}</span>
                        <strong>{t('subject')}</strong>
                        <span>{inquiry.subject || t('noSubject')}</span>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>{t('message')}</h2>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'var(--muted-foreground)', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '1rem', border: '1px solid var(--border)' }}>
                            {inquiry.message}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
