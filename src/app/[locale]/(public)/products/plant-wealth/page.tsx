import prisma from "@/lib/prisma";
import { Link } from "@/navigation";
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package } from 'lucide-react';

export const revalidate = 300;

interface SubcategoryCard {
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  productsCount: number;
}

export default async function PlantWealthPage() {
  const locale = await getLocale();
  const t = await getTranslations('ProductsPage');
  const isAr = locale === 'ar';

  let parentCategory = null;
  let subcategories: SubcategoryCard[] = [];

  try {
    // Fetch the main category (plant-production)
    parentCategory = await prisma.category.findUnique({
      where: { slug: 'plant-production' },
      include: {
        children: {
          where: { isActive: true },
          include: {
            _count: { select: { products: true } }
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (parentCategory) {
      subcategories = parentCategory.children.map((child: any) => ({
        name: child.name,
        name_ar: child.name_ar,
        slug: child.slug,
        description: child.description || '',
        description_ar: child.description_ar || '',
        productsCount: child._count.products
      }));
    }
  } catch (error) {
    console.error('Error fetching plant wealth categories:', error);
  }

  const categoryName = isAr ? 'الثروة النباتية' : 'Plant Production';
  const categoryDesc = isAr 
    ? 'منتجات الثروة النباتية لتغذية وحماية المحاصيل' 
    : 'Agricultural products for crop nutrition and protection';

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(rgba(20, 35, 70, 0.75), rgba(20, 35, 70, 0.65)), url(/images/banners/products-banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        padding: '6rem 1rem',
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '900px', position: 'relative', zIndex: 2 }}>
          <div style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '1rem' }}>
            <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
              {isAr ? 'المنتجات' : 'Products'}
            </Link>
            {' / '}
            <span>{categoryName}</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1.5rem',
            lineHeight: 1.1,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {categoryName}
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            {categoryDesc}
          </p>
        </div>
      </section>

      {/* Subcategories Grid */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 800,
              color: '#142346',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              {isAr ? 'الأقسام الفرعية' : 'Subcategories'}
            </h2>
            <div style={{
              width: '80px',
              height: '4px',
              background: 'linear-gradient(90deg, #e9496c, #142346)',
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>

          {subcategories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
              <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                {isAr ? 'لا توجد فئات فرعية متاحة' : 'No subcategories available'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.slug}
                  href={`/products/plant-wealth/${subcategory.slug}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '2rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e9496c';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                    (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                  }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: '#142346',
                        marginBottom: '1rem'
                      }}>
                        {isAr ? subcategory.name_ar : subcategory.name}
                      </h3>
                      <p style={{
                        color: '#666',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem'
                      }}>
                        {isAr ? subcategory.description_ar : subcategory.description}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '1rem',
                      borderTop: '1px solid #e2e8f0',
                      color: '#e9496c',
                      fontWeight: 600
                    }}>
                      <span>{subcategory.productsCount} {isAr ? 'منتج' : 'products'}</span>
                      <ArrowRight style={{ width: '20px', height: '20px' }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
