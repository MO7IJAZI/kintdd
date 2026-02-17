import JobOfferForm from "@/components/admin/JobOfferForm";
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function NewJobOfferPage() {
    const t = await getTranslations('AdminJobOfferForm');

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('createTitle')}</h1>
            </div>

            <JobOfferForm />
        </div>
    );
}
