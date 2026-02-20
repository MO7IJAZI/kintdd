import prisma from "@/lib/prisma";
import { Link } from "@/navigation";
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package } from 'lucide-react';
import { notFound } from "next/navigation";
import Image from "next/image";

export const revalidate = 300;

interface Product {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  image?: string | null;
  shortDesc?: string | null;
  shortDesc_ar?: string | null;
  order?: number;
}

interface CategoryData {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  description_ar?: string | null;
  parent?: { slug: string; name: string; name_ar?: string };
  products: Product[];
}

export default async function SubcategoryPage({ 
  params 
}: { 
  params: Promise<{ subcategory: string; locale: string }> 
}) {
  const { subcategory, locale } = await params;
  const isAr = locale === 'ar';

  let category: CategoryData | null = null;
  let parentPath = '';

  try {
    // Fetch the subcategory with its parent
    const categoryData = await prisma.category.findUnique({
      where: { slug: subcategory },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { order: 'asc' }
        },
        parent: {
          select: { slug: true, name: true, name_ar: true }
        }
      }
    });

    if (!categoryData) {
      notFound();
    }

    category = categoryData as CategoryData;

    // Determine parent path based on parent slug
    if (category.parent?.slug === 'animal-production') {
      parentPath = 'livestock';
    } else if (category.parent?.slug === 'plant-production') {
      parentPath = 'plant-wealth';
    }
  } catch (error) {
    console.error('Error fetching subcategory:', error);
    notFound();
  }

  // At this point, category is guaranteed to be non-null due to notFound() in catch/if blocks
  const categoryName = isAr ? category!.name_ar || category!.name : category!.name;
  const categoryDesc = isAr ? category!.description_ar || category!.description : category!.description;
  const parentName = isAr ? category!.parent?.name_ar || category!.parent?.name : category!.parent?.name;

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
          {/* Breadcrumb */}
          <div style={{ color: 'white', fontWeight: '600', marginBottom: '1rem', fontSize: '0.95rem' }}>
            <Link href="/products" style={{ color: 'inherit', textDecoration: 'none' }}>
              {isAr ? 'المنتجات' : 'Products'}
            </Link>
            {' / '}
            <Link href={`/products/${parentPath}` as '/products/livestock' | '/products/plant-wealth'} style={{ color: 'inherit', textDecoration: 'none' }}>
              {parentName}
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

          {categoryDesc && (
            <p style={{
              fontSize: '1.2rem',
              opacity: 0.95,
              maxWidth: '700px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              {categoryDesc}
            </p>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '6rem 1rem', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#142346',
              marginBottom: '0.5rem'
            }}>
              {isAr ? 'المنتجات' : 'Products'}
            </h2>
            <div style={{
              width: '60px',
              height: '4px',
              background: 'linear-gradient(90deg, #e9496c, #142346)',
              borderRadius: '2px'
            }} />
          </div>

          {/* Products Count */}
          <p style={{
            color: '#666',
            marginBottom: '2rem',
            fontSize: '1rem'
          }}>
            {category!.products.length} {isAr ? 'منتج متاح' : 'products available'}
          </p>

          {category!.products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 1rem',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', color: '#666' }}>
                {isAr ? 'لا توجد منتجات متاحة حالياً' : 'No products available currently'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '2rem',
              marginBottom: '2rem'
            }}>
              {category!.products.map((product) => {
                const productName = isAr ? product.name_ar || product.name : product.name;
                const productDesc = isAr ? product.shortDesc_ar || product.shortDesc : product.shortDesc;

                return (
                  <Link
                    key={product.id}
                    href={{ pathname: '/product/[slug]', params: { slug: product.slug } } as any}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}>
                      {/* Product Image */}
                      {product.image && (
                        <div style={{
                          width: '100%',
                          height: '200px',
                          position: 'relative',
                          backgroundColor: '#f8fafc'
                        }}>
                          <Image
                            src={product.image}
                            alt={productName}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}

                      {/* Product Info */}
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: '#142346',
                          marginBottom: '0.5rem',
                          lineHeight: 1.4
                        }}>
                          {productName}
                        </h3>

                        {productDesc && (
                          <p style={{
                            color: '#666',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            marginBottom: '1rem',
                            flex: 1
                          }}>
                            {productDesc}
                          </p>
                        )}

                        {/* View Details Link */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          color: '#e9496c',
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          gap: '0.5rem'
                        }}>
                          <span>{isAr ? 'عرض التفاصيل' : 'View Details'}</span>
                          <ArrowRight style={{ width: '18px', height: '18px' }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
