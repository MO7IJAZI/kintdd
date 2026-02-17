"use client";

import { Briefcase, Users, ShieldCheck, Leaf } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export default function StatsSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setMounted(true), 0);
    const timer2 = setTimeout(() => setIsVisible(true), 100);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  if (!mounted) return (
    <section style={{ 
      backgroundColor: 'var(--secondary)', 
      color: 'white', 
      padding: '5rem 0',
      position: 'relative',
      backgroundImage: 'url(/images/banners/laboratory-research.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay',
      minHeight: '300px'
    }} />
  );

  const stats = [
    { num: '100', label: tHomeNew('statsProduct'), icon: <Briefcase size={32} /> },
    { num: '1,000', label: tHomeNew('statsClient'), icon: <Users size={32} /> },
    { num: '100', label: tHomeNew('statsAgency'), icon: <ShieldCheck size={32} /> },
    { num: '100', label: tHomeNew('statsDistributor'), icon: <Leaf size={32} /> },
  ];

  return (
    <section style={{ 
      backgroundColor: 'var(--secondary)', 
      color: 'white', 
      padding: '5rem 0',
      position: 'relative',
      backgroundImage: 'url(/images/banners/laboratory-research.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          {stats.map((stat, idx) => (
            <div 
              key={idx} 
              style={{ 
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.6s ease-out ${idx * 0.1}s, transform 0.6s ease-out ${idx * 0.1}s`
              }}
            >
              <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '0.5rem', lineHeight: 1 }}>{stat.num}</div>
              <div style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
