import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const t = await getTranslations('Blog');
    const isRtl = locale === 'ar';

    const post = await prisma.blogPost.findUnique({
        where: { slug }
    });

    if (!post) {
        notFound();
    }

    // @ts-ignore
    const title = (isRtl && post.title_ar) ? post.title_ar : post.title;
    // @ts-ignore
    const content = (isRtl && post.content_ar) ? post.content_ar : post.content;

    return (
        <article className="section" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>
                        <Link href={`/blog`}>{t('backToBlog')}</Link>
                    </div>
                    <h1 style={{ 
                        fontSize: 'clamp(2rem, 8vw, 3.5rem)', 
                        marginBottom: '1.5rem', 
                        lineHeight: '1.1',
                        wordBreak: 'break-word'
                    }}>{title}</h1>
                    <div style={{ color: 'var(--muted-foreground)', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                        <span>{t('by')} <strong>{post.author}</strong></span>
                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') : t('draft')}</span>
                    </div>
                </div>

                <div style={{ position: 'relative', height: '500px', borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '4rem' }}>
                    <Image
                        src={post.image || '/images/hero.png'}
                        alt={title}
                        fill
                        style={{ objectFit: 'cover' }}
                    />
                </div>

                <div style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.8',
                    color: 'var(--foreground)',
                }} className="blog-content" dangerouslySetInnerHTML={{ __html: content }} />

                {post.tags && (() => {
                    try {
                        const tags = JSON.parse(post.tags);
                        if (Array.isArray(tags) && tags.length > 0) {
                            return (
                                <div style={{ marginTop: '3rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {tags.map((tag: string, index: number) => (
                                        <span key={index} style={{ 
                                            backgroundColor: '#f3f4f6', 
                                            padding: '0.5rem 1rem', 
                                            borderRadius: '2rem', 
                                            fontSize: '0.9rem',
                                            color: 'var(--muted-foreground)'
                                        }}>
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            );
                        }
                    } catch {
                        return null;
                    }
                })()}

                <div style={{ marginTop: '5rem', padding: '3rem', backgroundColor: '#f9fafb', borderRadius: '1.5rem', textAlign: 'center' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{t('related')}</h3>
                    <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
                        {t('relatedDesc')}
                    </p>
                    <Link href={`/contact`} className="btn btn-primary">{t('contactExpert')}</Link>
                </div>
            </div>
        </article>
    );
}
