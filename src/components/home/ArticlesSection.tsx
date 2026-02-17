"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';

interface ArticlesSectionProps {
  news: any[];
}

export default function ArticlesSection({ news }: ArticlesSectionProps) {
  const tHomeNew = useTranslations('HomeNew');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (date: string | Date) => {
    if (!mounted) return '';
    return new Date(date).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section className="section home-section-pad" style={{ backgroundColor: '#f8fafc', padding: '6rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ color: 'var(--primary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{tHomeNew('articlesSubtitle')}</span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: '0.5rem', fontWeight: 800 }}>{tHomeNew('ourArticles')}</h2>
          </div>
          <Link href={`/blog`} className="btn btn-outline" style={{ borderRadius: '50px', padding: '0.8rem 2rem' }}>
            {tHomeNew('discoverMore')}
          </Link>
        </div>
        <div className="home-articles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {news.map((post: any) => {
            const postTitle = (isAr && post.title_ar) ? post.title_ar : post.title;
            const postExcerpt = (isAr && post.excerpt_ar) ? post.excerpt_ar : post.excerpt;
            return (
              <Link key={post.id} href={`/blog/${post.slug}`} className="card hover-card" style={{ 
                backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                display: 'flex', flexDirection: 'column', height: '100%'
              }}>
                <div style={{ position: 'relative', height: '240px' }}>
                  <Image src={post.image || '/images/hero.png'} alt={postTitle} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {post.publishedAt && formatDate(post.publishedAt)}
                  </div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 700, lineHeight: 1.4 }}>{postTitle}</h3>
                  <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                    {postExcerpt?.substring(0, 100)}...
                  </p>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {tHomeNew('discoverMore')} <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            );
          })}
          {news.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)', backgroundColor: 'white', borderRadius: '1rem' }}>
              <p>{tHomeNew('noNews')}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
