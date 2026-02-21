import prisma from "@/lib/prisma";
import { getTranslations, getLocale } from 'next-intl/server';
import { notFound } from "next/navigation";
import { Sprout, ArrowRight, Leaf } from 'lucide-react';
import Image from "next/image";
import { Link } from "@/navigation";

export const revalidate = 300;

interface Crop {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  category?: string | null;
  category_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  image?: string | null;
  harvestSeason_ar?: string | null;
}

async function getCropsData() {
  const t = await getTranslations('CropGuides');
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const crops = await prisma.crop.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  }) as Crop[];

  return { crops, t, isAr };
}

export default async function CropsPage() {
  const { crops, t, isAr } = await getCropsData();

  // Get unique categories from crops
  const categories = [...new Set(crops.map(crop => crop.category).filter(Boolean))];
  
  const toPlainText = (html?: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };
  
  const getCategoryName = (category: string) => {
    const keyMap: Record<string, string> = {
      'vegetables': 'vegetables',
      'fruits': 'fruits', 
      'legumes': 'legumes',
      'cereals': 'cereals',
      'industrial': 'industrial',
      'herbs': 'herbs'
    };
    return t(keyMap[category] || category);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--muted)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <Sprout style={{ width: '48px', height: '48px' }} />
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 3.5rem)', 
              fontWeight: '800',
              margin: 0
            }}>
              {t('title')}
            </h1>
          </div>
          <p style={{ 
            fontSize: '1.25rem', 
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            {t('subtitle')}
          </p>
          
          {/* Breadcrumb */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem',
            fontSize: '0.95rem',
            opacity: 0.9
          }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <span>/</span>
            <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
              {isAr ? 'المنتجات' : 'Products'}
            </Link>
            <span>/</span>
            <Link href="/products/plant-wealth" style={{ color: 'inherit', textDecoration: 'none' }}>
              {isAr ? 'الثروة النباتية' : 'Plant Wealth'}
            </Link>
            <span>/</span>
            <span style={{ fontWeight: '600' }}>{isAr ? 'المحاصيل' : 'Crops'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div style={{
        background: 'var(--background)',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link
            href="/products/plant-wealth/crops"
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '2rem',
              background: 'var(--primary)',
              color: 'white',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Leaf style={{ width: '18px', height: '18px' }} />
            {t('all')}
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products/plant-wealth/crops?category=${category}` as any}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                background: 'var(--muted)',
                color: 'var(--foreground)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.95rem',
                transition: 'all 0.2s ease'
              }}
            >
              {getCategoryName(category!)}
            </Link>
          ))}
        </div>
      </div>

      {/* Crops Grid */}
      <div style={{ padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {crops.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--background)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <Sprout style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {t('noCropsFound')}
            </h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {crops.map((crop) => {
              const cropName = isAr ? crop.name_ar || crop.name : crop.name;
              const cropDescHtml = isAr ? crop.description_ar || crop.description : crop.description;
              const cropDesc = toPlainText(cropDescHtml);
              const cropCategory = isAr ? crop.category_ar || crop.category : crop.category;
              
              return (
                <Link
                  key={crop.id}
                  href={`/crops/${crop.slug}` as any}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block'
                  }}
                >
                  <div style={{
                    background: 'var(--background)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Image */}
                    <div style={{
                      position: 'relative',
                      height: '200px',
                      background: 'var(--muted)',
                      overflow: 'hidden'
                    }}>
                      {crop.image ? (
                        <Image
                          src={crop.image}
                          alt={cropName}
                          fill
                          style={{ objectFit: 'contain', padding: '1rem' }}
                        />
                      ) : (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
                        }}>
                          <Sprout style={{ width: '64px', height: '64px', opacity: 0.5, color: 'var(--primary)' }} />
                        </div>
                      )}
                      {/* Category Badge */}
                      {cropCategory && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          background: 'var(--primary)',
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '1rem',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {cropCategory}
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--foreground)',
                        marginBottom: '0.75rem'
                      }}>
                        {cropName}
                      </h3>
                      {cropDesc && (
                        <p style={{
                          fontSize: '0.9rem',
                          color: 'var(--muted-foreground)',
                          lineHeight: 1.6,
                          marginBottom: '1rem',
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {cropDesc}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 'auto'
                      }}>
                        {crop.harvestSeason_ar && (
                          <span style={{
                            fontSize: '0.85rem',
                            color: 'var(--primary)',
                            fontWeight: '500'
                          }}>
                            {isAr ? 'موسم الحصاد: ' : 'Harvest: '}{crop.harvestSeason_ar}
                          </span>
                        )}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: 'var(--primary)',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>
                          {t('viewProgram')}
                          <ArrowRight style={{ width: '16px', height: '16px' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            {t('needCustomProgram')}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '2rem' }}>
            {t('customProgramDesc')}
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'var(--background)',
              color: 'var(--primary)',
              borderRadius: '2rem',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            {t('consultExpert')}
          </Link>
        </div>
      </div>
    </div>
  );
}
