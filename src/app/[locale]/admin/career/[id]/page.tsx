import { getJobOfferById } from "@/actions/jobOfferActions";
import JobOfferForm from "@/components/admin/JobOfferForm";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export default async function EditJobOfferPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const t = await getTranslations('AdminJobOfferForm');
    const jobOffer = await getJobOfferById(id);

    if (!jobOffer) {
        notFound();
    }

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('editTitle')}</h1>
            </div>

            <JobOfferForm jobOffer={jobOffer} />
        </div>
    );
}
