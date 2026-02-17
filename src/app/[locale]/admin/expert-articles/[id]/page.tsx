import { getExpertArticleById } from "@/actions/expertArticleActions";
import ExpertArticleForm from "@/components/admin/ExpertArticleForm";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

export default async function EditExpertArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const article = await getExpertArticleById(id);
    const t = await getTranslations('AdminExpertArticles');

    if (!article) {
        notFound();
    }

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('editTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('editDescription')}</p>
            </div>

            <ExpertArticleForm initialData={article} />
        </div>
    );
}
