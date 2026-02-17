"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function Hero() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section style={{
      position: 'relative',
      height: '100vh',
      minHeight: '700px',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'var(--secondary)'
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Image
          src="/images/hero.png"
          alt="KINT Hero"
          fill
          priority
          style={{ objectFit: 'cover', opacity: 0.6 }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.5) 50%, transparent 100%)',
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, color: 'white' }}>
        <div style={{ maxWidth: '850px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            backgroundColor: 'rgba(16, 185, 129, 0.15)', 
            padding: '0.5rem 1.25rem', 
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            marginBottom: 'var(--space-8)',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)' }}>
              {tHomeNew('innovation')}
            </span>
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3rem, 6vw, 5rem)', 
            marginBottom: 'var(--space-6)', 
            lineHeight: '1.1', 
            fontWeight: 900,
            letterSpacing: '-0.02em',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {tHomeNew('heroTitle')}
          </h1>
          
          <h2 style={{ 
            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
            marginBottom: 'var(--space-8)', 
            color: 'var(--primary)', 
            fontWeight: 700,
            maxWidth: '700px'
          }}>
             {tHomeNew('heroSubtitle')}
          </h2>
          
          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <Link href="/contact" className="btn btn-primary" style={{ 
              padding: '1.25rem 3rem', 
              fontSize: '1.1rem', 
              borderRadius: 'var(--radius-2xl)',
              boxShadow: '0 15px 30px rgba(16, 185, 129, 0.3)'
            }}>
              {tHomeNew('heroCta')}
              <ArrowRight size={20} style={{ marginLeft: isAr ? 0 : '0.5rem', marginRight: isAr ? '0.5rem' : 0 }} />
            </Link>
            <Link href="/about" className="btn" style={{ 
              padding: '1.25rem 3rem', 
              fontSize: '1.1rem', 
              backgroundColor: 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.3)', 
              color: 'white',
              borderRadius: 'var(--radius-2xl)',
              backdropFilter: 'blur(10px)'
            }}>
              {tHomeNew('discoverMore')}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-2)',
        opacity: 0.6,
        zIndex: 1
      }}>
        <div style={{ 
          width: '2px', 
          height: '60px', 
          background: 'linear-gradient(to bottom, var(--primary), transparent)',
          borderRadius: '1px'
        }}></div>
      </div>
    </section>
  );
}
