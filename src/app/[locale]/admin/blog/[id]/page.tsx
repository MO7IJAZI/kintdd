import { getBlogPostById } from "@/actions/blogActions";
import BlogForm from "@/components/admin/BlogForm";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getBlogPostById(id);
    const t = await getTranslations('AdminBlog');

    if (!post) {
        notFound();
    }

    return (
        <div>
            <div style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('editTitle')}</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>{t('editSubtitle')}</p>
            </div>

            <BlogForm initialData={post} />
        </div>
    );
}
