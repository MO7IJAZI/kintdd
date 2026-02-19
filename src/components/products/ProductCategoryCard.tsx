"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/navigation';
import { ArrowRight, Package } from 'lucide-react';

interface ProductCategoryCardProps {
  category: any;
  index: number;
  isAr: boolean;
  categoryUrl: string;
  viewProductsLabel: string;
}

export default function ProductCategoryCard({
  category,
  index,
  isAr,
  categoryUrl,
  viewProductsLabel
}: ProductCategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const name = isAr ? (category.name_ar || category.name || 'Unnamed Category') : (category.name || 'Unnamed Category');
  const desc = isAr ? (category.description_ar || category.description) : category.description;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 20px 40px rgba(15,23,42,0.08)' : '0 4px 12px rgba(15,23,42,0.06)',
        border: '1px solid rgba(15,23,42,0.04)',
        transition: 'all 300ms ease',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        animation: `fadeUp 0.6s ease both`,
        animationDelay: `${index * 100}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div style={{ position: 'relative', height: '200px', overflow: 'hidden', backgroundColor: '#f0f9ff' }}>
        {category.image ? (
          <Image
            src={category.image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
          }}>
            <Package className="w-12 h-12" style={{ color: 'rgba(15,23,42,0.2)' }} />
          </div>
        )}
      </div>

      <div style={{ padding: '1.5rem', textAlign: isAr ? 'right' : 'left' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: '#071133',
          marginBottom: '0.5rem',
          lineHeight: 1.2
        }}>
          {name}
        </h3>

        {desc && (
          <p style={{
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {desc.length > 100 ? `${desc.substring(0, 100)}...` : desc}
          </p>
        )}

        {category.children && category.children.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
            {category.children.slice(0, 3).map((child: any) => (
              <span
                key={child.id}
                style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'rgba(14, 165, 164, 0.1)',
                  color: '#0ea5a4',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 500
                }}
              >
                {isAr ? (child.name_ar || child.name) : child.name}
              </span>
            ))}
            {category.children.length > 3 && (
              <span style={{ fontSize: '0.8rem', color: '#64748b', alignSelf: 'center' }}>
                +{category.children.length - 3}
              </span>
            )}
          </div>
        )}

        <Link
          href={categoryUrl as any}
          style={{
            color: '#0ea5a4',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'gap 0.3s ease'
          }}
        >
          {viewProductsLabel}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
