"use client";

import { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";
import { useTranslations } from 'next-intl';

export interface Tab {
    id: string;
    title: string;
    content: string;
}

interface Props {
    initialData?: Tab[];
    onChange: (tabs: Tab[]) => void;
    dir?: 'ltr' | 'rtl' | 'auto';
}

function generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export default function TabsManager({ initialData = [], onChange, dir = 'ltr' }: Props) {
    const t = useTranslations('AdminTabs');
    const [tabs, setTabs] = useState<Tab[]>(initialData.length > 0 ? initialData : []);
    const [activeTabId, setActiveTabId] = useState<string | null>(initialData.length > 0 ? initialData[0].id : null);

    // Update parent whenever tabs change
    useEffect(() => {
        onChange(tabs);
    }, [tabs, onChange]);

    const addTab = () => {
        const newTab: Tab = {
            id: generateId(),
            title: t('newTab'),
            content: ""
        };
        setTabs([...tabs, newTab]);
        setActiveTabId(newTab.id);
    };

    const removeTab = (id: string) => {
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);
        if (activeTabId === id) {
            setActiveTabId(newTabs.length > 0 ? newTabs[0].id : null);
        }
    };

    const updateTabTitle = (id: string, title: string) => {
        setTabs(tabs.map(t => t.id === id ? { ...t, title } : t));
    };

    const updateTabContent = (id: string, content: string) => {
        setTabs(tabs.map(t => t.id === id ? { ...t, content } : t));
    };

    const activeTab = tabs.find(t => t.id === activeTabId);

    return (
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{t('title')}</h3>
                <button 
                    type="button" 
                    onClick={addTab}
                    className="btn btn-primary"
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                    + {t('add')}
                </button>
            </div>

            {tabs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                    {t('emptyState')}
                </div>
            ) : (
                <div>
                    {/* Tabs Header */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTabId(tab.id)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem 0.5rem 0 0',
                                    border: '1px solid',
                                    borderColor: activeTabId === tab.id ? 'var(--border) var(--border) white var(--border)' : 'transparent',
                                    backgroundColor: activeTabId === tab.id ? 'white' : 'transparent',
                                    marginBottom: '-0.6rem',
                                    fontWeight: activeTabId === tab.id ? '600' : '400',
                                    color: activeTabId === tab.id ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: activeTabId === tab.id ? 10 : 1
                                }}
                            >
                                {tab.title || t('untitled')}
                            </button>
                        ))}
                    </div>

                    {/* Active Tab Content */}
                    {activeTab && (
                        <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('tabTitle')}</label>
                                    <input 
                                        value={activeTab.title} 
                                        onChange={(e) => updateTabTitle(activeTab.id, e.target.value)}
                                        className="input" 
                                        style={{ width: '100%' }} 
                                        placeholder={t('placeholder')}
                                        dir={dir === 'rtl' ? 'rtl' : undefined}
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => removeTab(activeTab.id)}
                                    style={{ 
                                        marginTop: '1.35rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: '#fee2e2',
                                        color: '#ef4444',
                                        border: 'none',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {t('remove')}
                                </button>
                            </div>

                            <RichTextEditor
                                label={t('tabContent')}
                                value={activeTab.content}
                                onChange={(content) => updateTabContent(activeTab.id, content)}
                                dir={dir}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
