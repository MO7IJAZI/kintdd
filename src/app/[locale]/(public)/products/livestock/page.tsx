import prisma from "@/lib/prisma";
import { Link } from "@/navigation";
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package, Beef, Rabbit } from 'lucide-react';
import Image from 'next/image';

export const revalidate = 300;

interface SubcategoryCard {
  name: string;
  name_ar: string;
  slug: string;
  description: string;
  description_ar: string;
  productsCount: number;
}

export default async function LivestockPage() {
  const locale = await getLocale();
  const t = await getTranslations('ProductsPage');
  const isAr = locale === 'ar';

  let parentCategory = null;
  let subcategories: SubcategoryCard[] = [];

  try {
    // Fetch the main category (animal-production)
    parentCategory = await prisma.category.findUnique({
      where: { slug: 'animal-production' },
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
    console.error('Error fetching livestock categories:', error);
  }

  const categoryName = isAr ? 'الثروة الحيوانية' : 'Animal Production';
  const categoryDesc = isAr 
    ? 'منتجات الثروة الحيوانية وحلول تغذية الحيوان' 
    : 'Veterinary products and animal nutrition solutions';

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

      {/* Hero Cards Section */}
      <section style={{ padding: '4rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {/* Animal Products Card */}
            <Link
              href="/products/livestock/animal-products"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                height: '350px',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}>
                <Image
                  src="/images/animals-hero.png"
                  alt={isAr ? 'المنتجات الحيوانية' : 'Animal Products'}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(20, 35, 70, 0.9) 0%, rgba(20, 35, 70, 0.3) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2.5rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(233, 73, 108, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Beef style={{ width: '30px', height: '30px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {isAr ? 'المنتجات الحيوانية' : 'Animal Products'}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '1rem'
                  }}>
                    {isAr 
                      ? 'منتجات عامة لصحة وتغذية الحيوان' 
                      : 'General animal health and nutrition products'}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e9496c',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    <span>{isAr ? 'تصفح المنتجات' : 'Browse Products'}</span>
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </div>
                </div>
              </div>
            </Link>

            {/* By Animal Type Card */}
            <Link
              href="/products/livestock/by-animal-type"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                height: '350px',
                cursor: 'pointer',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}>
                <Image
                  src="/images/pig.jpg"
                  alt={isAr ? 'حسب نوع الحيوان' : 'By Animal Type'}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(20, 35, 70, 0.9) 0%, rgba(20, 35, 70, 0.3) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '2.5rem'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    background: 'rgba(233, 73, 108, 0.9)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Rabbit style={{ width: '30px', height: '30px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'white',
                    marginBottom: '0.5rem'
                  }}>
                    {isAr ? 'حسب نوع الحيوان' : 'By Animal Type'}
                  </h3>
                  <p style={{
                    fontSize: '1rem',
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '1rem'
                  }}>
                    {isAr 
                      ? 'منتجات مصنفة حسب نوع الحيوان' 
                      : 'Products categorized by animal type'}
                  </p>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#e9496c',
                    fontWeight: 600,
                    fontSize: '1rem'
                  }}>
                    <span>{isAr ? 'تصفح المنتجات' : 'Browse Products'}</span>
                    <ArrowRight style={{ width: '20px', height: '20px' }} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
