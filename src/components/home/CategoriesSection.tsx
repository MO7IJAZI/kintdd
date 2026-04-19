"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Leaf, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { CowIcon } from '@/components/icons/CowIcon';
import { PlantIcon } from '@/components/icons/PlantIcon';

interface Product {
    id: string;
    slug: string;
    name: string;
    name_ar?: string | null;
    image?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    category?: {
        name: string;
        name_ar?: string | null;
    } | null;
    images?: {
        url: string;
        alt: string;
    }[] | null;
}

interface Category {
    id: string;
    slug: string;
    name: string;
    name_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    image?: string | null;
    icon?: string | null;
}

interface CategoriesSectionProps {
    products?: Product[];
    categories?: Category[];
}

function renderCategoryIcon(icon?: string | null) {
  const iconName = (icon || "").toLowerCase();
  const isImageIcon =
    !!icon &&
    !["leaf", "sprout", "beef", "rabbit", "package"].includes(iconName) &&
    (icon.startsWith("/") || icon.startsWith("http://") || icon.startsWith("https://"));
    
  if (isImageIcon) {
    return (
      <div style={{ position: 'relative', width: '30px', height: '30px' }}>
        <Image src={icon!} alt="Card Icon" fill style={{ objectFit: 'contain' }} />
      </div>
    );
  }
  if (iconName === "beef") return <CowIcon size={30} />;
  if (iconName === "leaf" || iconName === "sprout") return <PlantIcon size={30} />;
  return <PlantIcon size={30} />;
}

export default function CategoriesSection({ products = [], categories = [] }: CategoriesSectionProps) {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
        const { scrollLeft, clientWidth } = sliderRef.current;
        const scrollAmount = clientWidth * 0.8; // Scroll 80% of width
        const newScrollLeft = direction === 'left' 
            ? scrollLeft - scrollAmount 
            : scrollLeft + scrollAmount;
        
        sliderRef.current.scrollTo({
            left: newScrollLeft,
            behavior: 'smooth'
        });
    }
  };

  return (
    <section className="section" style={{ padding: '8rem 0', backgroundColor: '#fcfcfc' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-20)' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--primary)', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            marginBottom: 'var(--space-4)', 
            fontSize: '0.9rem' 
          }}>
            <span style={{ height: '2px', width: '30px', backgroundColor: 'var(--primary)' }}></span>
            {tHomeNew('ourProducts')}
            <span style={{ height: '2px', width: '30px', backgroundColor: 'var(--primary)' }}></span>
          </div>
          <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
            {tHomeNew('whatWeOffer')}
          </h2>
        </div>
        
        {/* Categories Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)', marginBottom: '6rem' }}>
          {categories.length > 0 ? categories.map((category) => {
             const categoryName = isAr ? (category.name_ar || category.name) : category.name;
             const categoryDesc = isAr ? (category.description_ar || category.description) : category.description;
             
             let categoryImage = category.image;
             if (!categoryImage) {
                 categoryImage = category.slug === 'plant-wealth' || category.slug === 'plant-production' ? '/images/planet.webp' : 
                                 category.slug === 'livestock' || category.slug === 'animal-production' ? '/images/livestock.jpg' : '/images/banners/products-banner.png';
             }

             let categoryIcon = category.icon;
             if (!categoryIcon) {
                 if (category.slug === 'plant-wealth' || category.slug === 'plant-production') categoryIcon = 'leaf';
                 else if (category.slug === 'livestock' || category.slug === 'animal-production') categoryIcon = 'beef';
             }

             return (
               <div key={category.id} className="card" style={{ 
                 overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white', 
                 boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
                 display: 'flex', flexDirection: 'column', height: '100%'
               }}>
                 <div style={{ position: 'relative', height: '400px' }}>
                   <Image 
                     src={categoryImage} 
                     alt={categoryName} 
                     fill 
                     style={{ objectFit: 'cover' }} 
                   />
                 </div>
                  <div 
                    dir={isAr ? 'rtl' : 'ltr'}
                    style={{ 
                      padding: '3.5rem', 
                      textAlign: 'start', 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'stretch' 
                    }}
                  >
                    <h3 style={{ 
                      fontSize: '2.2rem', 
                      marginBottom: 'var(--space-4)', 
                      fontWeight: 900, 
                      color: 'var(--secondary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem',
                      justifyContent: 'flex-start'
                    }}>
                      {renderCategoryIcon(categoryIcon)}
                      <span>{categoryName}</span>
                    </h3>
                    <p style={{ 
                      color: 'var(--muted-foreground)', 
                      marginBottom: 'var(--space-12)', 
                      lineHeight: 1.8, 
                      fontSize: '1.1rem',
                      display: '-webkit-box', 
                      WebkitLineClamp: 3, 
                      WebkitBoxOrient: 'vertical', 
                      overflow: 'hidden',
                      textAlign: 'start'
                    }}>
                      {categoryDesc}
                    </p>
                    <Link href={`/products/${category.slug}`} className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600, marginTop: 'auto', width: 'fit-content' }}>
                      {tHomeNew('viewProducts')} <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0, transform: isAr ? 'rotate(180deg)' : 'none' }} />
                    </Link>
                  </div>
               </div>
             );
          }) : (
             <p style={{ textAlign: 'center', gridColumn: '1 / -1' }}>No categories found</p>
          )}
        </div>

        {/* Product Slider */}
        {products.length > 0 && (
            <div style={{ position: 'relative', marginTop: '4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>{tHomeNew('featuredProducts')}</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={() => scroll(isAr ? 'right' : 'left')}
                            className="btn btn-outline"
                            style={{ width: '50px', height: '50px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Previous products"
                        >
                            {isAr ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
                        </button>
                        <button 
                            onClick={() => scroll(isAr ? 'left' : 'right')}
                            className="btn btn-outline"
                            style={{ width: '50px', height: '50px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            aria-label="Next products"
                        >
                            {isAr ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                        </button>
                    </div>
                </div>

                <div 
                    ref={sliderRef}
                    style={{ 
                        display: 'flex', 
                        gap: '2rem', 
                        overflowX: 'auto', 
                        scrollBehavior: 'smooth', 
                        paddingBottom: '2rem',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        padding: '1rem'
                    }}
                    className="no-scrollbar"
                >
                    {products.map((product) => {
                        const title = isAr && product.name_ar ? product.name_ar : product.name;
                        const catName = isAr && product.category?.name_ar ? product.category.name_ar : product.category?.name;
                        const externalImage = product.images?.find((img) => img.alt === 'external-card')?.url;
                        const displayImage = externalImage || product.image;
                        
                        return (
                            <Link key={product.id} href={`/product/${product.slug}`} style={{ 
                                minWidth: '300px', 
                                maxWidth: '300px',
                                textDecoration: 'none',
                                flex: '0 0 auto'
                            }}>
                                <div className="card hover-card" style={{
                                    overflow: 'hidden', borderRadius: 'var(--radius-xl)', backgroundColor: 'white',
                                    boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
                                    display: 'flex', flexDirection: 'column', height: '100%',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                                }}>
                                    <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff', padding: '0' }}>
                                        {displayImage && (
                                            <Image src={displayImage} alt={title} fill style={{ objectFit: 'contain' }} />
                                        )}
                                    </div>
                                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
                                        {catName && (
                                            <span style={{
                                                backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                                fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '50px',
                                                textTransform: 'uppercase', fontWeight: '800', display: 'inline-block',
                                                marginBottom: 'var(--space-2)', width: 'fit-content'
                                            }}>
                                                {catName}
                                            </span>
                                        )}
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--secondary)' }}>{title}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem' }}>
                                            <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                {tHomeNew('viewDetails')} <ArrowRight size={16} style={{ marginLeft: isAr ? 0 : '0.2rem', marginRight: isAr ? '0.2rem' : 0 }} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        )}
      </div>
    </section>
  );
}
