import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations('Blog');
    const isRtl = locale === 'ar';

    const posts = await prisma.blogPost.findMany({
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

                <div style={{ display: 'grid', gap: '3rem' }}>
                    {posts.map((post: any) => {
                        // Fallback to English if Arabic is missing
                        // @ts-ignore
                        const title = (isRtl && post.title_ar) ? post.title_ar : post.title;
                        // @ts-ignore
                        const excerpt = (isRtl && post.excerpt_ar) ? post.excerpt_ar : post.excerpt;

                        return (
                            <div key={post.id} className="card" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.2fr) 2fr', gap: '0', overflow: 'hidden' }}>
                                <div style={{ position: 'relative', height: '100%', minHeight: '350px' }}>
                                    <Image src={post.image || '/images/hero.png'} alt={title} fill style={{ objectFit: 'cover' }} />
                                </div>
                                <div style={{ padding: '3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem', fontSize: '0.875rem' }}>
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : ""} | {t('by')} {post.author}
                                    </div>
                                    <h2 style={{ fontSize: '2.25rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{title}</h2>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
                                        {excerpt}
                                    </p>
                                    <Link href={`/blog/${post.slug}`} className="btn btn-primary" style={{ alignSelf: isRtl ? 'flex-end' : 'flex-start', padding: '0.8rem 2rem' }}>
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
    );
}
