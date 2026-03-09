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
    products: (ProductSummary & { images?: { url: string; alt: string }[] })[];
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
                    orderBy: { order: "asc" },
                    include: { images: true }
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
                         
                         const externalImage = product.images?.find((img) => img.alt === 'external-card')?.url;
                         const displayImage = externalImage || product.image || '/images/cat-biostimulants.png';
                         
                         return (
                            <Link key={product.id} href={`/product/${product.slug}`} className="card" style={{
                                overflow: 'hidden', borderRadius: '1.5rem', backgroundColor: 'white',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                                border: '1px solid #e2e8f0',
                                textDecoration: 'none', color: 'inherit',
                                display: 'flex', flexDirection: 'column', height: '100%'
                            }}>
                                <div style={{ position: 'relative', height: '260px', backgroundColor: '#fff', padding: '0' }}>
                                      <Image
                                          src={displayImage}
                                          alt={pName}
                                          fill
                                          style={{ objectFit: 'contain' }}
                                      />
                                  </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #e2e8f0' }}>
                                    <span style={{
                                        backgroundColor: '#fff0f3', color: '#e9496c',
                                        fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '50px',
                                        textTransform: 'uppercase', fontWeight: '800', display: 'inline-block',
                                        marginBottom: '1rem', width: 'fit-content'
                                    }}>
                                        {name}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.3, color: '#142346' }}>{pName}</h3>
                                    <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {pShortDesc || (pDesc ? pDesc.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '')}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <span style={{ color: '#e9496c', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {tNav('viewDetails')} {isAr ? '←' : '→'}
                                        </span>
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
