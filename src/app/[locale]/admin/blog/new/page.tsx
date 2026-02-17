import BlogForm from "@/components/admin/BlogForm";
import { getTranslations } from 'next-intl/server';

export default async function NewBlogPage() {
    const t = await getTranslations('AdminBlog');

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('newTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('newSubtitle')}</p>
            </div>

            <BlogForm />
        </div>
    );
}
