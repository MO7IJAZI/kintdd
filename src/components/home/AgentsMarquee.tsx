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
  ];
  const marqueeLogos = [...agentLogos, ...agentLogos];

  return (
    <section className="section home-section-pad" style={{ padding: '6rem 0' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 800 }}>{tHomeNew('ourAgents')}</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '4rem', fontSize: '1.2rem' }}>{tHomeNew('agentsSubtitle')}</p>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '1.5rem', padding: '1.5rem 0' }}>
          <div
            className="agents-marquee"
            style={{
              display: 'flex',
              width: 'max-content',
              gap: '2.5rem',
              animation: `${isAr ? 'agentsMarqueeRtl' : 'agentsMarqueeLtr'} 22s linear infinite`,
              willChange: 'transform',
            }}
          >
            {marqueeLogos.map((logo, idx) => (
              <div
                key={`${logo.alt}-${idx}`}
                className="hover-card agents-card"
                style={{
                  width: '200px',
                  height: '96px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0.85,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {logo.src ? (
                  <Image src={logo.src} alt={logo.alt} fill style={{ objectFit: 'contain', padding: '1.25rem' }} />
                ) : (
                  <Briefcase size={32} color="#94a3b8" />
                )}
              </div>
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 12%, rgba(255,255,255,0) 88%, rgba(255,255,255,1) 100%)',
            }}
          />

          <style jsx>{`
            .agents-marquee:hover {
              animation-play-state: paused;
            }
            @keyframes agentsMarqueeLtr {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes agentsMarqueeRtl {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}
