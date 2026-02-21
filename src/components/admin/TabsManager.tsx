"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Palette } from "lucide-react";

// Dynamic import for RichTextEditor
const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

export interface Tab {
    id: string;
    title: string;
    content: string;
    color?: string;
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
            content: "",
            color: '#3b82f6'
        };
        const newTabs = [...tabs, newTab];
        setTabs(newTabs);
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

    const updateTabColor = (id: string, color: string) => {
        setTabs(tabs.map(t => t.id === id ? { ...t, color } : t));
    };

    const updateTabContent = (id: string, content: string) => {
        setTabs(tabs.map(t => t.id === id ? { ...t, content } : t));
    };

    const activeTab = tabs.find(t => t.id === activeTabId);

    return (
        <div className="mt-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
                <Palette className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-800">{t('title')}</h3>
            </div>

            {tabs.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-slate-600 font-medium mb-4">{t('emptyState')}</p>
                    <button 
                        type="button" 
                        onClick={addTab}
                        className="btn btn-primary"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('add')}
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-slate-200">
                    {/* Tabs Header */}
                    <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border-b border-slate-200">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTabId(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors
                                    ${activeTabId === tab.id 
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                    }
                                `}
                            >
                                <span 
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: tab.color || '#3b82f6' }} 
                                />
                                {tab.title || t('untitled')}
                            </button>
                        ))}
                        <button 
                            type="button" 
                            onClick={addTab}
                            className="flex items-center justify-center w-9 h-9 ml-2 bg-white border border-slate-200 rounded-md text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                            title={t('add')}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Active Tab Content */}
                    {activeTab && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-6 items-start">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">
                                        {t('tabTitle')}
                                    </label>
                                    <input 
                                        value={activeTab.title} 
                                        onChange={(e) => updateTabTitle(activeTab.id, e.target.value)}
                                        className="input w-full"
                                        placeholder={t('placeholder')}
                                        dir={dir === 'rtl' ? 'rtl' : undefined}
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-slate-700">
                                        {t('tabColor')}
                                    </label>
                                    <div className="flex gap-2 flex-wrap bg-slate-50 p-2 rounded-lg border border-slate-200">
                                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'].map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => updateTabColor(activeTab.id, color)}
                                                className={`w-6 h-6 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${
                                                    activeTab.color === color ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-110'
                                                }`}
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">
                                    {t('tabContent')}
                                </label>
                                <RichTextEditor
                                    label=""
                                    value={activeTab.content}
                                    onChange={(content) => updateTabContent(activeTab.id, content)}
                                    dir={dir}
                                />
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => removeTab(activeTab.id)}
                                    className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('remove')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
