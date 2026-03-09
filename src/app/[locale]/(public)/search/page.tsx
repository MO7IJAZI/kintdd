import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { Search } from 'lucide-react';

export const revalidate = 0; // Search results should be dynamic

export default async function SearchPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q: string }>;
}) {
    const { locale } = await params;
    const { q } = await searchParams;
    const t = await getTranslations('Search');
    const tNav = await getTranslations('Navigation');
    const isAr = locale === 'ar';

    const query = q || '';

    let products: any[] = [];
    let categories: any[] = [];
    let crops: any[] = [];
    let blogPosts: any[] = [];
    let expertArticles: any[] = [];
    let pages: any[] = [];

    if (query) {
        try {
            [products, categories, crops, blogPosts, expertArticles, pages] = await Promise.all([
                prisma.product.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { name: { contains: query } },
                            { name_ar: { contains: query } },
                            { description: { contains: query } },
                            { description_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        name_ar: true,
                        slug: true,
                        image: true,
                        shortDesc: true,
                        shortDesc_ar: true,
                        description: true,
                        description_ar: true
                    }
                }),
                prisma.category.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { name: { contains: query } },
                            { name_ar: { contains: query } },
                            { description: { contains: query } },
                            { description_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        name_ar: true,
                        slug: true,
                        description: true,
                        description_ar: true,
                        image: true,
                    }
                }),
                prisma.crop.findMany({
                    where: {
                        OR: [
                            { name: { contains: query } },
                            { name_ar: { contains: query } },
                            { description: { contains: query } },
                            { description_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        name: true,
                        name_ar: true,
                        slug: true,
                        image: true,
                        description: true,
                        description_ar: true,
                    }
                }),
                prisma.blogPost.findMany({
                    where: {
                        isPublished: true,
                        OR: [
                            { title: { contains: query } },
                            { title_ar: { contains: query } },
                            { excerpt: { contains: query } },
                            { excerpt_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        title: true,
                        title_ar: true,
                        slug: true,
                        image: true,
                        excerpt: true,
                        excerpt_ar: true,
                    }
                }),
                prisma.expertArticle.findMany({
                    where: {
                        isPublished: true,
                        OR: [
                            { title: { contains: query } },
                            { title_ar: { contains: query } },
                            { excerpt: { contains: query } },
                            { excerpt_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        title: true,
                        title_ar: true,
                        slug: true,
                        image: true,
                        excerpt: true,
                        excerpt_ar: true,
                    }
                }),
                prisma.page.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { title: { contains: query } },
                            { title_ar: { contains: query } },
                            { content: { contains: query } },
                            { content_ar: { contains: query } },
                        ]
                    },
                    select: {
                        id: true,
                        title: true,
                        title_ar: true,
                        slug: true,
                    }
                }),
            ]);
        } catch (error) {
            console.error("Search error:", error);
        }
    }

    const totalCount =
        products.length +
        categories.length +
        crops.length +
        blogPosts.length +
        expertArticles.length +
        pages.length;

    const sectionTitleStyle = { fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' } as const;
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' } as const;

    return (
        <div className="section" style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '60vh', padding: '4rem 0' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Search size={32} />
                        {t('title')} &quot;{query}&quot;
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                        {totalCount > 0 
                            ? t('resultsFound', { count: totalCount, query }) 
                            : t('noResults', { query })
                        }
                    </p>
                </div>

                {products.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={sectionTitleStyle}>{t('products')}</h2>
                        <div style={gridStyle}>
                        {products.map((product) => {
                             const pName = (isAr && product.name_ar) ? product.name_ar : product.name;
                             const pShortDesc = (isAr && product.shortDesc_ar) ? product.shortDesc_ar : product.shortDesc;
                             const pDesc = (isAr && product.description_ar) ? product.description_ar : product.description;
                             
                             return (
                                <Link key={product.id} href={`/product/${product.slug}`} className="card">
                                    <div style={{ position: 'relative', height: '250px', backgroundColor: '#fff' }}>
                                        <Image
                                            src={product.image || '/images/cat-biostimulants.png'}
                                            alt={pName}
                                            fill
                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{pName}</h3>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {pShortDesc || (pDesc ? pDesc.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '')}
                                        </p>
                                        <div style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                            {tNav('viewDetails')} {isAr ? '←' : '→'}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                        </div>
                    </div>
                )}

                {categories.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={sectionTitleStyle}>{t('categories')}</h2>
                        <div style={gridStyle}>
                            {categories.map((category) => {
                                const name = (isAr && category.name_ar) ? category.name_ar : category.name;
                                const desc = (isAr && category.description_ar) ? category.description_ar : category.description;
                                return (
                                    <Link key={category.id} href={`/product-category/${category.slug}`} className="card">
                                        <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff' }}>
                                            <Image
                                                src={category.image || '/images/cat-biostimulants.png'}
                                                alt={name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem' }}>{name}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                                {desc || ''}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {crops.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={sectionTitleStyle}>{t('crops')}</h2>
                        <div style={gridStyle}>
                            {crops.map((crop) => {
                                const name = (isAr && crop.name_ar) ? crop.name_ar : crop.name;
                                const desc = (isAr && crop.description_ar) ? crop.description_ar : crop.description;
                                return (
                                    <Link key={crop.id} href={`/crops/${crop.slug}`} className="card">
                                        <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff' }}>
                                            <Image
                                                src={crop.image || '/images/cat-biostimulants.png'}
                                                alt={name}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem' }}>{name}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                                {(desc || '').replace(/<[^>]*>?/gm, '').substring(0, 120)}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {blogPosts.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={sectionTitleStyle}>{t('blogPosts')}</h2>
                        <div style={gridStyle}>
                            {blogPosts.map((post) => {
                                const title = (isAr && post.title_ar) ? post.title_ar : post.title;
                                const excerpt = (isAr && post.excerpt_ar) ? post.excerpt_ar : post.excerpt;
                                return (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="card">
                                        <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff' }}>
                                            <Image
                                                src={post.image || '/images/cat-biostimulants.png'}
                                                alt={title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                                {excerpt || ''}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {expertArticles.length > 0 && (
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={sectionTitleStyle}>{t('expertArticles')}</h2>
                        <div style={gridStyle}>
                            {expertArticles.map((article) => {
                                const title = (isAr && article.title_ar) ? article.title_ar : article.title;
                                const excerpt = (isAr && article.excerpt_ar) ? article.excerpt_ar : article.excerpt;
                                return (
                                    <Link key={article.id} href={`/experts-forum/${article.slug}`} className="card">
                                        <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff' }}>
                                            <Image
                                                src={article.image || '/images/cat-biostimulants.png'}
                                                alt={title}
                                                fill
                                                style={{ objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem' }}>{title}</h3>
                                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                                                {excerpt || ''}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {pages.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                        <h2 style={sectionTitleStyle}>{t('pages')}</h2>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {pages.map((page) => {
                                const title = (isAr && page.title_ar) ? page.title_ar : page.title;
                                return (
                                    <Link
                                        key={page.id}
                                        href={`/page/${page.slug}`}
                                        className="card"
                                        style={{ padding: '1rem 1.25rem', textDecoration: 'none' }}
                                    >
                                        <div style={{ color: 'var(--secondary)', fontWeight: 700 }}>{title}</div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
