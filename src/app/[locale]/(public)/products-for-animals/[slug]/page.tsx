import prisma from "@/lib/prisma";
import Image from "next/image";
import { Link } from "@/navigation";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { stripScripts } from "@/lib/sanitizeHtml";
import { Metadata } from "next";
import { Download, Eye, FileDown } from "lucide-react";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  try {
    const { slug, locale } = await params;
    const isAr = locale === 'ar';
    const animal = await prisma.animalType.findUnique({
      where: { slug },
      select: { name: true, name_ar: true, description: true, description_ar: true }
    });
    if (!animal) return {};
    const name = isAr && animal.name_ar ? animal.name_ar : animal.name;
    const description = isAr && animal.description_ar ? animal.description_ar : animal.description;
    return {
      title: `${name} | KINT`,
      description: description?.substring(0, 160),
    };
  } catch {
    return { title: 'KINT' };
  }
}

export default async function AnimalDetail({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug, locale } = await params;
  const isAr = locale === 'ar';
  const t = await getTranslations('ProductsForAnimals');
  const tNav = await getTranslations('Navigation');

  const animal = await prisma.animalType.findUnique({
    where: { slug },
    include: {
      issues: {
        where: { isActive: true },
        orderBy: { order: 'asc' }
      },
      products: {
        where: { isActive: true },
        take: 6,
        include: { category: true }
      }
    }
  }) as any | null;

  if (!animal) notFound();

  // Collect all product IDs from issues
  const issueProductIds = new Set<string>();
  if (animal.issues) {
      animal.issues.forEach((issue: any) => {
          const recommendation = issue.recommendation as { products?: string[] } | null | undefined;
          if (recommendation && Array.isArray(recommendation.products)) {
              recommendation.products.forEach((id) => issueProductIds.add(id));
          }
      });
  }

  // Fetch products for issues
  const issueProducts = issueProductIds.size > 0
      ? await prisma.product.findMany({
          where: { id: { in: Array.from(issueProductIds) } },
          select: { id: true, name: true, name_ar: true, slug: true }
      })
      : [];
  
  const productsMap = new Map(issueProducts.map((p) => [p.id, p]));

  const name = isAr && animal.name_ar ? animal.name_ar : animal.name;
  const description = isAr && animal.description_ar ? animal.description_ar : (animal.description || '');
  const safeDescription = stripScripts(description);

  const rawPdfUrl = (isAr && animal.pdfUrl_ar) ? animal.pdfUrl_ar : animal.pdfUrl;
  const normalizedPdfUrl = (rawPdfUrl || '').replace(/^\/(en|ar)(?=\/uploads\/)/, '');
  const updatedAtMs = animal.updatedAt ? new Date(animal.updatedAt).getTime() : 0;
  const pdfPreviewUrl = normalizedPdfUrl ? `${normalizedPdfUrl}${normalizedPdfUrl.includes('?') ? '&' : '?'}v=${updatedAtMs}` : '';

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh' }} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header / Breadcrumbs */}
      <section style={{ padding: '3rem 0 2rem', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <div className="container-technical" style={{ paddingInline: '1.5rem' }}>
          <nav style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: '#999', fontWeight: 700, display: 'flex', gap: '0.5rem' }}>
            <Link href={`/` as any} style={{ color: '#999' }}>{tNav('home').toUpperCase()}</Link> /
            <Link href={`/products-for-animals` as any} style={{ color: '#999' }}> {isAr ? 'أدلة الثروة الحيوانية' : 'ANIMAL GUIDES'}</Link> /
            <span style={{ color: '#142346' }}> {name.toUpperCase()}</span>
          </nav>
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            marginTop: '2.25rem',
            wordBreak: 'break-word'
          }}>
            {isAr ? 'دليل' : 'GUIDE'}: <span style={{ color: '#142346' }}>{name}</span>
          </h1>
        </div>
      </section>

      <section className="section">
        <div className="container-technical">
          {/* Full-width image */}
          {animal.imageUrl && (
            <div style={{ position: 'relative', width: '100%', height: '420px', margin: '0 0 2rem 0', border: '1px solid #eee', overflow: 'hidden' }}>
              <Image
                src={animal.imageUrl}
                alt={name}
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}

          <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
            {/* PDF Attachment */}
            {normalizedPdfUrl && (
              <div style={{
                marginBottom: '2rem',
                borderRadius: '1rem',
                border: '1px solid #dbe3ef',
                background: 'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
                padding: '1rem 1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexShrink: 0 }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '0.875rem',
                    backgroundColor: '#dde3f0',
                    border: '1px solid #c7d2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#142346'
                  }}>
                    <FileDown size={22} strokeWidth={2.2} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {isAr ? 'وثيقة' : 'Documentation'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', wordBreak: 'break-word' }}>
                      {isAr
                        ? (animal.documentTitle_ar || animal.documentTitle || 'ملف الدليل جاهز للعرض والتحميل')
                        : (animal.documentTitle || 'Guide document is ready for preview and download')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexShrink: 0, alignItems: 'stretch' }}>
                  {/* Download — small square */}
                  <a
                    href={pdfPreviewUrl}
                    download
                    title={isAr ? 'تحميل' : 'Download'}
                    style={{
                      width: '46px',
                      minWidth: '46px',
                      height: '46px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '0.55rem',
                      backgroundColor: '#e8ecf5',
                      color: '#142346',
                      border: '1.5px solid #142346' + '38',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s, color 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <Download size={18} strokeWidth={2.2} />
                  </a>
                  {/* View — wide rectangle */}
                  <a
                    href={`/${locale}/catalogs/viewer?source=${encodeURIComponent(normalizedPdfUrl)}&title=${encodeURIComponent(name)}`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      height: '46px',
                      padding: '0 1rem',
                      borderRadius: '0.55rem',
                      backgroundColor: '#142346',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.93rem',
                      textDecoration: 'none',
                      transition: 'background-color 0.2s, transform 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Eye size={16} strokeWidth={2.2} />
                    {isAr ? 'عرض المستند' : 'Open Document'}
                  </a>
                </div>
              </div>
            )}

            {/* Technical Description */}
            <div style={{ marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ width: '40px', height: '2px', backgroundColor: '#142346' }} />
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#142346',
                  margin: 0,
                  letterSpacing: '0.1em'
                }}>
                  {isAr ? 'المعلومات التقنية' : 'Technical Specifications'}
                </h3>
              </div>
              {safeDescription ? (
                <div
                  className="technical-content"
                  style={{
                    fontSize: '1.2rem',
                    lineHeight: '1.9',
                    color: '#0f172a',
                    paddingRight: isAr ? '1.5rem' : '1.25rem',
                    paddingLeft: isAr ? '1.25rem' : '1.5rem',
                    borderRight: isAr ? '3px solid #142346' : 'none',
                    borderLeft: isAr ? 'none' : '3px solid #142346',
                    paddingTop: '1.25rem',
                    paddingBottom: '1.25rem',
                  }}
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              ) : (
                <div style={{ color: '#999', fontSize: '0.95rem', fontWeight: 700, marginTop: '1rem' }}>
                  {isAr ? 'يتم تحديث المعلومات التفصيلية حالياً.' : 'Detailed information is currently being updated.'}
                </div>
              )}
            </div>

            {/* Issues / Treatment Program */}
            {animal.issues && animal.issues.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#142346',
                  marginBottom: '2rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #142346',
                  display: 'inline-block'
                }}>
                  {isAr ? 'المشكلات الشائعة وبرامج العلاج' : 'Common Issues & Treatment Programs'}
                </h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {animal.issues.map((issue: any) => {
                    const issueName = isAr && issue.title_ar ? issue.title_ar : issue.title;
                    const issueDesc = isAr && issue.description_ar ? issue.description_ar : (issue.description || '');
                    const safeIssueDesc = stripScripts(issueDesc);

                    return (
                      <div key={issue.id} className="card" style={{
                        display: 'grid',
                        gridTemplateColumns: '220px 1fr',
                        overflow: 'hidden',
                        border: '1px solid #eee',
                        direction: 'ltr'
                      }}>
                        <div style={{
                          backgroundColor: '#f8fafc',
                          padding: '2rem',
                          borderRight: '1px solid #eee',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#142346', textTransform: 'uppercase', opacity: 0.7 }}>
                            {isAr ? 'البرنامج' : 'Program'}
                          </span>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--foreground)', direction: isAr ? 'rtl' : 'ltr' }}>
                            {issueName.toUpperCase()}
                          </h4>
                        </div>
                        <div style={{ padding: '2rem', backgroundColor: 'white', direction: isAr ? 'rtl' : 'ltr' }}>
                          <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: safeIssueDesc }} />
                          
                          {/* Recommended Products for this Issue */}
                          <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {(() => {
                                  const recommendation = issue.recommendation as { products?: string[] } | null | undefined;
                                  if (!recommendation?.products || !Array.isArray(recommendation.products) || recommendation.products.length === 0) {
                                      return (
                                          <span style={{
                                              padding: '0.4rem 1rem',
                                              backgroundColor: '#f1f5f9',
                                              color: '#475569',
                                              borderRadius: '0.5rem',
                                              fontSize: '0.7rem',
                                              fontWeight: 800
                                          }}>{isAr ? 'أداء محسّن' : 'Optimized Performance'}</span>
                                      );
                                  }

                                  return recommendation.products.map((prodId: string) => {
                                      const prod = productsMap.get(prodId);
                                      if (!prod) return null;
                                      const pName = isAr && prod.name_ar ? prod.name_ar : prod.name;
                                      return (
                                          <Link key={prod.id} href={`/product/${prod.slug}` as any} style={{
                                              padding: '0.4rem 1rem',
                                              backgroundColor: '#f1f5f9',
                                              color: '#475569',
                                              borderRadius: '0.5rem',
                                              fontSize: '0.7rem',
                                              fontWeight: 800,
                                              textDecoration: 'none',
                                              display: 'inline-block',
                                              transition: '0.2s',
                                              border: '1px solid transparent'
                                          }}>
                                              <span style={{ color: '#142346' }}>•</span> {pName}
                                          </Link>
                                      );
                                  });
                              })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended Products */}
            {animal.products && animal.products.length > 0 && (
              <div style={{ marginTop: '4rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#142346',
                  marginBottom: '2rem',
                  paddingBottom: '0.5rem',
                  borderBottom: '2px solid #142346',
                  display: 'inline-block'
                }}>
                  {isAr ? 'المنتجات الموصى بها' : 'Recommended Products'}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {animal.products.map((p: any) => {
                    const pName = isAr && p.name_ar ? p.name_ar : p.name;
                    return (
                      <Link key={p.id} href={`/product/${p.slug}` as any} className="card product-mini-card" style={{
                        padding: '1.5rem',
                        textAlign: 'center',
                        transition: '0.3s',
                        border: '1px solid #eee'
                      }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#333', textTransform: 'uppercase' }}>
                          {pName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#142346', marginTop: '0.5rem', fontWeight: 700 }}>
                          {isAr ? 'معرفة المزيد ←' : 'Learn More →'}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
