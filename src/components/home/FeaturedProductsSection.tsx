"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Product {
    id: string;
    slug: string;
    name: string;
    name_ar?: string | null;
    image?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    category?: {
        name: string;
        name_ar?: string | null;
    } | null;
}

interface FeaturedProductsSectionProps {
    products: Product[];
}

export default function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
    const tHomeNew = useTranslations('HomeNew');
    const locale = useLocale();
    const isAr = locale === 'ar';

    if (!products || products.length === 0) return null;

    return (
        <section className="section" style={{ backgroundColor: '#f8fafc', padding: '8rem 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-20)' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 'var(--space-4)', fontSize: '0.9rem' }}>
                        {tHomeNew('featured')}
                    </div>
                    <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.02em' }}>
                        {tHomeNew('featuredProducts')}
                    </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-12)' }}>
                    {products.map((product) => {
                        const title = isAr && product.name_ar ? product.name_ar : product.name;
                        const desc = isAr && product.shortDesc_ar ? product.shortDesc_ar : product.shortDesc;
                        const catName = isAr && product.category?.name_ar ? product.category.name_ar : product.category?.name;
                        
                        return (
                            <Link key={product.id} href={`/product/${product.slug}`} className="card" style={{
                                overflow: 'hidden', borderRadius: 'var(--radius-2xl)', backgroundColor: 'white',
                                boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)',
                                textDecoration: 'none', color: 'inherit',
                                display: 'flex', flexDirection: 'column', height: '100%'
                            }}>
                                <div style={{ position: 'relative', height: '260px', backgroundColor: '#fff', padding: '1.5rem' }}>
                                    {product.image && (
                                        <Image src={product.image} alt={title} fill style={{ objectFit: 'contain', padding: '2rem' }} />
                                    )}
                                </div>
                                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
                                    <span style={{
                                        backgroundColor: 'var(--primary-light)', color: 'var(--primary)',
                                        fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '50px',
                                        textTransform: 'uppercase', fontWeight: '800', display: 'inline-block',
                                        marginBottom: 'var(--space-4)', width: 'fit-content'
                                    }}>
                                        {catName}
                                    </span>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 800, lineHeight: 1.3, color: 'var(--secondary)' }}>{title}</h3>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                                        {desc ? (desc.length > 90 ? desc.substring(0, 90) + '...' : desc) : ''}
                                    </p>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {tHomeNew('viewDetails')} <ArrowRight size={16} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
