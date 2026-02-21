"use client";

import Image from 'next/image';
import { Briefcase } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function AgentsMarquee() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const agentLogos: Array<{ src?: string; alt: string }> = [
    { src: "/images/agents/company1.png", alt: "Agent 1" },
    { src: "/images/agents/company2.png", alt: "Agent 2" },
    { src: "/images/agents/company3.png", alt: "Agent 3" },
    { src: "/images/agents/company4.png", alt: "Agent 4" },
    { src: "/images/agents/company5.png", alt: "Agent 5" },
    { src: "/images/agents/company1.png", alt: "Agent 1" },
    { src: "/images/agents/company2.png", alt: "Agent 2" },
    { src: "/images/agents/company3.png", alt: "Agent 3" },
    { src: "/images/agents/company4.png", alt: "Agent 4" },
    { src: "/images/agents/company5.png", alt: "Agent 5" },
  ];

  return (
    <section className="section home-section-pad" style={{ padding: '6rem 0', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 800 }}>{tHomeNew('ourAgents')}</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '4rem', fontSize: '1.2rem' }}>{tHomeNew('agentsSubtitle')}</p>
        
        <div className="slider-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative' }}>
          <div className="slider-track" style={{ display: 'inline-block', animation: `slide 30s linear infinite` }}>
            {agentLogos.map((logo, index) => (
              <div key={index} style={{ display: 'inline-block', width: '200px', height: '100px', margin: '0 20px', verticalAlign: 'middle', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid var(--border)', position: 'relative' }}>
                {logo.src ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
                        <Image src={logo.src} alt={logo.alt} fill style={{ objectFit: 'contain' }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Briefcase size={32} color="#94a3b8" />
                    </div>
                )}
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {agentLogos.map((logo, index) => (
              <div key={`dup-${index}`} style={{ display: 'inline-block', width: '200px', height: '100px', margin: '0 20px', verticalAlign: 'middle', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid var(--border)', position: 'relative' }}>
                {logo.src ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
                        <Image src={logo.src} alt={logo.alt} fill style={{ objectFit: 'contain' }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Briefcase size={32} color="#94a3b8" />
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes slide {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          /* RTL support if needed, though simple slide left usually works for marquees */
          ${isAr ? `
          @keyframes slide {
            from {
              transform: translateX(0); 
            }
            to {
              transform: translateX(50%);
            }
          }` : ''}
        `}</style>
      </div>
    </section>
  );
}
