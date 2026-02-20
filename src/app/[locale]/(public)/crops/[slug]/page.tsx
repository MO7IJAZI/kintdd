import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { stripScripts } from "@/lib/sanitizeHtml";

export const revalidate = 300;

interface Product {
    id: string;
    name: string;
    slug: string;
}

interface CropStage {
    id: string;
    name: string;
    name_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    recommendation?: { products?: string[] } | null;
}

interface CropDetailData {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    image?: string | null;
    pdfUrl?: string | null;
    description?: string | null;
    description_ar?: string | null;
    category?: string | null;
    category_ar?: string | null;
    harvestSeason_ar?: string | null;
    stages: CropStage[];
    recommendedProducts: Product[];
}

export default async function CropDetail({ params }: { params: Promise<{ slug: string; locale: string }> }) {
    const { slug, locale } = await params;
    const t = await getTranslations("CropGuides");
    const tNav = await getTranslations("Navigation");
    const tContact = await getTranslations("Contact");
    const isRtl = locale === 'ar';

    const crop = await prisma.crop.findUnique({
        where: { slug },
        include: {
            stages: {
                orderBy: { order: 'asc' }
            },
            recommendedProducts: true
        }
    }) as CropDetailData | null;

    if (!crop) {
        notFound();
    }

    // Collect all product IDs from stages
    const stageProductIds = new Set<string>();
    crop.stages.forEach((stage) => {
        const recommendation = stage.recommendation;
        if (recommendation?.products) {
            recommendation.products.forEach((id) => stageProductIds.add(id));
        }
    });

    // Fetch products for stages
    const stageProducts = await prisma.product.findMany({
        where: { id: { in: Array.from(stageProductIds) } },
        select: { id: true, name: true, slug: true }
    }) as Product[];

    // Create a map for easy lookup
    const productsMap = new Map<string, Product>(stageProducts.map((p) => [p.id, p]));

    // Localized fields
    const name = (isRtl && crop.name_ar) ? crop.name_ar : crop.name;
    const description = (isRtl && crop.description_ar) ? crop.description_ar : (crop.description || 'Detailed technical information is currently being updated.');
    const safeDescription = stripScripts(description);
    const categoryLabel = (() => {
        const lookup: Record<string, string> = {
            vegetables: t('vegetables'),
            fruits: t('fruits'),
            legumes: t('legumes'),
            cereals: t('cereals'),
            industrial: t('industrial'),
            herbs: t('herbs'),
        };
        if (isRtl && crop.category_ar) return crop.category_ar;
        if (crop.category) return lookup[crop.category] || crop.category;
        return '';
    })();

    return (
        <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header / Breadcrumbs */}
            <section style={{ padding: '3rem 0 2rem', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
                <div className="container-technical">
                    <nav style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: '#999', fontWeight: 700, display: 'flex', gap: '0.5rem' }}>
                        <Link href={`/`} style={{ color: '#999' }}>{tNav('home').toUpperCase()}</Link> /
                        <Link href={`/crop-farming`} style={{ color: '#999' }}> {t('title').toUpperCase()}</Link> /
                        <span style={{ color: 'var(--primary)' }}> {name.toUpperCase()}</span>
                    </nav>
                    <h1 style={{ 
                        fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', 
                        fontWeight: 900, 
                        textTransform: 'uppercase', 
                        letterSpacing: '-0.02em',
                        wordBreak: 'break-word'
                    }}>
                        {t('title').toUpperCase()}: <span style={{ color: 'var(--primary)' }}>{name}</span>
                    </h1>
                </div>
            </section>

            <section className="section">
                <div className="container-technical">
                    {/* Full-width image */}
                    {crop.image && (
                        <div style={{ position: 'relative', width: '100%', height: '420px', margin: '0 0 2rem 0', border: '1px solid #eee', overflow: 'hidden' }}>
                            <Image
                                src={crop.image}
                                alt={name}
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        {/* Main Content */}
                        <div>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '2rem' }}>
                                {categoryLabel && (
                                    <span style={{ padding: '0.4rem 0.8rem', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                                        {categoryLabel}
                                    </span>
                                )}
                                {isRtl && crop.harvestSeason_ar && (
                                    <span style={{ padding: '0.4rem 0.8rem', backgroundColor: '#fff7ed', color: '#ea580c', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                                        {crop.harvestSeason_ar}
                                    </span>
                                )}
                                {crop.pdfUrl && (
                                    <Link href={crop.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#eef2ff', color: '#3730a3', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'none' }}>
                                        {t('documentation')} · {t('downloadPdf')}
                                    </Link>
                                )}
                            </div>
                            {/* Premium Technical Description Sheet */}
                            <div style={{ marginBottom: '5rem' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '2rem'
                                }}>
                                    <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary)' }} />
                                    <h3 style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: 'var(--primary)',
                                        margin: 0,
                                        letterSpacing: '0.1em'
                                    }}>
                                        {t('technicalSpec')}
                                    </h3>
                                </div>
                                <div
                                    className="technical-content"
                                    style={{
                                        fontSize: '1.2rem',
                                        lineHeight: '1.9',
                                        color: 'var(--secondary-light)',
                                        [isRtl ? 'paddingRight' : 'paddingLeft']: '2.5rem',
                                        [isRtl ? 'borderRight' : 'borderLeft']: '4px solid var(--primary)',
                                        backgroundColor: 'rgba(233, 73, 108, 0.03)',
                                        paddingTop: '2rem',
                                        paddingBottom: '2rem',
                                        [isRtl ? 'paddingLeft' : 'paddingRight']: '1rem',
                                        borderRadius: isRtl ? '1rem 0 0 1rem' : '0 1rem 1rem 0'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: safeDescription }}
                                />
                                {(!safeDescription || safeDescription.trim() === '') && (
                                    <div style={{ color: '#999', fontSize: '0.95rem', fontWeight: 700, marginTop: '1rem' }}>
                                        {isRtl ? 'يتم تحديث المعلومات الفنية التفصيلية حالياً.' : 'Detailed technical information is currently being updated.'}
                                    </div>
                                )}
                            </div>

                            {/* Products Recommended Section */}
                            {crop.recommendedProducts.length > 0 && (
                                <div style={{ marginBottom: '4rem' }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: 800,
                                        textTransform: 'uppercase',
                                        color: 'var(--primary)',
                                        marginBottom: '2rem',
                                        paddingBottom: '0.5rem',
                                        borderBottom: '2px solid var(--primary)',
                                        display: 'inline-block'
                                    }}>
                                        {t('recommendedProducts')}
                                    </h3>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                        gap: '1.5rem'
                                    }}>
                                        {crop.recommendedProducts.map((p) => (
                                            <Link key={p.id} href={`/product/${p.slug}`} className="card product-mini-card" style={{
                                                padding: '1.5rem',
                                                textAlign: 'center',
                                                transition: '0.3s',
                                                border: '1px solid #eee'
                                            }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#333', textTransform: 'uppercase' }}>
                                                    {p.name}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: 700 }}>
                                                    {t('learnMore')} {isRtl ? '←' : '→'}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Feeding Program Table */}
                            <div>
                                <h3 style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    color: 'var(--primary)',
                                    marginBottom: '2rem',
                                    paddingBottom: '0.5rem',
                                    borderBottom: '2px solid var(--primary)',
                                    display: 'inline-block'
                                }}>
                                    {t('detailedFeedingProgram')}
                                </h3>
                                <div style={{ display: 'grid', gap: '1.5rem' }}>
                                    {crop.stages.map((stage) => {
                                        const stageName = (isRtl && stage.name_ar) ? stage.name_ar : stage.name;
                                        const stageDesc = (isRtl && stage.description_ar) ? stage.description_ar : (stage.description || t('defaultStageDescription', { name }));
                                        const safeStageDesc = stripScripts(stageDesc);
                                        
                                        return (
                                            <div key={stage.id} className="card" style={{
                                                display: 'grid',
                                                gridTemplateColumns: isRtl ? '1fr 220px' : '220px 1fr',
                                                overflow: 'hidden',
                                                border: '1px solid #eee'
                                            }}>
                                                {!isRtl && (
                                                    <div style={{
                                                        backgroundColor: '#f8fafc',
                                                        padding: '2rem',
                                                        borderRight: '1px solid #eee',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', opacity: 0.7 }}>{t('developmentPhase')}</span>
                                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--foreground)' }}>{stageName.toUpperCase()}</h4>
                                                    </div>
                                                )}

                                                <div style={{ padding: '2rem', backgroundColor: 'white' }}>
                                                    <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: safeStageDesc }} />
                                                    
                                                    {/* In a real app, recommendations would be many-to-many here too */}
                                                    <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {stage.recommendation?.products?.map((prodId) => {
                                                            const prod = productsMap.get(prodId);
                                                            if (!prod) return null;
                                                            return (
                                                                <Link key={prod.id} href={`/product/${prod.slug}`} style={{
                                                                    padding: '0.4rem 1rem',
                                                                    backgroundColor: '#f1f5f9',
                                                                    color: '#475569',
                                                                    borderRadius: '0.5rem',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 800,
                                                                    textDecoration: 'none',
                                                                    display: 'inline-block',
                                                                    transition: '0.2s'
                                                                }}>
                                                                    {prod.name}
                                                                </Link>
                                                            );
                                                        })}
                                                        {(!stage.recommendation?.products || stage.recommendation.products.length === 0) && (
                                                            <span style={{
                                                                padding: '0.4rem 1rem',
                                                                backgroundColor: '#f1f5f9',
                                                                color: '#475569',
                                                                borderRadius: '0.5rem',
                                                                fontSize: '0.7rem',
                                                                fontWeight: 800
                                                            }}>{t('optimizedPerformance')}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {isRtl && (
                                                    <div style={{
                                                        backgroundColor: '#f8fafc',
                                                        padding: '2rem',
                                                        borderLeft: '1px solid #eee',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', opacity: 0.7 }}>{t('developmentPhase')}</span>
                                                        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--foreground)' }}>{stageName.toUpperCase()}</h4>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    );
}
