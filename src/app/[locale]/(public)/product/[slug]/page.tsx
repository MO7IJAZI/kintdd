import prisma from "@/lib/prisma";
import Tabs from "@/components/ui/Tabs";
import DynamicSectionsRenderer from "@/components/DynamicSectionsRenderer";
import { generateProductSchema, createProductMetadata } from "@/lib/seoUtils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, getLocale } from 'next-intl/server';
import { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> }
): Promise<Metadata> {
  const { slug, locale } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for does not exist.'
    };
  }

  const isAr = locale === 'ar';
  const name = (isAr && product.name_ar) ? product.name_ar : product.name;
  const shortDesc = (isAr && product.shortDesc_ar) ? product.shortDesc_ar : product.shortDesc;

  return createProductMetadata(
    {
      name,
      slug: product.slug,
      shortDesc: shortDesc || undefined,
      description: product.description || undefined,
      image: product.image || undefined
    },
    locale,
    slug
  );
}

interface CompositionRow {
    name: string;
    value: string;
}

interface UsageRow {
    crop: string;
    stage: string;
    dosage: string;
}

interface DownloadItem {
    id: string;
    fileUrl: string;
    title: string;
}

interface ProductDetailData {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    image?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    benefits?: string | null;
    benefits_ar?: string | null;
    usage?: string | null;
    usage_ar?: string | null;
    usageTable?: UsageRow[] | null;
    usageTable_ar?: UsageRow[] | null;
    compTable?: CompositionRow[] | null;
    compTable_ar?: CompositionRow[] | null;
    isOrganic?: boolean | null;
    categoryId?: string | null;
    category?: { slug: string; name: string; name_ar?: string | null } | null;
    downloads?: DownloadItem[] | null;
    tabs?: { id: string; title: string; content: string }[] | null;
    tabs_ar?: { id: string; title: string; content: string }[] | null;
    sections?: { id: string; productId: string; title: string; title_ar?: string | null; content: string; content_ar?: string | null; colorTheme?: string | null; order: number }[] | null;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
    const { slug, locale } = await params;
    const t = await getTranslations('Product');
    const tNav = await getTranslations('Navigation');
    const isAr = locale === 'ar';

    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: true,
            images: true,
            downloads: true,
            sections: {
                where: { },
                orderBy: { order: 'asc' }
            }
        }
    }) as ProductDetailData | null;

    if (!product) {
        notFound();
    }

    // Localized Data
    const name = (isAr && product.name_ar) ? product.name_ar : product.name;
    const description = (isAr && product.description_ar) ? product.description_ar : product.description;
    const shortDesc = (isAr && product.shortDesc_ar) ? product.shortDesc_ar : product.shortDesc;
    const benefits = (isAr && product.benefits_ar) ? product.benefits_ar : product.benefits;
    const usage = (isAr && product.usage_ar) ? product.usage_ar : product.usage;
    const compTable = (isAr && product.compTable_ar) ? product.compTable_ar : product.compTable;
    const usageTable = (isAr && product.usageTable_ar) ? product.usageTable_ar : product.usageTable;
    const productTabs = (isAr && product.tabs_ar) ? product.tabs_ar : product.tabs;
    const categoryName = (isAr && product.category?.name_ar) ? product.category?.name_ar : product.category?.name;

    // Fetch related products (same category, excluding current)
    const relatedProductsRaw = product.categoryId ? await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            isActive: true
        },
        take: 3,
        include: { category: true }
    }) : [];

    // Process related products for localization
    const relatedProducts = relatedProductsRaw.map((p: any) => {
        const pData = p as unknown as ProductDetailData;
        return {
            ...p,
            name: (isAr && pData.name_ar) ? pData.name_ar : p.name,
            shortDesc: (isAr && pData.shortDesc_ar) ? pData.shortDesc_ar : p.shortDesc,
            description: (isAr && pData.description_ar) ? pData.description_ar : p.description,
            categoryName: (isAr && pData.category?.name_ar) ? pData.category?.name_ar : p.category?.name
        };
    });

    // 6. Technical Table Data (Composition + Usage)
    const technicalTable = [];
    if (compTable && Array.isArray(compTable) && compTable.length > 0) {
        technicalTable.push({
            title: t('composition'),
            type: 'composition',
            data: compTable
        });
    }
    if (usageTable && Array.isArray(usageTable) && usageTable.length > 0) {
        technicalTable.push({
            title: t('dosage'),
            type: 'usage',
            data: usageTable
        });
    }

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', direction: isAr ? 'rtl' : 'ltr' }}>
            {/* JSON-LD Product Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateProductSchema(product as any, locale))
                }}
            />

            {/* 1. PRODUCT HERO */}
            <section style={{ 
                position: 'relative', 
                padding: '6rem 0', 
                backgroundColor: '#f8fafc', 
                overflow: 'hidden',
                borderBottom: '1px solid #e2e8f0'
            }}>
                {/* Background Decoration */}
                <div style={{ 
                    position: 'absolute', 
                    top: '-10%', 
                    right: isAr ? 'auto' : '-5%', 
                    left: isAr ? '-5%' : 'auto',
                    width: '40%', 
                    height: '120%', 
                    background: `linear-gradient(${isAr ? '270deg' : '90deg'}, rgba(233, 73, 108, 0.03) 0%, transparent 100%)`,
                    zIndex: 0,
                    borderRadius: '50%'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        {/* Hero Text Content */}
                        <div className="animate-fade-in-up">
                            <nav style={{ marginBottom: '2rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{tNav('home')}</Link>
                                <span>/</span>
                                <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>{tNav('products')}</Link>
                                <span>/</span>
                                <span style={{ color: 'var(--primary)' }}>{name}</span>
                            </nav>

                            <h1 style={{ 
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                                fontWeight: 900, 
                                lineHeight: 1.1, 
                                marginBottom: '1.5rem',
                                color: '#0f172a'
                            }}>
                                {name}
                            </h1>

                            <div style={{ 
                                fontSize: '1.25rem', 
                                lineHeight: 1.6, 
                                color: '#475569', 
                                marginBottom: '2.5rem',
                                borderLeft: isAr ? 'none' : '4px solid var(--primary)',
                                borderRight: isAr ? '4px solid var(--primary)' : 'none',
                                paddingLeft: isAr ? 0 : '1.5rem',
                                paddingRight: isAr ? '1.5rem' : 0
                            }}>
                                {shortDesc}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <Link href="/contact" className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '50px', fontSize: '1.1rem' }}>
                                    {t('orderInquiry')}
                                </Link>
                                {product.isOrganic && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#ecfdf5',
                                        color: '#059669',
                                        borderRadius: '50px',
                                        fontWeight: 700,
                                        fontSize: '0.9rem',
                                        border: '1px solid #10b981'
                                    }}>
                                        <span style={{ fontSize: '1.2rem' }}>🌿</span> {t('certifiedOrganic').toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="animate-fade-in" style={{ position: 'relative', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ 
                                position: 'absolute', 
                                width: '80%', 
                                height: '80%', 
                                backgroundColor: 'white', 
                                borderRadius: '2rem', 
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                                zIndex: 0 
                            }} />
                            <Image
                                src={product.image || '/images/cat-biostimulants.png'}
                                alt={name || product.name}
                                width={450}
                                height={450}
                                style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }}
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. STRUCTURED INFO BLOCK (Replacement for Tabs) */}
            <section style={{ padding: '6rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
                        {/* Main Description & Benefits */}
                        <div style={{ gridColumn: 'span 2' }}>
                            {description && (
                                <div style={{ marginBottom: '4rem' }}>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '8px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></span>
                                        {t('Description').toUpperCase()}
                                    </h2>
                                    <div 
                                        className="prose prose-lg" 
                                        style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.1rem' }}
                                        dangerouslySetInnerHTML={{ __html: description }}
                                    />
                                </div>
                            )}

                            {benefits && (
                                <div style={{ marginBottom: '4rem' }}>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '8px', height: '24px', backgroundColor: 'var(--secondary)', borderRadius: '4px' }}></span>
                                        {t('benefits').toUpperCase()}
                                    </h2>
                                    <div 
                                        className="prose prose-lg" 
                                        style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.1rem' }}
                                        dangerouslySetInnerHTML={{ __html: benefits }}
                                    />
                                </div>
                            )}

                            {usage && (
                                <div style={{ marginBottom: '4rem' }}>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ width: '8px', height: '24px', backgroundColor: '#6366f1', borderRadius: '4px' }}></span>
                                        {t('application').toUpperCase()}
                                    </h2>
                                    <div 
                                        className="prose prose-lg" 
                                        style={{ color: '#334155', lineHeight: 1.8, fontSize: '1.1rem' }}
                                        dangerouslySetInnerHTML={{ __html: usage }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sidebar: Downloads & Support */}
                        <aside>
                            <div style={{ position: 'sticky', top: '100px' }}>
                                <div style={{ 
                                    padding: '2.5rem', 
                                    backgroundColor: 'white', 
                                    borderRadius: '1.5rem', 
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '2rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1rem' }}>
                                        {t('technicalDocuments')}
                                    </h3>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {(product.downloads?.length ?? 0) > 0 ? product.downloads?.map((dl) => (
                                            <a
                                                key={dl.id}
                                                href={dl.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.5rem',
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: '1rem',
                                                    textDecoration: 'none',
                                                    color: '#334155',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    transition: 'all 0.2s ease',
                                                    border: '1px solid transparent'
                                                }}
                                                className="hover-card"
                                            >
                                                <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                {dl.title.toUpperCase()}
                                            </a>
                                        )) : (
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('noDocuments')}</p>
                                        )}
                                    </div>

                                    <div style={{ marginTop: '3rem', padding: '2rem', backgroundColor: '#f1f5f9', borderRadius: '1rem', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>{t('needSupport')}</p>
                                        <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>+48 796 106 899</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: 600 }}>kint@kafri-intl.com</p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* 3. TECHNICAL TABLE SECTION */}
            {technicalTable.length > 0 && (
                <section style={{ padding: '6rem 0', backgroundColor: '#f8fafc' }}>
                    <div className="container">
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', textAlign: 'center' }}>
                            {t('technicalSpecifications').toUpperCase()}
                        </h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
                            {technicalTable.map((table, idx) => (
                                <div key={idx} style={{ 
                                    backgroundColor: 'white', 
                                    borderRadius: '2rem', 
                                    overflow: 'hidden', 
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ padding: '2rem 3rem', backgroundColor: '#0f172a', color: 'white' }}>
                                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{table.title.toUpperCase()}</h3>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            {table.type === 'composition' ? (
                                                <>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                            <th style={{ padding: '1.5rem 3rem', textAlign: isAr ? 'right' : 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('nutrient')}</th>
                                                            <th style={{ padding: '1.5rem 3rem', textAlign: isAr ? 'right' : 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('value')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(table.data as CompositionRow[]).map((row, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} className="hover:bg-slate-50">
                                                                <td style={{ padding: '1.5rem 3rem', fontWeight: 700, color: '#1e293b' }}>{row.name}</td>
                                                                <td style={{ padding: '1.5rem 3rem', color: 'var(--primary)', fontWeight: 800 }}>{row.value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </>
                                            ) : (
                                                <>
                                                    <thead>
                                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                                            <th style={{ padding: '1.5rem 3rem', textAlign: isAr ? 'right' : 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('crop')}</th>
                                                            <th style={{ padding: '1.5rem 3rem', textAlign: isAr ? 'right' : 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('stage')}</th>
                                                            <th style={{ padding: '1.5rem 3rem', textAlign: isAr ? 'right' : 'left', fontWeight: 800, color: '#475569', textTransform: 'uppercase', fontSize: '0.85rem' }}>{t('dosage')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(table.data as UsageRow[]).map((row, i) => (
                                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                                <td style={{ padding: '1.5rem 3rem', fontWeight: 800, color: '#1e293b' }}>{row.crop}</td>
                                                                <td style={{ padding: '1.5rem 3rem', color: '#64748b', fontWeight: 500 }}>{row.stage}</td>
                                                                <td style={{ padding: '1.5rem 3rem', color: 'var(--primary)', fontWeight: 800 }}>{row.dosage}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </>
                                            )}
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. DYNAMIC SECTIONS SYSTEM */}
            {product.sections && product.sections.length > 0 && (
                <DynamicSectionsRenderer sections={product.sections} isRtl={isAr} />
            )}

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className="section" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '6rem 0' }}>
                    <div className="container">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem' }}>
                            <div>
                                <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem', marginBottom: '1rem', letterSpacing: '0.2em', display: 'block' }}>{t('discoverMore').toUpperCase()}</span>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>{t('relatedProducts').toUpperCase()}</h2>
                            </div>
                            <Link href={`/product-category/${product.category?.slug}`} style={{ 
                                color: 'var(--primary)', 
                                fontWeight: '700', 
                                fontSize: '1rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                textDecoration: 'none'
                            }}>
                                {t('viewAll').toUpperCase()} {categoryName?.toUpperCase()} {isAr ? '←' : '→'}
                            </Link>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                            {relatedProducts.map((related: any) => (
                                <Link key={related.id} href={`/product/${related.slug}`} className="card" style={{ border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)', transition: 'transform 0.3s ease', backgroundColor: 'white' }}>
                                    <div style={{ position: 'relative', height: '240px', backgroundColor: '#fff', padding: '2rem', borderBottom: '1px solid #f1f5f9' }}>
                                        <Image 
                                            src={related.image || '/images/cat-biostimulants.png'} 
                                            alt={related.name} 
                                            fill 
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                            loading="lazy"
                                        />
                                    </div>
                                    <div style={{ padding: '2rem' }}>
                                        <span style={{
                                            backgroundColor: '#f1f5f9',
                                            color: '#64748b',
                                            fontSize: '0.7rem',
                                            padding: '0.35rem 0.75rem',
                                            borderRadius: '2rem',
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            display: 'inline-block',
                                            marginBottom: '1rem',
                                            letterSpacing: '0.05em'
                                        }}>
                                            {related.categoryName || 'Product'}
                                        </span>
                                        <h3 style={{ marginBottom: '0.75rem', fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{related.name}</h3>
                                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {related.shortDesc || (related.description ? related.description.replace(/<[^>]*>?/gm, '').substring(0, 100) + "..." : "Learn more about this product.")}
                                        </p>
                                        <div style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                                            {t('viewDetails').toUpperCase()} {isAr ? '←' : '→'}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
