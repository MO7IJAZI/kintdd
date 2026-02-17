"use client";

import Image from 'next/image';
import { Leaf, Tractor, Microscope, ShieldCheck } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function MissionSection() {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section className="section home-section-pad" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 4rem' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1.5rem', fontWeight: 800 }}>{tHomeNew('ourMission')}</h2>
          <p style={{ fontSize: '1.5rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{tHomeNew('missionDesc')}</p>
        </div>
        <div className="home-mission-video" style={{ 
          position: 'relative', height: '500px', borderRadius: '2rem', overflow: 'hidden', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)', backgroundColor: 'var(--secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* Background animated gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
              zIndex: 0
            }} />
            
            {/* Animated Rings */}
            <div className="animate-pulse-ring" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '300px', height: '300px', border: '1px solid rgba(233, 73, 108, 0.3)', borderRadius: '50%',
              zIndex: 1
            }} />
            <div className="animate-pulse-ring" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '450px', height: '450px', border: '1px solid rgba(233, 73, 108, 0.1)', borderRadius: '50%',
              zIndex: 1, animationDelay: '1s'
            }} />

            {/* Central Hub */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              zIndex: 10, textAlign: 'center'
            }}>
              <div className="animate-float" style={{
                width: '120px', height: '120px', backgroundColor: 'white', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 40px rgba(233, 73, 108, 0.4)',
                margin: '0 auto 1.5rem'
              }}>
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                  <Image src="/images/logo.png" alt="KINT Logo" fill style={{ objectFit: 'contain' }} />
                </div>
              </div>
              <h3 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '2px' }}>KINT</h3>
              <p style={{ color: 'var(--primary)', fontSize: '0.9rem', letterSpacing: '1px' }}>INTERNATIONAL</p>
            </div>

            {/* Orbiting Elements */}
            <div className="animate-spin-slow" style={{
              position: 'absolute', top: '50%', left: '50%', width: '300px', height: '300px',
              marginLeft: '-150px', marginTop: '-150px', zIndex: 5
            }}>
              {/* Satellite 1: Plant */}
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                  <Leaf color="var(--primary)" size={24} />
                </div>
              </div>
              {/* Satellite 2: Animal */}
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                  <Tractor color="var(--secondary)" size={24} />
                </div>
              </div>
              {/* Satellite 3: Science */}
              <div style={{ position: 'absolute', top: '50%', left: 0, transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                  <Microscope color="var(--accent)" size={24} />
                </div>
              </div>
              {/* Satellite 4: Quality */}
              <div style={{ position: 'absolute', top: '50%', right: 0, transform: 'translate(50%, -50%)' }}>
                <div style={{ width: '50px', height: '50px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}>
                  <ShieldCheck color="#10b981" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </section>
  );
}
