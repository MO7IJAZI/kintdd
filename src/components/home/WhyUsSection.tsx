"use client";

import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function WhyUsSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="section home-section-pad" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5rem', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{tHomeNew('whyUs')}</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.5rem', marginBottom: '1.5rem', fontWeight: 800 }}>{tHomeNew('whyUsSubtitle')}</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.8', color: 'var(--muted-foreground)' }}>
              {tHomeNew('whyUsDesc')}
            </p>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[
                tHomeNew('whyUsPoint1'),
                tHomeNew('whyUsPoint2'),
                tHomeNew('whyUsPoint3')
              ].map((point, idx) => (
                <li key={idx} style={{ 
                  marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem',
                  padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '1rem',
                  border: '1px solid #f1f5f9'
                }}>
                  <div style={{ 
                    minWidth: '30px', height: '30px', backgroundColor: 'var(--primary)', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="home-why-image" style={{ position: 'relative', height: '600px', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}>
            <Image src="/images/banners/laboratory-research.jpg" alt="Why Us" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
