import prisma from "@/lib/prisma";
import Image from 'next/image';
import { Link } from '@/navigation';
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package, Layers, Grid3X3 } from 'lucide-react';

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
            title: () => "Our Products & Solutions",
            subtitle: () => "Discover our comprehensive range of products across multiple sectors",
            exploreProducts: () => "Explore Products",
            categories: () => "Product Categories"
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

    // Fetch all active categories
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
        categories = [];
    }

    // Default category icon - simplified to use only database categories
    const DefaultCategoryIcon = <Package className="w-6 h-6" />;

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 mb-6">
                            <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-slate-600">{ourSolutionsLabel}</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                            {t('title') || "Our Products & Solutions"}
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            {t('subtitle') || "Discover our comprehensive range of products across multiple sectors"}
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <div className="flex items-center text-sm text-slate-500">
                                <Layers className="w-4 h-4 mr-2 text-primary" />
                                <span>{categories.length} Categories</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <Package className="w-4 h-4 mr-2 text-primary" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="flex items-center text-sm text-slate-500">
                                <Package className="w-4 h-4 mr-2 text-primary" />
                                <span>Certified Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="py-16 lg:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            {t('categories') || "Product Categories"}
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full"></div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                            {categories.map((category, index) => {
                                // Validate category data
                                if (!category || !category.id || !category.slug) {
                                    console.warn('Invalid category data:', category);
                                    return null;
                                }
                                
                                const name = isAr ? (category.name_ar || category.name || 'Unnamed Category') : (category.name || 'Unnamed Category');
                                const desc = isAr ? (category.description_ar || category.description) : category.description;
                                const categoryUrl = `/product-category/${category.slug}`;
                                const IconComponent = DefaultCategoryIcon;
                                
                                return (
                                    <Link 
                                        key={category.id} 
                                        href={categoryUrl as any}
                                        className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 ease-out border border-slate-100"
                                        style={{ 
                                            animationDelay: `${index * 100}ms`,
                                            animation: 'fadeInUp 0.6s ease-out forwards',
                                            opacity: 0
                                        }}
                                    >
                                        {/* Card Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        
                                        {/* Image Container */}
                                        <div className="relative h-48 lg:h-56 overflow-hidden">
                                            {category.image && category.image.trim() !== '' ? (
                                                <Image 
                                                    src={category.image} 
                                                    alt={name} 
                                                    fill 
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    onError={() => {
                                                        console.error(`Failed to load image for category ${category.name}`);
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                                    <div className="text-slate-400">
                                                        {IconComponent}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Image Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            
                                            {/* Category Icon Badge */}
                                            <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {IconComponent}
                                            </div>
                                        </div>
                                        
                                        {/* Content */}
                                        <div className="relative p-6">
                                            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors duration-300">
                                                {name}
                                            </h3>
                                            
                                            {desc && (
                                                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                                    {desc.length > 120 ? `${desc.substring(0, 120)}...` : desc}
                                                </p>
                                            )}
                                            
                                            {/* Action Button */}
                                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                                <span className="text-sm font-medium text-primary group-hover:text-primary-hover transition-colors">
                                                    {tHomeNew('viewProducts') || "View Products"}
                                                </span>
                                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                                    <ArrowRight className="w-4 h-4 text-primary group-hover:text-white transition-colors duration-300" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Hover Effect Border */}
                                        <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/30 transition-colors duration-300 pointer-events-none"></div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                                <Package className="w-8 h-8 text-primary group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Quality Assurance</h3>
                            <p className="text-slate-600">All products meet international quality standards and certifications</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary group-hover:scale-110 transition-all duration-300">
                                <Package className="w-8 h-8 text-secondary group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Wide Range</h3>
                            <p className="text-slate-600">Comprehensive product portfolio across multiple agricultural and industrial sectors</p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
                                <Package className="w-8 h-8 text-green-500 group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Sustainable Solutions</h3>
                            <p className="text-slate-600">Environmentally friendly products supporting sustainable agriculture</p>
                        </div>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                @media (prefers-reduced-motion: reduce) {
                    .group * {
                        transition: none !important;
                        animation: none !important;
                    }
                }
            `}</style>
        </div>
    );
}