import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package, Layers, Grid3X3, CheckCircle2 } from 'lucide-react';
import styles from './products.module.css';
import ProductCategoryCard from '@/components/products/ProductCategoryCard';
import ProductsFeaturesGrid from '@/components/products/ProductsFeaturesGrid';

export const revalidate = 300;

export default async function ProductsPage() {
    try {
        return await ProductsPageContent();
    } catch (error) {
        console.error("Critical error in ProductsPage:", error);
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center p-8 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Server Error</h1>
                    <p className="text-slate-600 mb-6">Unable to load the products page. Please try again later.</p>
                    <Link 
                        href="/" 
                        className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
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
    let tNav: any = {};
    let isAr = false;
    
    try {
        locale = await getLocale();
        t = await getTranslations('ProductsPage');
        tHomeNew = await getTranslations('HomeNew');
        tNav = await getTranslations('Navigation');
        isAr = locale === 'ar';
    } catch (error) {
        console.error("Error loading translations for products page:", error);
        // Fallback translations
        t = {
            ourSolutions: () => "Our Solutions",
            title: () => "Our Products & Solutions",
            subtitle: () => "Discover our comprehensive range of products across multiple sectors",
            exploreProducts: () => "Explore Products",
            categories: () => "Product Categories"
        };
        tHomeNew = {
            viewProducts: () => "View Products"
        };
    }
    
    // Safe translators (avoid throwing when a key is missing)
    const translate = (key: string, fallback: string) => {
        try {
            if (typeof t === 'function') return t(key);
            if (t && typeof t === 'object' && typeof t[key] === 'function') return t[key]();
        } catch {
            // ignore
        }
        return fallback;
    };

    const translateHome = (key: string, fallback: string) => {
        try {
            if (typeof tHomeNew === 'function') return tHomeNew(key);
            if (tHomeNew && typeof tHomeNew === 'object' && typeof tHomeNew[key] === 'function') return tHomeNew[key]();
        } catch {
            // ignore
        }
        return fallback;
    };

    const translateNav = (key: string, fallback: string) => {
        try {
            if (typeof tNav === 'function') return tNav(key);
            if (tNav && typeof tNav === 'object' && typeof tNav[key] === 'function') return tNav[key]();
        } catch {
            // ignore
        }
        return fallback;
    };
    
    const ourSolutionsLabel = translate('ourSolutions', 'Our Solutions');

    // Fetch all active main categories (no parent)
    let categories: any[] = [];
    let categoryError = null;
    try {
        console.log("Fetching main categories from database...");
        categories = await prisma.category.findMany({
            where: {
                isActive: true,
                parentId: null  // Only root categories
            },
            include: {
                children: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' }
                },
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { order: 'asc' },
        });
        console.log(`Successfully fetched ${categories.length} main categories`);
    } catch (error) {
        console.error("Error fetching categories in products page:", error);
        categoryError = error;
        categories = [];
    }

    // Default category icon - simplified to use only database categories
    const DefaultCategoryIcon = <Package className="w-6 h-6" />;

    return (
        <div style={{ direction: isAr ? 'rtl' : 'ltr', overflowX: 'hidden' }}>
            {/* Hero Section with Image */}
            <section className={styles.heroSection} style={{
                position: 'relative',
                background: 'linear-gradient(rgba(20, 35, 70, 0.75), rgba(20, 35, 70, 0.65)), url(/images/banners/products-banner.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: 'white',
                padding: '8rem 1rem',
                textAlign: 'center',
                minHeight: '600px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '900px' }}>
                    <div className={styles.heroBadge} style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        backgroundColor: 'rgba(233, 73, 108, 0.15)', 
                        padding: '0.5rem 1.25rem', 
                        borderRadius: '999px',
                        border: '1px solid rgba(233, 73, 108, 0.3)',
                        marginBottom: '2rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#e9496c' }}></span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: '#e9496c' }}>
                            {ourSolutionsLabel}
                        </span>
                    </div>
                    
                    <h1 style={{ 
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                        fontWeight: 800, 
                        marginBottom: '1.5rem',
                        lineHeight: 1.1,
                        letterSpacing: '-0.02em',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        {translate('title', 'Our Products & Solutions')}
                    </h1>
                    
                    <p style={{ 
                        fontSize: 'clamp(1.1rem, 2vw, 1.35rem)', 
                        opacity: 0.95, 
                        maxWidth: '700px', 
                        margin: '0 auto',
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        {translate('subtitle', 'Discover our comprehensive range of products across multiple sectors')}
                    </p>
                </div>
            </section>


            {/* Categories Grid Section */}
            <section id="categories" style={{ 
                padding: '6rem 1rem', 
                backgroundColor: '#f8fafc'
            }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ color: '#e9496c', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                            {translate('categories', 'Our Offerings')}
                        </div>
                        <h2 style={{ 
                            fontSize: 'clamp(2rem, 4vw, 3rem)', 
                            fontWeight: 800, 
                            color: '#142346', 
                            marginBottom: '1rem',
                            lineHeight: 1.2
                        }}>
                            {translate('categories', 'Product Categories')}
                        </h2>
                        <div style={{ width: '80px', height: '4px', background: 'linear-gradient(90deg, #e9496c, #142346)', margin: '0 auto', borderRadius: '2px' }}></div>
                    </div>

                    {categoryError ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">Unable to load categories</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                Please try refreshing the page or contact support if the issue persists.
                            </p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Grid3X3 className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No categories found</h3>
                            <p className="text-slate-600 max-w-md mx-auto">
                                No active categories are available at the moment.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                            {categories.map((category, index) => {
                                if (!category || !category.id || !category.slug) {
                                    console.warn('Invalid category data:', category);
                                    return null;
                                }
                                
                                const categoryUrl = `/product-category/${category.slug}`;
                                
                                return (
                                    <ProductCategoryCard
                                        key={category.id}
                                        category={category}
                                        index={index}
                                        isAr={isAr}
                                        categoryUrl={categoryUrl}
                                        viewProductsLabel={translateHome('viewProducts', 'View Products')}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '6rem 1rem', backgroundColor: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ color: '#e9496c', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>
                            {translate('whyChooseUs', 'Why Choose Us')}
                        </div>
                        <h2 style={{ 
                            fontSize: 'clamp(2rem, 4vw, 3rem)', 
                            fontWeight: 800, 
                            color: '#142346', 
                            marginBottom: '1rem',
                            lineHeight: 1.2
                        }}>
                            {translate('ourAdvantages', 'Our Advantages')}
                        </h2>
                    </div>

                    <ProductsFeaturesGrid />
                </div>
            </section>
        </div>
    );
}