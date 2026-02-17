import ExpertArticleForm from "@/components/admin/ExpertArticleForm";
import { getTranslations } from "next-intl/server";

export default async function NewExpertArticlePage() {
    const t = await getTranslations('AdminExpertArticles');

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{t('newTitle')}</h1>
            <ExpertArticleForm />
        </div>
    );
}
