import { getExpertArticles } from "@/actions/expertArticleActions";
import { Link } from '@/navigation';
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from "next-intl/server";

export const dynamic = 'force-dynamic';

interface ExpertArticleRow {
    id: string;
    title: string;
    slug: string;
    category: string;
    order: number;
    isPublished: boolean;
}

export default async function AdminExpertArticles() {
    const articles = await getExpertArticles();
    const t = await getTranslations('AdminExpertArticles');
    const tForm = await getTranslations('AdminExpertArticleForm');

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('description')}</p>
                </div>
                <Link href="/admin/expert-articles/new" className="btn btn-primary">
                    {t('newArticle')}
                </Link>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('tableTitle')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('tableCategory')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('tableOrder')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('tableStatus')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{t('tableActions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article: ExpertArticleRow) => (
                            <tr key={article.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ fontWeight: '600' }}>{article.title}</div>
                                    <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{article.slug}</div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textTransform: 'capitalize' }}>
                                    {tForm(`categories.${article.category}` as any)}
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>{article.order}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '1rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        backgroundColor: article.isPublished ? '#ecfdf5' : '#f3f4f6',
                                        color: article.isPublished ? '#059669' : '#6b7280'
                                    }}>
                                        {article.isPublished ? t('statusPublished') : t('statusDraft')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <Link href={{pathname: '/admin/expert-articles/[id]', params: {id: article.id}}} style={{ color: 'var(--primary)', fontWeight: '600', marginRight: '1rem' }}>{t('edit')}</Link>
                                    <DeleteButton id={article.id} type="expert-article" />
                                </td>
                            </tr>
                        ))}
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('noArticles')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
