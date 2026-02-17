import { getExpertArticlesByCategory } from "@/actions/expertArticleActions";
import { Link } from '@/navigation';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, Wheat, Apple, Carrot } from 'lucide-react';
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

function CategorySection({ 
    title, 
    icon, 
    articles, 
    color,
    locale,
    t
}: { 
    title: string; 
    icon: React.ReactNode; 
    articles: Article[]; 
    color: string;
    locale: string;
    t: any;
}) {
    if (articles.length === 0) return null;

    return (
        <section style={{ marginBottom: '4rem' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    background: color,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}>
                    {icon}
                </div>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1e293b'
                }}>
                    {title}
                </h2>
            </div>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} locale={locale} t={t} />
                ))}
            </div>
        </section>
    );
}

export default async function ExpertsForumPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('ExpertsForum');
    const isRtl = locale === 'ar';
    const { arable, fruit, vegetable } = await getExpertArticlesByCategory();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }} dir={isRtl ? 'rtl' : 'ltr'}>
            
            {/* Breadcrumb */}
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                        <Link href={`/`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('home')}</Link>
                        {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        <Link href={`/crop-farming`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('cropFarming')}</Link>
                        {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        <span style={{ color: '#e9496c', fontWeight: 600 }}>{t('title')}</span>
                    </nav>
                </div>
            </div>

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
                
                <CategorySection
                    title={t('arable')}
                    icon={<Wheat size={24} />}
                    articles={arable}
                    color="#d97706"
                    locale={locale}
                    t={t}
                />

                <CategorySection
                    title={t('fruit')}
                    icon={<Apple size={24} />}
                    articles={fruit}
                    color="#dc2626"
                    locale={locale}
                    t={t}
                />

                <CategorySection
                    title={t('vegetable')}
                    icon={<Carrot size={24} />}
                    articles={vegetable}
                    color="#16a34a"
                    locale={locale}
                    t={t}
                />
                
                {arable.length === 0 && fruit.length === 0 && vegetable.length === 0 && (
                     <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                        <p>{t('noArticles')}</p>
                     </div>
                )}

            </div>
        </div>
    );
}
