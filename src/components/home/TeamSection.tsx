"use client";

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

export default function TeamSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const teamMembers = [
    { name: 'أيمن كفري', title: tHomeNew('agriEng'), img: '/images/hero.png' },
    { name: 'ايمان أبو الرب', title: tHomeNew('agriEng'), img: '/images/hero.png' },
    { name: 'عدين الظاهر', title: tHomeNew('agriEng'), img: '/images/hero.png' },
  ];

  return (
    <section className="section" style={{ backgroundColor: '#f8fafc', padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 800 }}>{tHomeNew('ourTeam')}</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '1.2rem' }}>{tHomeNew('teamSubtitle')}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {teamMembers.map((member, idx) => (
            <div key={idx} className="card hover-card" style={{ 
              textAlign: 'center', padding: '3rem 2rem', backgroundColor: 'white', 
              borderRadius: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' 
            }}>
              <div style={{ 
                width: '140px', height: '140px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 1.5rem',
                overflow: 'hidden', position: 'relative', border: '5px solid #f8fafc'
              }}>
                <Image src={member.img} alt={member.name} fill style={{ objectFit: 'cover' }} /> 
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>{member.name}</h3>
              <p style={{ color: 'var(--primary)', fontSize: '1rem', fontWeight: 600 }}>{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
