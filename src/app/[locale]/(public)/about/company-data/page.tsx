import { getTranslations, getLocale } from 'next-intl/server';
import { getCompanyData } from '@/actions/companyDataActions';
import CompanyDataView from '@/components/about/CompanyDataView';

export default async function CompanyDataPage() {
    const t = await getTranslations('CompanyData');
    const locale = await getLocale();
    const isRtl = locale === 'ar';
    const companyData = await getCompanyData();
    
    const translations = {
        title: t('title'),
        subtitle: t('subtitle'),
        ncr: t('ncr'),
        vat: t('vat'),
        capital: t('capital'),
        addressFallback: t('address'),
        courtFallback: t('court')
    };

    return <CompanyDataView companyData={companyData} translations={translations} isRtl={isRtl} />;
}
