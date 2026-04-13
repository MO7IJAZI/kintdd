import { getExpertArticles } from "@/actions/expertArticleActions";
import { Link } from '@/navigation';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

interface Article {
    title: string;
    title_ar?: string | null;
    excerpt?: string | null;
    excerpt_ar?: string | null;
    image?: string | null;
    slug: string;
}

function ArticleCard({ article, locale, t }: { article: Article, locale: string, t: any }) {
    const isRtl = locale === 'ar';
    // @ts-ignore
    const title = (isRtl && article.title_ar) ? article.title_ar : article.title;
    // @ts-ignore
    const excerpt = (isRtl && article.excerpt_ar) ? article.excerpt_ar : article.excerpt;

    return (
        <div className="article-card">
            <div className="article-card-image">
                {article.image ? (
                    <Image
                        src={article.image}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        No Image
                    </div>
                )}
            </div>
            <div className="article-card-content">
                <h3 className="article-card-title">
                    {title}
                </h3>
                <p className="article-card-excerpt">
                    {excerpt}
                </p>
                <Link
                    href={{pathname: '/experts-forum/[slug]', params: {slug: article.slug}}}
                    className="article-card-link"
                >
                    {t('readMore')}
                    {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </Link>
            </div>
        </div>
    );
}

export default async function ExpertsForumPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('ExpertsForum');
    const isRtl = locale === 'ar';
    const articles = await getExpertArticles();
    const publishedArticles = articles.filter((a: any) => a.isPublished);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }} dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Hero Header */}
            <div style={{
                background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 50%, #b91c1c 100%)',
                padding: '4rem 0',
                color: 'white'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>
                        {t('title')}
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#a7f3d0', maxWidth: '600px', lineHeight: 1.6 }}>
                        {t('subtitle')}
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {publishedArticles.map((article: any) => (
                        <ArticleCard key={article.slug} article={article} locale={locale} t={t} />
                    ))}
                </div>
                
                {publishedArticles.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <p>{t('noArticles')}</p>
                     </div>
                )}

            </div>
        </div>
    );
}
