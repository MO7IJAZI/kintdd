import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Sprout, Users, ArrowRight, LayoutGrid } from 'lucide-react';

export const revalidate = 300;

export default async function ProductsPage() {
    try {
        return await ProductsPageContent();
    } catch (error) {
        console.error("Critical error in ProductsPage:", error);
        return (
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                fontFamily: 'system-ui, -apple-system, sans-serif'
            }}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>Server Error</h1>
                    <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                        Unable to load the products page. Please try again later.
                    </p>
                    <Link 
                        href="/" 
                        style={{
                            display: 'inline-block',
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#142346',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '500'
                        }}
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }
}

async function ProductsPageContent() {
    let locale = 'en';
    let t: any = {};
    let tHomeNew: any = {};
    let isAr = false;
    
    try {
        locale = await getLocale();
        t = await getTranslations('ProductsPage');
        tHomeNew = await getTranslations('HomeNew');
        isAr = locale === 'ar';
    } catch (error) {
        console.error("Error loading translations for products page:", error);
        // Fallback translations
        t = {
            ourSolutions: () => "Our Solutions",
            title: () => "Our Solutions",
            subtitle: () => "Select a production sector to view specialized products and technical guides."
        };
        tHomeNew = {
            viewProducts: () => "View Products"
        };
    }
    
    let ourSolutionsLabel = "Our Solutions";
    try {
        ourSolutionsLabel = t('ourSolutions');
    } catch {
        ourSolutionsLabel = "Our Solutions";
    }

    // Fetch only active parent categories
    let categories: any[] = [];
    let categoryError = null;
    try {
        console.log("Fetching categories from database...");
        categories = await prisma.category.findMany({
            where: {
                isActive: true,
                parentId: null
            },
            orderBy: { order: 'asc' },
        });
        console.log(`Successfully fetched ${categories.length} categories`);
    } catch (error) {
        console.error("Error fetching categories in products page:", error);
        categoryError = error;
        // Fallback to empty array to avoid page crash
        categories = [];
    }

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Hero Section */}
            <section style={{ 
                padding: '6rem 0',
                background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundImage: 'none',
                    opacity: 0.05,
                    backgroundSize: 'cover'
                }} />
                
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '50%',
                    transform: 'translate(-50%, 0)',
                    width: '100%',
                    height: '200%',
                    background: 'radial-gradient(circle at center, rgba(233, 73, 108, 0.15) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1.5rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '50px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginBottom: '1.5rem',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'var(--primary)'
                    }}>
                        {ourSolutionsLabel}
                    </span>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        marginBottom: '1.5rem', 
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}>
                        {t('title') || "Our Solutions"}
                    </h1>
                    <p style={{ 
                        color: '#cbd5e1', 
                        fontSize: '1.15rem', 
                        maxWidth: '600px', 
                        margin: '0 auto', 
                        lineHeight: 1.7
                    }}>
                        {t('subtitle') || "Select a production sector to view specialized products and technical guides."}
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section style={{ padding: '4rem 0 6rem' }}>
                <div className="container">
                    {categoryError ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <LayoutGrid size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3>Unable to load categories</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                                Please try refreshing the page or contact support if the issue persists.
                            </p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <LayoutGrid size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3>No categories found</h3>
                            <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                                No active categories are available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                            gap: '2rem',
                            padding: '0 1rem'
                        }}>
                            {categories.map((category, index) => {
                                // Validate category data
                                if (!category || !category.id || !category.slug) {
                                    console.warn('Invalid category data:', category);
                                    return null;
                                }
                                
                                const name = isAr ? (category.name_ar || category.name || 'Unnamed Category') : (category.name || 'Unnamed Category');
                                const desc = isAr ? (category.description_ar || category.description) : category.description;
                                const categoryUrl = `/product-category/${category.slug}`;
                                
                                return (
                                    <Link 
                                        key={category.id} 
                                        href={categoryUrl as any}
                                        className="category-card"
                                        style={{ ["--enter-delay" as any]: `${index * 70}ms` }}
                                    >
                                        <div className="card-image-wrapper">
                                            {category.image && category.image.trim() !== '' ? (
                                                <Image 
                                                    src={category.image} 
                                                    alt={name} 
                                                    fill 
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="card-image"
                                                    onError={() => {
                                                        // Fallback logic if needed, but for now just prevent crash
                                                        console.error(`Failed to load image for category ${category.name}`);
                                                    }}
                                                />
                                            ) : (
                                                <div className="placeholder-image">
                                                    <Sprout size={48} color="#cbd5e1" />
                                                </div>
                                            )}
                                            <div className="overlay" />
                                            <div className="card-icon">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                        
                                        <div className="card-content">
                                            <h3 className="card-title">{name}</h3>
                                            {desc && (
                                                <p className="card-desc">
                                                    {desc.length > 120 ? `${desc.substring(0, 120)}...` : desc}
                                                </p>
                                            )}
                                            <span className="card-link">
                                                {tHomeNew('viewProducts') || "View Products"}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <style>{`
                @keyframes categoryCardEnter {
                    from {
                        opacity: 0;
                        transform: translate3d(0, 18px, 0) scale(0.98);
                        filter: blur(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                        filter: blur(0);
                    }
                }

                .category-card {
                    display: flex;
                    flex-direction: column;
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92)) padding-box,
                        linear-gradient(135deg, rgba(233, 73, 108, 0.18), rgba(51, 65, 85, 0.12)) border-box;
                    border-radius: 20px;
                    overflow: hidden;
                    text-decoration: none;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid transparent;
                    height: 100%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    opacity: 0;
                    animation: categoryCardEnter 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    animation-delay: var(--enter-delay, 0ms);
                    will-change: transform, opacity;
                }

                .category-card:hover {
                    transform: translate3d(0, -10px, 0) scale(1.01);
                    box-shadow: 0 26px 40px -18px rgba(15, 23, 42, 0.28), 0 12px 18px -12px rgba(15, 23, 42, 0.12);
                    background:
                        linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(248, 250, 252, 0.92)) padding-box,
                        linear-gradient(135deg, rgba(233, 73, 108, 0.55), rgba(96, 165, 250, 0.28)) border-box;
                }

                .card-image-wrapper {
                    position: relative;
                    height: 240px;
                    overflow: hidden;
                }

                .card-image {
                    object-fit: cover;
                    transition: transform 0.6s ease;
                }

                .category-card:hover .card-image {
                    transform: scale(1.08);
                }

                .placeholder-image {
                    width: 100%;
                    height: 100%;
                    background: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.18) 0%, transparent 55%),
                        linear-gradient(to top, rgba(2, 6, 23, 0.45) 0%, rgba(2, 6, 23, 0) 65%);
                    opacity: 0.7;
                    transition: opacity 0.35s ease;
                }

                .category-card:hover .overlay {
                    opacity: 0.85;
                }

                .card-icon {
                    position: absolute;
                    bottom: 1rem;
                    right: 1rem;
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--primary);
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.18);
                }
                
                [dir="rtl"] .card-icon {
                    right: auto;
                    left: 1rem;
                }

                .category-card:hover .card-icon {
                    opacity: 1;
                    transform: translateY(0);
                }

                .card-content {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                .card-title {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 0.75rem;
                    line-height: 1.3;
                }

                .category-card:hover .card-title {
                    color: var(--primary);
                }

                .card-desc {
                    color: #64748b;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    flex: 1;
                }

                .card-link {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: var(--primary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                @media (prefers-reduced-motion: reduce) {
                    .category-card {
                        animation: none;
                        opacity: 1;
                        transform: none;
                        filter: none;
                    }
                    .category-card:hover {
                        transform: none;
                    }
                    .card-image,
                    .overlay,
                    .card-icon {
                        transition: none;
                    }
                }
            `}</style>
        </div>
    );
}
