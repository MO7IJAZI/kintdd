import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { Search } from 'lucide-react';

export const revalidate = 0; // Search results should be dynamic

export default async function SearchPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ q: string }>;
}) {
    const { locale } = await params;
    const { q } = await searchParams;
    const t = await getTranslations('Search');
    const tNav = await getTranslations('Navigation');
    const isAr = locale === 'ar';

    const query = q || '';
    
    let products: any[] = [];
    
    if (query) {
        try {
            products = await prisma.product.findMany({
                where: {
                    isActive: true,
                    OR: [
                        { name: { contains: query } },
                        { name_ar: { contains: query } },
                        { description: { contains: query } },
                        { description_ar: { contains: query } },
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    name_ar: true,
                    slug: true,
                    image: true,
                    shortDesc: true,
                    shortDesc_ar: true,
                    description: true,
                    description_ar: true
                }
            });
        } catch (error) {
            console.error("Search error:", error);
        }
    }

    return (
        <div className="section" style={{ direction: isAr ? 'rtl' : 'ltr', minHeight: '60vh', padding: '4rem 0' }}>
            <div className="container">
                <div style={{ marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Search size={32} />
                        {t('title')} "{query}"
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>
                        {products.length > 0 
                            ? t('resultsFound', { count: products.length, query }) 
                            : t('noResults', { query })
                        }
                    </p>
                </div>

                {products.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                        {products.map((product) => {
                             const pName = (isAr && product.name_ar) ? product.name_ar : product.name;
                             const pShortDesc = (isAr && product.shortDesc_ar) ? product.shortDesc_ar : product.shortDesc;
                             const pDesc = (isAr && product.description_ar) ? product.description_ar : product.description;
                             
                             return (
                                <Link key={product.id} href={`/product/${product.slug}`} className="card">
                                    <div style={{ position: 'relative', height: '250px', backgroundColor: '#fff' }}>
                                        <Image
                                            src={product.image || '/images/cat-biostimulants.png'}
                                            alt={pName}
                                            fill
                                            style={{ objectFit: 'contain', padding: '1rem' }}
                                        />
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <h3 style={{ marginBottom: '0.5rem' }}>{pName}</h3>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {pShortDesc || (pDesc ? pDesc.replace(/<[^>]*>?/gm, '').substring(0, 100) + '...' : '')}
                                        </p>
                                        <div style={{ color: 'var(--primary)', fontWeight: '700' }}>
                                            {tNav('viewDetails')} {isAr ? '←' : '→'}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
