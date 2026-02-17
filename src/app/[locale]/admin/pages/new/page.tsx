import PageForm from "@/components/admin/PageForm";
import { getTranslations } from 'next-intl/server';

export default async function NewPage() {
    const t = await getTranslations('AdminPages');
    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('createTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('createDescription')}</p>
            </div>

            <PageForm />
        </div>
    );
}
