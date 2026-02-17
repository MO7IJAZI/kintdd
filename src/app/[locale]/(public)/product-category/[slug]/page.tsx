import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';

export const revalidate = 300;

interface ProductSummary {
    id: string;
    slug: string;
    name: string;
    name_ar?: string | null;
    image?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
}

interface CategoryData {
    id: string;
    slug: string;
    name: string;
    name_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    children: CategoryData[];
    products: ProductSummary[];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const tNav = await getTranslations('Navigation');
    const tProd = await getTranslations('Product');
    const isAr = locale === 'ar';

    let categoryRaw = null;
    
    try {
        categoryRaw = await prisma.category.findUnique({
            where: { slug },
            include: {
                products: {
                    where: { isActive: true },
                    orderBy: { order: "asc" }
                },
                children: true
            }
        });
    } catch (error) {
        console.error('Error fetching category:', error);
    }

    if (!categoryRaw) {
        notFound();
    }

    const category = categoryRaw as unknown as CategoryData;
    const name = (isAr && category.name_ar) ? category.name_ar : category.name;
    const description = (isAr && category.description_ar) ? category.description_ar : category.description;

    return (
        <div className="section" style={{ direction: isAr ? 'rtl' : 'ltr' }}>
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/products`}>{tNav('products')}</Link> / <span>{name}</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{name}</h1>
                    {description && (
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', maxWidth: '800px' }}>
                            {description}
                        </p>
                    )}
                </div>

                {category.children.length > 0 && (
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>{tProd('subcategories')}</h2>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {category.children.map(child => {
                                const childName = (isAr && child.name_ar) ? child.name_ar : child.name;
                                return (
                                    <Link
                                        key={child.id}
                                        href={`/product-category/${child.slug}`}
                                        className="btn btn-outline"
                                        style={{ borderRadius: '2rem' }}
                                    >
                                        {childName}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {category.products.map((product) => {
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

                {category.products.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--muted-foreground)' }}>
                        {tProd('noProductsFound')}
                    </div>
                )}
            </div>
        </div>
    );
}
