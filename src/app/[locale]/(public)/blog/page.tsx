import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Blog');
    const tExpert = await getTranslations('ExpertArticles');
    const isRtl = locale === 'ar';

    // Fetch Blog Posts
    const posts = await prisma.blogPost.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' }
    });

    // Fetch Expert Articles
    const expertArticles = await prisma.expertArticle.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: 'desc' }
    });

    return (
        <div className="section" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container">
                <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', maxWidth: '800px', margin: '0 auto' }}>
                        {t('subtitle')}
                    </p>
                </div>

                {/* Expert Articles Section */}
                {expertArticles.length > 0 && (
                    <div style={{ marginBottom: '5rem' }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '1rem', 
                            marginBottom: '2.5rem',
                            borderBottom: '2px solid #e2e8f0',
                            paddingBottom: '1rem'
                        }}>
                            <span style={{ fontSize: '2rem' }}>🎓</span>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{tExpert('title')}</h2>
                        </div>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {expertArticles.map((article: any) => {
                                const title = (isRtl && article.title_ar) ? article.title_ar : article.title;
                                const excerpt = (isRtl && article.excerpt_ar) ? article.excerpt_ar : article.excerpt;

                                return (
                                    <Link 
                                        key={article.id} 
                                        href={{ pathname: '/experts-forum/[slug]', params: { slug: article.slug } }}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                                            <div style={{ position: 'relative', height: '220px' }}>
                                                <Image 
                                                    src={article.image || '/images/hero.png'} 
                                                    alt={title} 
                                                    fill 
                                                    style={{ objectFit: 'cover' }} 
                                                />
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '1rem', 
                                                    left: isRtl ? 'auto' : '1rem', 
                                                    right: isRtl ? '1rem' : 'auto',
                                                    backgroundColor: '#10b981', 
                                                    color: 'white', 
                                                    padding: '0.25rem 0.75rem', 
                                                    borderRadius: '1rem',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    🎓 {tExpert('badge')}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ color: '#10b981', fontWeight: '600', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                                                    {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                                </div>
                                                <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', lineHeight: '1.3', color: '#1e293b' }}>{title}</h3>
                                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>
                                                    {excerpt?.substring(0, 120)}...
                                                </p>
                                                <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                                                    {t('readMore')} →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Blog Posts Section */}
                <div>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem', 
                        marginBottom: '2.5rem',
                        borderBottom: '2px solid #e2e8f0',
                        paddingBottom: '1rem'
                    }}>
                        <span style={{ fontSize: '2rem' }}>📝</span>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{t('blogPosts')}</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '3rem' }}>
                        {posts.map((post: any) => {
                            const title = (isRtl && post.title_ar) ? post.title_ar : post.title;
                            const excerpt = (isRtl && post.excerpt_ar) ? post.excerpt_ar : post.excerpt;

                            return (
                                <div key={post.id} className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 2fr', gap: '0', overflow: 'hidden' }}>
                                    <div style={{ position: 'relative', height: '100%', minHeight: '350px' }}>
                                        <Image src={post.image || '/images/hero.png'} alt={title} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ""} | {t('by')} {post.author}
                                        </div>
                                        <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{title}</h2>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                                            {excerpt}
                                        </p>
                                        <Link href={{pathname: '/blog/[slug]', params: {slug: post.slug}}} className="btn btn-primary" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start', padding: '0.8rem 2rem' }}>
                                            {t('readMore')}
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                        {posts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted-foreground)' }}>
                                {t('noArticles')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
