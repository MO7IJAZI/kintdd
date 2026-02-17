import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { Sprout, Users, ArrowRight, LayoutGrid } from 'lucide-react';

export const revalidate = 300;

export default async function ProductsPage() {
    const locale = await getLocale();
    const t = await getTranslations('ProductsPage');
    const tHomeNew = await getTranslations('HomeNew');
    const isAr = locale === 'ar';

    // Fetch only active parent categories
    const categories = await prisma.category.findMany({
        where: {
            isActive: true,
            parentId: null,
             NOT: {
                    slug: {
                        in: ['animal-products', 'agricultural-products', 'crop-farming'] // Exclude if needed, or keep based on user request "show ONLY main parent categories"
                        // The user said "remove all contents... display only main parent categories".
                        // Wait, the user previously asked to remove 'animal-products' and 'crop-farming' from header.
                        // But here they say "display only main parent categories".
                        // If I show ALL parent categories, these might appear.
                        // However, the user said "remove all content of the page so it displays only main parent categories".
                        // This likely means replacing the hardcoded cards with dynamic ones.
                        // I will assume they want ALL active parent categories.
                    }
                }
        },
        orderBy: { order: 'asc' },
    });

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Hero Section */}
            <section style={{ 
                padding: '6rem 0',
                background: 'linear-gradient(135deg, var(--secondary) 0%, #1e293b 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ 
                    position: 'absolute', inset: 0, 
                    backgroundImage: 'url("/images/pattern-grid.png")',
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
                        color: '#e9496c'
                    }}>
                        {t('ourSolutions') || "Our Solutions"}
                    </span>
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        marginBottom: '1.5rem', 
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2
                    }}>
                        {t('title')}
                    </h1>
                    <p style={{ 
                        color: '#cbd5e1', 
                        fontSize: '1.15rem', 
                        maxWidth: '600px', 
                        margin: '0 auto', 
                        lineHeight: 1.7
                    }}>
                        {t('subtitle')}
                    </p>
                </div>
            </section>

            {/* Categories Grid */}
            <section style={{ padding: '4rem 0 6rem' }}>
                <div className="container">
                    {categories.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                            <LayoutGrid size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <h3>No categories found</h3>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                            gap: '2rem',
                            padding: '0 1rem'
                        }}>
                            {categories.map((category, index) => {
                                const name = isAr ? (category.name_ar || category.name) : category.name;
                                const desc = isAr ? (category.description_ar || category.description) : category.description;
                                
                                return (
                                    <Link 
                                        key={category.id} 
                                        href={`/product-category/${category.slug}`}
                                        className="category-card"
                                    >
                                        <div className="card-image-wrapper">
                                            {category.image ? (
                                                <Image 
                                                    src={category.image} 
                                                    alt={name} 
                                                    fill 
                                                    className="card-image"
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
                .category-card {
                    display: flex;
                    flex-direction: column;
                    background: white;
                    border-radius: 20px;
                    overflow: hidden;
                    text-decoration: none;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    height: 100%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .category-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
                    border-color: rgba(233, 73, 108, 0.2);
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
                    background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%);
                    opacity: 0.6;
                    transition: opacity 0.3s;
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
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
                    color: #e9496c;
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
                    color: #e9496c;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
            `}</style>
        </div>
    );
}
