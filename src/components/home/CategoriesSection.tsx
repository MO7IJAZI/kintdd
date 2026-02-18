"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Leaf, Users, ArrowRight } from 'lucide-react';

export default function CategoriesSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="section" style={{ padding: '8rem 0', backgroundColor: '#fcfcfc' }}>
      <div className="container">
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
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 'var(--space-12)' }}>
          {/* Agricultural Products Card */}
          <div className="card" style={{ 
            overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white', 
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <Image 
                src="/images/about/plant_production.webp" 
                alt={tHomeNew('prodPlant')} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
              }} />
              <div style={{ 
                position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
              }}>
                <Leaf size={32} />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)' }}>{tHomeNew('prodPlant')}</span>
              </div>
            </div>
            <div style={{ padding: '3.5rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-4)', fontWeight: 900, color: 'var(--secondary)' }}>{tHomeNew('prodPlant')}</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-12)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {tHomeNew('agriculturalDesc')}
              </p>
              <Link href="/product-category/agricultural" className="btn btn-primary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {tHomeNew('viewProducts')} <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0 }} />
              </Link>
            </div>
          </div>

          {/* Animal Products Card */}
          <div className="card" style={{ 
            overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white', 
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column', height: '100%'
          }}>
            <div style={{ position: 'relative', height: '400px' }}>
              <Image 
                src="/images/animals-hero.png" 
                alt={tHomeNew('prodAnimal')} 
                fill 
                style={{ objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)'
              }} />
              <div style={{ 
                position: 'absolute', bottom: '2rem', left: isAr ? 'auto' : '2.5rem', right: isAr ? '2.5rem' : 'auto',
                backgroundColor: 'white', padding: '1.25rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
                color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)'
              }}>
                <Users size={32} />
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)' }}>{tHomeNew('prodAnimal')}</span>
              </div>
            </div>
            <div style={{ padding: '3.5rem', textAlign: isAr ? 'right' : 'left', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '2.2rem', marginBottom: 'var(--space-4)', fontWeight: 900, color: 'var(--secondary)' }}>{tHomeNew('prodAnimal')}</h3>
              <p style={{ color: 'var(--muted-foreground)', marginBottom: 'var(--space-12)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                {tHomeNew('animalDesc')}
              </p>
              <Link href="/product-category/animal" className="btn btn-secondary" style={{ alignSelf: 'flex-start', borderRadius: 'var(--radius-2xl)', padding: '1rem 2.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                {tHomeNew('viewProducts')} <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0 }} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
