import { getCompanyData } from "@/actions/companyDataActions";
import CompanyDataForm from "@/components/admin/CompanyDataForm";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

export default async function AdminCompanyDataPage() {
    const t = await getTranslations('AdminCompanyData');
    const companyData = await getCompanyData();

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: '#1a202c', marginBottom: '0.5rem' }}>{t('title')}</h1>
                <p style={{ color: '#718096' }}>{t('subtitle')}</p>
            </div>

            <CompanyDataForm initialData={companyData} />
        </div>
    );
}
