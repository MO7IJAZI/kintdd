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
}

interface CategoriesSectionProps {
    products?: Product[];
}

export default function CategoriesSection({ products = [] }: CategoriesSectionProps) {
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
          {/* Plant Wealth Card */}
          <div className="card" style={{ 
            overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white', 
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <Image 
                src="/images/planet.webp" 
                alt={tHomeNew('prodPlant')} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
              }} />
              <div style={{ 
                position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
              }}>
                <PlantIcon size={32} />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)' }}>{tHomeNew('prodPlant')}</span>
              </div>
            </div>
            <div style={{ padding: '3.5rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-4)', fontWeight: 900, color: 'var(--secondary)' }}>{tHomeNew('prodPlant')}</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-12)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {tHomeNew('agriculturalDesc')}
              </p>
              <Link href="/products/plant-wealth" className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {tHomeNew('viewProducts')} <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0 }} />
              </Link>
            </div>
          </div>

          {/* Livestock / Animal Wealth Card */}
          <div className="card" style={{ 
            overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white', 
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <Image 
                src="/images/livestock.jpg" 
                alt={tHomeNew('prodAnimal')} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
              }} />
              <div style={{ 
                position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
                color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
              }}>
                <CowIcon size={32} />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)' }}>{tHomeNew('prodAnimal')}</span>
              </div>
            </div>
            <div style={{ padding: '3.5rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-4)', fontWeight: 900, color: 'var(--secondary)' }}>{tHomeNew('prodAnimal')}</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-12)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {tHomeNew('animalDesc')}
              </p>
              <Link href="/products/livestock" className="btn btn-secondary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {tHomeNew('viewProducts')} <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0 }} />
              </Link>
            </div>
          </div>
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
                                    <div style={{ position: 'relative', height: '220px', backgroundColor: '#fff', padding: '1.5rem' }}>
                                        {product.image && (
                                            <Image src={product.image} alt={title} fill style={{ objectFit: 'contain', padding: '1rem' }} />
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
