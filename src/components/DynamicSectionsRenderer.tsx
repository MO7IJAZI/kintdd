"use client";

import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { useLocale } from 'next-intl';
import { stripScripts } from '@/lib/sanitizeHtml';

interface Section {
    id: string;
    title: string;
    title_ar?: string | null;
    content: string;
    content_ar?: string | null;
    colorTheme?: string | null;
    color?: string | null; // Add color property to support direct color values
    order: number;
}

interface DynamicSectionsProps {
    sections: Section[];
    isRtl: boolean;
}

const themeColors: Record<string, string> = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
    pink: '#db2777',
    slate: '#475569'
};

export default function DynamicSectionsRenderer({ sections, isRtl }: DynamicSectionsProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const locale = useLocale();

    if (!sections || sections.length === 0) {
        return null;
    }

    const toggleSection = (id: string) => {
        setExpandedId(prev => prev === id ? null : id);
    };

    return (
        <section style={{ padding: '4rem 0', backgroundColor: '#ffffff' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 800, 
                        color: '#0f172a', 
                        marginBottom: '1rem',
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        {locale === 'ar' ? 'معلومات إضافية' : 'Additional Information'}
                    </h2>
                </div>

                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sections.map((section) => {
                        const title = locale === 'ar' && section.title_ar ? section.title_ar : section.title;
                        const content = locale === 'ar' && section.content_ar ? section.content_ar : section.content;
                        const safeContent = stripScripts(content);
                        const isExpanded = expandedId === section.id;
                        
                        // Determine the background color: prioritize direct 'color' prop, then mapped 'colorTheme', then fallback
                        const sectionColor = section.color || (section.colorTheme ? themeColors[section.colorTheme] : null);

                        return (
                            <div
                                key={section.id}
                                style={{
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '1rem',
                                    backgroundColor: 'white',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isExpanded ? '0 10px 30px -5px rgba(0, 0, 0, 0.05)' : 'none',
                                }}
                            >
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    style={{
                                        width: '100%',
                                        padding: '1.5rem 2rem',
                                        backgroundColor: sectionColor || (isExpanded ? '#f8fafc' : 'white'),
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'background-color 0.3s ease',
                                        textAlign: isRtl ? 'right' : 'left',
                                    }}
                                    aria-expanded={isExpanded}
                                >
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 700,
                                        margin: 0,
                                        color: sectionColor ? 'white' : (isExpanded ? 'var(--primary)' : '#1e293b'),
                                        flex: 1,
                                    }}>
                                        {title}
                                    </h3>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: sectionColor 
                                            ? 'rgba(255, 255, 255, 0.2)' 
                                            : (isExpanded ? 'rgba(var(--primary-rgb), 0.1)' : '#f1f5f9'),
                                        color: sectionColor 
                                            ? 'white' 
                                            : (isExpanded ? 'var(--primary)' : '#64748b'),
                                        transition: 'all 0.3s ease',
                                        marginLeft: isRtl ? 0 : '1rem',
                                        marginRight: isRtl ? '1rem' : 0
                                    }}>
                                        {isExpanded ? <Minus size={18} /> : <Plus size={18} />}
                                    </div>
                                </button>

                                <div style={{
                                    maxHeight: isExpanded ? '2000px' : '0',
                                    overflow: 'hidden',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    opacity: isExpanded ? 1 : 0.5,
                                }}>
                                    <div style={{ padding: '2rem' }}>
                                        <div
                                            className="prose prose-slate"
                                            style={{
                                                fontSize: '1rem',
                                                lineHeight: '1.7',
                                                color: '#475569',
                                                maxWidth: 'none'
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: safeContent
                                                    .replace(/<p>/g, '<p style="margin-bottom: 1rem;">')
                                                    .replace(/<ul>/g, '<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">')
                                                    .replace(/<ol>/g, '<ol style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: decimal;">')
                                                    .replace(/<li>/g, '<li style="margin-bottom: 0.5rem;">')
                                                    .replace(/<table>/g, '<div style="overflow-x: auto; margin: 1.5rem 0;"><table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">')
                                                    .replace(/<\/table>/g, '</table></div>')
                                                    .replace(/<th>/g, '<th style="padding: 0.75rem 1rem; background-color: #f1f5f9; text-align: left; font-weight: 600; border: 1px solid #e2e8f0;">')
                                                    .replace(/<td>/g, '<td style="padding: 0.75rem 1rem; border: 1px solid #e2e8f0;">')
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
