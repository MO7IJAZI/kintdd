"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocale } from 'next-intl';

interface Section {
    id: string;
    title: string;
    title_ar?: string | null;
    content: string;
    content_ar?: string | null;
    colorTheme?: string | null;
    order: number;
}

const colorThemes: Record<string, { bg: string; border: string; text: string; light: string }> = {
    blue: { bg: '#2563eb', border: '#3b82f6', text: '#ffffff', light: '#eff6ff' },
    green: { bg: '#16a34a', border: '#22c55e', text: '#ffffff', light: '#f0fdf4' },
    purple: { bg: '#9333ea', border: '#a855f7', text: '#ffffff', light: '#faf5ff' },
    orange: { bg: '#ea580c', border: '#f97316', text: '#ffffff', light: '#fff7ed' },
    pink: { bg: '#db2777', border: '#ec4899', text: '#ffffff', light: '#fdf2f8' },
    slate: { bg: '#475569', border: '#64748b', text: '#ffffff', light: '#f8fafc' },
};

interface DynamicSectionsProps {
    sections: Section[];
    isRtl: boolean;
}

export default function DynamicSectionsRenderer({ sections, isRtl }: DynamicSectionsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const locale = useLocale();

    if (!sections || sections.length === 0) {
        return null;
    }

    return (
        <section style={{ padding: '6rem 0', backgroundColor: '#ffffff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '1rem' }}>
                        {locale === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                    </h2>
                    <div style={{ width: '80px', height: '4px', backgroundColor: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }}></div>
                </div>

                <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sections.map((section) => {
                        const title = locale === 'ar' && section.title_ar ? section.title_ar : section.title;
                        const content = locale === 'ar' && section.content_ar ? section.content_ar : section.content;
                        const themeKey = (section.colorTheme || 'blue') as keyof typeof colorThemes;
                        const theme = colorThemes[themeKey] || colorThemes.blue;
                        const isExpanded = expandedId === section.id;

                        return (
                            <div
                                key={section.id}
                                style={{
                                    border: `1px solid ${isExpanded ? theme.border : '#e2e8f0'}`,
                                    borderRadius: '1.5rem',
                                    backgroundColor: 'white',
                                    overflow: 'hidden',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: isExpanded ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    transform: isExpanded ? 'scale(1.01)' : 'scale(1)'
                                }}
                            >
                                <button
                                    onClick={() => setExpandedId(isExpanded ? null : section.id)}
                                    style={{
                                        width: '100%',
                                        padding: '2rem 2.5rem',
                                        backgroundColor: isExpanded ? theme.bg : 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.4s ease',
                                        color: isExpanded ? 'white' : '#1e293b'
                                    }}
                                    aria-expanded={isExpanded}
                                >
                                    <h3 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: 800,
                                        margin: 0,
                                        flex: 1,
                                        textAlign: isRtl ? 'right' : 'left',
                                        letterSpacing: '-0.01em'
                                    }}>
                                        {title}
                                    </h3>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: isExpanded ? 'rgba(255,255,255,0.2)' : theme.light,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.4s ease',
                                        marginLeft: isRtl ? 0 : '1.5rem',
                                        marginRight: isRtl ? '1.5rem' : 0
                                    }}>
                                        <ChevronDown
                                            size={24}
                                            style={{
                                                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                color: isExpanded ? 'white' : theme.bg
                                            }}
                                        />
                                    </div>
                                </button>

                                <div style={{ 
                                    maxHeight: isExpanded ? '2000px' : '0', 
                                    overflow: 'hidden', 
                                    transition: 'max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease',
                                    opacity: isExpanded ? 1 : 0,
                                    backgroundColor: theme.light
                                }}>
                                    <div style={{ padding: '3rem 2.5rem' }}>
                                        <div
                                            className="prose prose-lg"
                                            style={{
                                                fontSize: '1.1rem',
                                                lineHeight: '1.8',
                                                color: '#334155'
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: content
                                                    .replace(/<p>/g, '<p style="margin-bottom: 1.5rem;">')
                                                    .replace(/<ul>/g, '<ul style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: disc;">')
                                                    .replace(/<ol>/g, '<ol style="margin: 1.5rem 0; padding-left: 2rem; list-style-type: decimal;">')
                                                    .replace(/<li>/g, '<li style="margin-bottom: 0.75rem; padding-left: 0.5rem;">')
                                                    .replace(/<table>/g, '<div style="overflow-x: auto; margin: 2rem 0;"><table style="width: 100%; border-collapse: collapse; background: white; border-radius: 1rem; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">')
                                                    .replace(/<\/table>/g, '</table></div>')
                                                    .replace(/<th>/g, '<th style="padding: 1.25rem; background-color: #f8fafc; text-align: left; border: 1px solid #e2e8f0; font-weight: 800; color: #1e293b; text-transform: uppercase; font-size: 0.85rem;">')
                                                    .replace(/<td>/g, '<td style="padding: 1.25rem; border: 1px solid #e2e8f0; color: #475569;">')
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
