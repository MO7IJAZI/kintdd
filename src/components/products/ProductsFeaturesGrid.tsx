"use client";

import { useState } from 'react';
import { CheckCircle2, Layers, Package } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

function FeatureCard({ icon, title, description, bgColor, iconColor }: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '2rem',
        borderRadius: '16px',
        backgroundColor: '#f8fafc',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 10px 30px rgba(124,58,237,0.08)' : 'none',
        background: isHovered ? 'linear-gradient(180deg, #fff, #fbfbff)' : '#f8fafc'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          background: bgColor,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
      >
        <div style={{ color: iconColor }}>
          {icon}
        </div>
      </div>

      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        color: '#071133',
        marginBottom: '0.75rem'
      }}>
        {title}
      </h3>

      <p style={{
        color: '#64748b',
        fontSize: '0.95rem',
        lineHeight: 1.6
      }}>
        {description}
      </p>
    </div>
  );
}

export default function ProductsFeaturesGrid() {
  const features = [
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: 'Quality Assurance',
      description: 'All products meet international quality standards and certifications',
      bgColor: 'linear-gradient(135deg, rgba(14,165,164,0.2), rgba(14,165,164,0.1))',
      iconColor: '#0ea5a4'
    },
    {
      icon: <Layers className="w-8 h-8" />,
      title: 'Wide Range',
      description: 'Comprehensive product portfolio across multiple sectors',
      bgColor: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(124,58,237,0.1))',
      iconColor: '#7c3aed'
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: 'Sustainable Solutions',
      description: 'Environmentally friendly products for sustainable agriculture',
      bgColor: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
      iconColor: '#22c55e'
    }
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}
    >
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
          bgColor={feature.bgColor}
          iconColor={feature.iconColor}
        />
      ))}
    </div>
  );
}
