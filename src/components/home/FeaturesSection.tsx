"use client";

import { Lightbulb, ShieldCheck, Users } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function FeaturesSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section style={{ padding: '0 0 6rem', backgroundColor: '#fff', position: 'relative', zIndex: 2 }}>
      <div className="container" style={{ marginTop: '-5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-12)' }}>
          {/* Feature 1 */}
          <div className="card" style={{ 
            padding: '3.5rem 2.5rem', 
            textAlign: 'center', 
            backgroundColor: 'white', 
            boxShadow: 'var(--shadow-xl)', 
            borderRadius: 'var(--radius-2xl)', 
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
             <div style={{ 
               width: '90px', height: '90px', backgroundColor: 'var(--primary-light)', 
               borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 2rem', color: 'var(--primary)',
               transform: 'rotate(-5deg)'
             }}>
               <Lightbulb size={45} strokeWidth={1.5} />
             </div>
             <h3 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{tHomeNew('innovationTitle')}</h3>
             <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, fontSize: '1.05rem' }}>{tHomeNew('innovationDesc')}</p>
          </div>
          {/* Feature 2 */}
           <div className="card" style={{ 
             padding: '3.5rem 2.5rem', 
             textAlign: 'center', 
             backgroundColor: 'white', 
             boxShadow: 'var(--shadow-xl)', 
             borderRadius: 'var(--radius-2xl)', 
             border: 'none',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center'
           }}>
             <div style={{ 
               width: '90px', height: '90px', backgroundColor: '#eff6ff', 
               borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 2rem', color: 'var(--info)',
               transform: 'rotate(5deg)'
             }}>
               <ShieldCheck size={45} strokeWidth={1.5} />
             </div>
             <h3 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{tHomeNew('qualityTitle')}</h3>
             <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, fontSize: '1.05rem' }}>{tHomeNew('qualityDesc')}</p>
          </div>
          {/* Feature 3 */}
           <div className="card" style={{ 
             padding: '3.5rem 2.5rem', 
             textAlign: 'center', 
             backgroundColor: 'white', 
             boxShadow: 'var(--shadow-xl)', 
             borderRadius: 'var(--radius-2xl)', 
             border: 'none',
             display: 'flex',
             flexDirection: 'column',
             alignItems: 'center'
           }}>
             <div style={{ 
               width: '90px', height: '90px', backgroundColor: '#fff7ed', 
               borderRadius: 'var(--radius-2xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
               margin: '0 auto 2rem', color: 'var(--accent)',
               transform: 'rotate(-5deg)'
             }}>
               <Users size={45} strokeWidth={1.5} />
             </div>
             <h3 style={{ fontSize: '1.6rem', marginBottom: '1.25rem', fontWeight: 800, color: 'var(--secondary)' }}>{tHomeNew('globalTitle')}</h3>
             <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.8, fontSize: '1.05rem' }}>{tHomeNew('globalDesc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
