import { getPageById } from "@/actions/pageActions";
import PageForm from "@/components/admin/PageForm";
import { getTranslations } from 'next-intl/server';

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
    const t = await getTranslations('AdminPages');
    const { id } = await params;
    const page = await getPageById(id);

    if (!page) {
        return (
            <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('notFoundTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('notFoundDescription')}</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('editTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('editDescription')}</p>
            </div>

            <PageForm initialData={page} />
        </div>
    );
}
