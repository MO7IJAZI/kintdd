import prisma from "@/lib/prisma";
import Image from "next/image";
import { getLocale } from "next-intl/server";

export const revalidate = 300;

export default async function ByAnimalTypePage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const types = await prisma.animalType.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { issues: { where: { isActive: true }, orderBy: { order: 'asc' } } }
  });

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', overflowX: 'hidden' }}>
      <section style={{
        background: 'linear-gradient(rgba(20, 35, 70, 0.75), rgba(20, 35, 70, 0.65)), url(/images/banners/products-banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        padding: '6rem 1rem',
        textAlign: 'center',
        minHeight: '360px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '900px' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            {isAr ? 'حسب نوع الحيوان' : 'By Animal Type'}
          </h1>
          <p style={{ fontSize: '1.05rem', opacity: 0.95 }}>
            {isAr ? 'تصفح الأنواع الحيوانية وقضاياها الشائعة' : 'Browse animal types and their most common issues'}
          </p>
        </div>
      </section>

      {/* Animal Types Grid */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#142346', marginBottom: '0.5rem' }}>
              {isAr ? 'الأنواع الحيوانية' : 'Animal Types'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #e9496c, #142346)', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {types.map(type => {
              const title = isAr ? type.name_ar || type.name : type.name;
              const desc = isAr ? type.description_ar || type.description : type.description;
              return (
                <div key={type.id} className="card" style={{ overflow: 'hidden' }}>
                  {type.imageUrl && (
                    <div style={{ position: 'relative', height: '160px', background: '#f8fafc' }}>
                      <Image src={type.imageUrl} alt={title} fill style={{ objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#142346', marginBottom: '0.5rem' }}>{title}</h3>
                    {desc && <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Most Common Issues */}
      <section style={{ padding: '4rem 1rem', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#142346', marginBottom: '0.5rem' }}>
              {isAr ? 'المشكلات الشائعة' : 'Most Common Issues'}
            </h2>
            <div style={{ width: '60px', height: '4px', background: 'linear-gradient(90deg, #e9496c, #142346)', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'grid', gap: '2rem' }}>
            {types.map(type => {
              const title = isAr ? type.name_ar || type.name : type.name;
              if (!type.issues.length) return null;
              return (
                <div key={type.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '1rem 1.25rem', background: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontWeight: 800, color: '#142346' }}>{title}</span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{isAr ? 'القضايا' : 'Issues'}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.25rem' }}>
                    {type.issues.map(issue => {
                      const itTitle = isAr ? issue.title_ar || issue.title : issue.title;
                      const itDesc = isAr ? issue.description_ar || issue.description : issue.description;
                      return (
                        <div key={issue.id} className="card" style={{ padding: '1rem' }}>
                          <h4 style={{ fontWeight: 700, color: '#142346', marginBottom: '0.5rem' }}>{itTitle}</h4>
                          {itDesc && <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{itDesc}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
