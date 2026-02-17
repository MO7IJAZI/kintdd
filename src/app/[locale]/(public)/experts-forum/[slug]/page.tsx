import { getExpertArticleBySlug } from "@/actions/expertArticleActions";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ChevronLeft } from "lucide-react";
import parse from 'html-react-parser';
import ArticleStyles from "./ArticleStyles";
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

// Utility to clean content and ensure proper wrapping
function preprocessContent(html: string) {
    if (!html) return "";

    // 1. Remove non-breaking spaces that prevent wrapping
    // 2. Add zero-width space after punctuation to allow line breaks if needed
    return html
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with normal space
        .replace(/([.,:;!?])(\s|$)/g, '$1&#8203;$2'); // Add ZWS after punctuation
}

export default async function ExpertArticlePage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const article = await getExpertArticleBySlug(slug);
    const t = await getTranslations('ExpertsForum');
    const isRtl = locale === 'ar';

    if (!article) {
        notFound();
    }

    const title = (isRtl && article.title_ar) ? article.title_ar : article.title;
    const content = (isRtl && article.content_ar) ? article.content_ar : article.content;
    const processedContent = preprocessContent(content || "");

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fff' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Breadcrumb */}
            <div style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <nav style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        color: '#64748b',
                        flexWrap: 'wrap'
                    }}>
                        <Link href={`/`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('home')}</Link>
                        {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        <Link href={`/crop-farming`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('cropFarming')}</Link>
                        {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        <Link href={`/experts-forum`} style={{ textDecoration: 'none', color: 'inherit' }}>{t('title')}</Link>
                        {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                        <span style={{
                            color: '#e9496c',
                            fontWeight: 600,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word'
                        }}>
                            {title}
                        </span>
                    </nav>
                </div>
            </div>

            <article className="section" style={{ padding: '4rem 0' }}>
                <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{
                            display: 'inline-block',
                            padding: '0.5rem 1rem',
                            backgroundColor: '#fce4e9',
                            color: '#e9496c',
                            borderRadius: '2rem',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            marginBottom: '1.5rem',
                            textTransform: 'capitalize',
                            wordBreak: 'normal',
                            whiteSpace: 'nowrap'
                        }}>
                            {t(article.category) || article.category}
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 800,
                            marginBottom: '1.5rem',
                            lineHeight: '1.2',
                            color: '#1e293b',
                            wordBreak: 'normal',
                            overflowWrap: 'break-word',
                            whiteSpace: 'normal'
                        }}>
                            {title}
                        </h1>
                        <div style={{ color: 'var(--muted-foreground)', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '1rem', flexWrap: 'wrap' }}>
                            <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US') : t('draft')}</span>
                        </div>
                    </div>

                    <div style={{ position: 'relative', height: '400px', borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '4rem', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        {article.image ? (
                            <Image
                                src={article.image}
                                alt={title || ""}
                                fill
                                style={{ objectFit: 'cover' }}
                                sizes="(max-width: 768px) 100vw, 1100px"
                                priority
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: '#e2e8f0' }} />
                        )}
                    </div>

                    {/* Article Content */}
                    <div className="article-box" style={{
                        overflow: 'hidden',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                    }}>
                        <div className="ql-snow" style={{ width: '100%' }}>
                            <div
                                className="ql-editor blog-content"
                                dir="auto"
                            >
                                {parse(processedContent)}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '5rem',
                        padding: '3rem',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '1.5rem',
                        textAlign: 'center',
                        border: '1px solid #dcfce7',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word'
                    }}>
                        <h3 style={{
                            marginBottom: '1rem',
                            color: '#166534',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            wordBreak: 'normal'
                        }}>
                            {t('questions')}
                        </h3>
                        <p style={{
                            color: '#15803d',
                            marginBottom: '2rem',
                            fontSize: '1.1rem',
                            wordBreak: 'normal'
                        }}>
                            {t('questionsDesc')}
                        </p>
                        <Link href={`/contact`} className="btn btn-primary">{t('contactExpert')}</Link>
                    </div>
                </div>
            </article>

            {/* Global Styles */}
            <ArticleStyles />
        </div>
    );
}
