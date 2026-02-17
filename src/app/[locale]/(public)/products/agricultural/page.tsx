import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Sprout } from 'lucide-react';

export const revalidate = 300;

export default async function AgriculturalProductsPage() {
    const locale = await getLocale();
    const t = await getTranslations('Product');
    const tNav = await getTranslations('Navigation');
    const isAr = locale === 'ar';

    const categories = await prisma.category.findMany({
        where: { 
            isActive: true, 
            parentId: null,
            NOT: {
                slug: {
                    in: ['animal', 'vet']
                }
            }
        },
        orderBy: { order: 'asc' },
        select: {
            id: true,
            name: true,
            name_ar: true,
            slug: true,
            image: true,
            description: true,
            description_ar: true,
            children: {
                where: { isActive: true },
                select: {
                    id: true,
                    name: true,
                    name_ar: true,
                    slug: true
                }
            }
        }
    });

    const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { 
            category: {
                include: {
                    parent: true
                }
            }
        },
        orderBy: { order: 'asc' }
    });

    const agriProducts = products.filter(p => {
        const slug = p.category?.slug.toLowerCase() || '';
        return !slug.includes('animal') && !slug.includes('vet');
    });

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            {/* Hero Section */}
            <section style={{ 
                padding: '4rem 0',
                backgroundColor: '#f8fafc',
                textAlign: 'center'
            }}>
                <div className="container">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Sprout size={32} color="#22c55e" />
                        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, margin: 0 }}>
                            {tNav('prodPlant')}
                        </h1>
                    </div>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Comprehensive agricultural solutions for maximum yield and sustainability
                    </p>
                </div>
            </section>

            {/* Category Grid */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    {categories.length > 0 && (
                        <>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>
                                Browse Categories
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', marginBottom: '6rem' }}>
                                {categories.map((category) => {
                                    const catName = isAr && category.name_ar ? category.name_ar : category.name;
                                    const catDesc = isAr && category.description_ar ? category.description_ar : category.description;
                                    return (
                                        <Link
                                            key={category.id}
                                            href={{pathname: '/product-category/[slug]', params: {slug: category.slug}}}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <div className="card hover-card" style={{
                                                overflow: 'hidden',
                                                borderRadius: '1.5rem',
                                                backgroundColor: 'white',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '240px',
                                                    backgroundColor: '#ecf0f1'
                                                }}>
                                                    {category.image && (
                                                        <Image
                                                            src={category.image}
                                                            alt={catName}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    )}
                                                </div>
                                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                                                        {catName}
                                                    </h3>
                                                    <p style={{
                                                        color: 'var(--muted-foreground)',
                                                        fontSize: '0.95rem',
                                                        lineHeight: 1.5,
                                                        marginBottom: '1.5rem',
                                                        flex: 1
                                                    }}>
                                                        {catDesc?.substring(0, 100) || 'Explore our products in this category'}...
                                                    </p>
                                                    <span style={{
                                                        color: 'var(--primary)',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        View Products <ArrowRight size={16} />
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Products Grid */}
                    {agriProducts.length > 0 && (
                        <>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', textAlign: 'center' }}>
                                Featured Products
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                                {agriProducts.map((product) => {
                                    const pName = isAr && product.name_ar ? product.name_ar : product.name;
                                    const pShortDesc = isAr && product.shortDesc_ar ? product.shortDesc_ar : product.shortDesc;
                                    const catName = isAr && product.category?.name_ar ? product.category.name_ar : product.category?.name;

                                    return (
                                        <Link key={product.id} href={{pathname: '/product/[slug]', params: {slug: product.slug}}} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className="card hover-card" style={{
                                                overflow: 'hidden',
                                                borderRadius: '1.5rem',
                                                backgroundColor: 'white',
                                                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                                            }}>
                                                <div style={{
                                                    position: 'relative',
                                                    height: '200px',
                                                    backgroundColor: '#f8fafc'
                                                }}>
                                                    {product.image && (
                                                        <Image 
                                                            src={product.image} 
                                                            alt={pName} 
                                                            fill 
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                                <div style={{ padding: '1.5rem' }}>
                                                    {catName && (
                                                        <span style={{
                                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                                            color: '#22c55e',
                                                            fontSize: '0.7rem',
                                                            padding: '0.25rem 0.6rem',
                                                            borderRadius: '1rem',
                                                            textTransform: 'uppercase',
                                                            fontWeight: '700',
                                                            display: 'inline-block',
                                                            marginBottom: '0.75rem'
                                                        }}>
                                                            {catName}
                                                        </span>
                                                    )}
                                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 700 }}>{pName}</h3>
                                                    <p style={{
                                                        color: 'var(--muted-foreground)',
                                                        fontSize: '0.875rem',
                                                        marginBottom: '1.5rem',
                                                        lineHeight: 1.5,
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden'
                                                    }}>
                                                        {pShortDesc}
                                                    </p>
                                                    <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                                                        {t('viewDetails')} {isAr ? '←' : '→'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {agriProducts.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--muted-foreground)' }}>
                            <p style={{ fontSize: '1.1rem' }}>{t('noProducts')}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
