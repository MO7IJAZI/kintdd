"use client";

import Image from 'next/image';
import { Briefcase } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface AgentLogo {
  id: string;
  name: string;
  name_ar?: string | null;
  logo: string;
}

interface AgentsMarqueeProps {
  agents?: AgentLogo[];
}

export default function AgentsMarquee({ agents = [] }: AgentsMarqueeProps) {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const fallbackLogos: AgentLogo[] = [
    { id: '1', name: 'Agent 1', logo: "/images/agents/company1.png" },
    { id: '2', name: 'Agent 2', logo: "/images/agents/company2.png" },
    { id: '3', name: 'Agent 3', logo: "/images/agents/company3.png" },
    { id: '4', name: 'Agent 4', logo: "/images/agents/company4.png" },
    { id: '5', name: 'Agent 5', logo: "/images/agents/company5.png" }
  ];

  const agentLogos = agents.length > 0 ? agents : fallbackLogos;

  return (
    <section className="section home-section-pad" style={{ padding: '6rem 0', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', fontWeight: 800 }}>{tHomeNew('ourAgents')}</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '4rem', fontSize: '1.2rem' }}>{tHomeNew('agentsSubtitle')}</p>
        
        <div className="slider-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', position: 'relative', direction: 'ltr' }}>
          <div className="slider-track" style={{ display: 'inline-block', animation: `${isAr ? 'slide-rtl' : 'slide-ltr'} 30s linear infinite` }}>
            {agentLogos.map((logo, index) => (
              <div key={index} style={{ display: 'inline-block', width: '200px', height: '100px', margin: '0 20px', verticalAlign: 'middle', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid var(--border)', position: 'relative' }}>
                {logo.logo ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
                        <Image src={logo.logo} alt={isAr ? (logo.name_ar || logo.name) : logo.name} fill style={{ objectFit: 'contain' }} />
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
                {logo.logo ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', padding: '1rem' }}>
                        <Image src={logo.logo} alt={isAr ? (logo.name_ar || logo.name) : logo.name} fill style={{ objectFit: 'contain' }} />
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
          @keyframes slide-ltr {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
          @keyframes slide-rtl {
            from {
              transform: translateX(-50%);
            }
            to {
              transform: translateX(0);
            }
          }
        `}</style>
      </div>
    </section>
  );
}
