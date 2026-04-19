import prisma from "@/lib/prisma";
import { getTranslations, getLocale } from 'next-intl/server';
import { PawPrint, ArrowRight, Leaf } from 'lucide-react';
import Image from "next/image";
import { Link } from "@/navigation";

export const revalidate = 300;

export default async function ProductsForAnimalsPage({
  searchParams
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: activeCategory } = await searchParams;
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const t = await getTranslations('ProductsForAnimals');

  const where: any = { isActive: true };

  const animalTypes = await prisma.animalType.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const categoriesMap = new Map<string, string>();
  animalTypes.forEach(a => {
    if (a.category && a.category.trim() !== '') {
      if (!categoriesMap.has(a.category)) {
        categoriesMap.set(a.category, isAr && a.category_ar ? a.category_ar : a.category);
      }
    }
  });
  
  const uniqueCategories = Array.from(categoriesMap.entries());

  const toPlainText = (html?: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  };

  const filteredAnimalTypes = activeCategory
    ? animalTypes.filter(a => a.category === activeCategory)
    : animalTypes;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--muted)' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, var(--secondary) 0%, #1c2f5d 100%)',
        padding: '6rem 2rem 4rem',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.08,
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
            <PawPrint style={{ width: '48px', height: '48px' }} />
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: '800',
              margin: 0
            }}>
              {isAr ? 'أدلة الثروة الحيوانية' : 'Animal Guides'}
            </h1>
          </div>
          <p style={{
            fontSize: '1.25rem',
            opacity: 0.95,
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: 1.6
          }}>
            {isAr
              ? 'اكتشف برامج التغذية والرعاية الأمثل لكل نوع من الثروة الحيوانية'
              : 'Discover optimal nutrition and care programs for each livestock type'}
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
            <span style={{ fontWeight: '600' }}>{isAr ? 'الثروة الحيوانية' : 'Animal Guides'}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      {animalTypes.length > 0 && (
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
              href="/products/livestock/by-animal-type"
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '2rem',
                background: !activeCategory ? '#142346' : 'var(--muted)',
                color: !activeCategory ? 'white' : 'var(--foreground)',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Leaf style={{ width: '18px', height: '18px' }} />
              {isAr ? 'الكل' : 'All'}
            </Link>
            {uniqueCategories.map(([catSlug, catName]) => {
              return (
                <Link
                  key={catSlug}
                  href={{ pathname: '/products/livestock/by-animal-type', query: { category: catSlug } } as any}
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: '2rem',
                    background: activeCategory === catSlug ? '#142346' : 'var(--muted)',
                    color: activeCategory === catSlug ? 'white' : 'var(--foreground)',
                    textDecoration: 'none',
                    fontWeight: activeCategory === catSlug ? '600' : '500',
                    fontSize: '0.95rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {catName}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Animal Types Grid */}
      <div style={{ padding: '3rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        {filteredAnimalTypes.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--background)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <PawPrint style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5, color: '#142346' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>
              {isAr ? 'لا توجد نتائج' : 'No results found'}
            </h3>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {filteredAnimalTypes.map((animal) => {
              const animalName = isAr ? (animal.name_ar || animal.name) : animal.name;
              const animalDesc = toPlainText(isAr ? (animal.description_ar || animal.description) : animal.description);

              return (
                <Link
                  key={animal.id}
                  href={`/products/livestock/by-animal-type/${animal.slug}` as any}
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
                      background: 'white',
                      overflow: 'hidden'
                    }}>
                      {animal.imageUrl ? (
                        <Image
                          src={animal.imageUrl}
                          alt={animalName}
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
                          <PawPrint style={{ width: '64px', height: '64px', opacity: 0.4, color: '#142346' }} />
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
                        {animalName}
                      </h3>
                      {animalDesc && (
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
                          {animalDesc}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginTop: 'auto'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: '#142346',
                          fontWeight: '600',
                          fontSize: '0.9rem'
                        }}>
                          {isAr ? 'عرض الدليل' : 'View Guide'}
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
        background: 'linear-gradient(135deg, #142346 0%, #1c2f5d 100%)',
        padding: '4rem 2rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '1rem' }}>
            {isAr ? 'هل تحتاج إلى برنامج مخصص؟' : 'Need a Custom Program?'}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: '2rem' }}>
            {isAr
              ? 'تواصل مع خبرائنا للحصول على استشارة مجانية وبرنامج تغذية مخصص لثروتك الحيوانية'
              : 'Contact our experts for a free consultation and customized nutrition plan for your livestock'}
          </p>
          <Link
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2rem',
              background: 'var(--background)',
              color: '#142346',
              borderRadius: '2rem',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            {isAr ? 'استشر خبير' : 'Consult an Expert'}
          </Link>
        </div>
      </div>
    </div>
  );
}
