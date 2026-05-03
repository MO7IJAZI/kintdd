import prisma from "@/lib/prisma";
import { ensureCoreCategoriesExist } from "@/lib/data";
import { Link } from "@/navigation";
import { getTranslations, getLocale } from 'next-intl/server';
import { ArrowRight, Package } from 'lucide-react';
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";

export const revalidate = 300;

interface Product {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  image?: string | null;
  images?: { url: string; alt?: string | null }[];
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

export async function generateMetadata({ params }: { params: Promise<{ subcategory: string; locale: string }> }): Promise<Metadata> {
  const { subcategory, locale } = await params;
  const isAr = locale === 'ar';
  await ensureCoreCategoriesExist();

  const category = await prisma.category.findUnique({
    where: { slug: subcategory },
    select: {
      name: true,
      name_ar: true,
      description: true,
      description_ar: true
    }
  });

  if (!category) return {};

  const title = isAr ? (category.name_ar || category.name) : category.name;
  const description = isAr ? (category.description_ar || category.description) : category.description;

  return {
    title: `${title} | KINT`,
    description: description || undefined
  };
}

export default async function SubcategoryPage({ 
  params 
}: { 
  params: Promise<{ subcategory: string; locale: string }> 
}) {
  const { subcategory, locale } = await params;
  const isAr = locale === 'ar';
  await ensureCoreCategoriesExist();

  // Fetch the subcategory with its parent
  const categoryData = await prisma.category.findUnique({
    where: { slug: subcategory },
    include: {
      products: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
        include: {
          images: {
            // where: { alt: 'external-card' }, // Remove filter to get all images and find external-card manually
            select: { url: true, alt: true }
          }
        }
      },
      parent: {
        select: { slug: true, name: true, name_ar: true }
      }
    }
  }).catch(error => {
    console.error('Error fetching subcategory:', error);
    return null;
  });

  if (!categoryData) {
    notFound();
  }

  const category = categoryData as CategoryData;
  let parentPath = '';

  // Determine parent path based on parent slug or fallback
  if (category.parent?.slug === 'livestock') {
    parentPath = 'livestock';
  } else if (category.parent?.slug === 'plant-wealth') {
    parentPath = 'plant-wealth';
  } else {
     // Fallback if parent is missing or unknown
    parentPath = 'livestock';
  }

  // At this point, category is guaranteed to be non-null due to notFound() in catch/if blocks
  const categoryName = isAr ? category.name_ar || category.name : category.name;
  const categoryDesc = isAr ? category.description_ar || category.description : category.description;
  const parentName = category.parent ? (isAr ? category.parent.name_ar || category.parent.name : category.parent.name) : (isAr ? 'الثروة الحيوانية' : 'Livestock');

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
            <Link href={`/products/${parentPath}` as any} style={{ color: 'inherit', textDecoration: 'none' }}>
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
                const externalImage = product.images?.find((img) => img.alt === 'external-card')?.url;
                const productCardImage = externalImage || product.image || '/images/cat-biostimulants.png';

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}` as any}
                    className="card" 
                    style={{
                        overflow: 'hidden', borderRadius: '1.5rem', backgroundColor: 'white',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none', color: 'inherit',
                        display: 'flex', flexDirection: 'column', height: '100%'
                    }}
                  >
                      {/* Product Image */}
                      <div style={{ position: 'relative', height: '260px', backgroundColor: '#fff', padding: '0' }}>
                          <Image
                            src={productCardImage}
                            alt={productName}
                            fill
                            style={{ objectFit: 'cover' }}
                          />
                      </div>

                      {/* Product Info */}
                      <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid #e2e8f0' }}>
                        <span style={{
                            backgroundColor: '#fff0f3', color: '#e9496c',
                            fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '50px',
                            textTransform: 'uppercase', fontWeight: '800', display: 'inline-block',
                            marginBottom: '1rem', width: 'fit-content'
                        }}>
                            {categoryName}
                        </span>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.3, color: '#142346' }}>
                          {productName}
                        </h3>

                        <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {productDesc ? (productDesc.length > 90 ? productDesc.substring(0, 90) + '...' : productDesc) : ''}
                        </p>

                        {/* View Details Link */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <span style={{ color: '#e9496c', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {isAr ? 'عرض التفاصيل' : 'View Details'} {isAr ? '←' : '→'}
                            </span>
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
