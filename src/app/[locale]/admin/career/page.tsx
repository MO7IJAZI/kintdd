import { getAllJobOffers } from "@/actions/jobOfferActions";
import { Link } from '@/navigation';
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from 'next-intl/server';
import { Plus } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function CareerAdminPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('AdminCareer');
    const tCommon = await getTranslations('AdminCommon');
    const jobOffers = await getAllJobOffers();

    const getLocalizedContent = (en: string | null | undefined, ar: string | null | undefined) => {
        if (locale === 'ar' && ar) return ar;
        return en;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                </div>
                <Link href="/admin/career/new" className="btn btn-primary" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    background: 'linear-gradient(135deg, #e9496c 0%, #d63d5c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    textDecoration: 'none'
                }}>
                    <Plus size={18} />
                    {t('addJob')}
                </Link>
            </div>

            <div className="card" style={{ overflow: 'hidden', background: 'white', borderRadius: '1rem', padding: '1.5rem', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('jobOffers')}</th> 
                            <th style={{ padding: '1rem 1.5rem' }}>{t('location')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('workType')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{tCommon('status')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{tCommon('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobOffers.map((offer: any) => (
                            <tr key={offer.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ fontWeight: '600' }}>{getLocalizedContent(offer.title, offer.title_ar)}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {getLocalizedContent(offer.location, offer.location_ar)}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {getLocalizedContent(offer.workType, offer.workType_ar)}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        backgroundColor: offer.isActive ? '#ecfdf5' : '#fff1f2',
                                        color: offer.isActive ? '#059669' : '#e11d48'
                                    }}>
                                        {offer.isActive ? t('active') : t('inactive')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <Link href={{pathname: '/admin/career/[id]', params: {id: offer.id}}} style={{ color: 'var(--primary)', fontWeight: '600', marginRight: '1rem' }}>
                                        {tCommon('edit')}
                                    </Link>
                                    <DeleteButton id={offer.id} type="job-offer" />
                                </td>
                            </tr>
                        ))}
                        {jobOffers.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('noJobs')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
