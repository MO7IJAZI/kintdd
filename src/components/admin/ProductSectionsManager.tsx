"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { createProductSection, updateProductSection, deleteProductSection, getProductSections } from "@/actions/productSectionActions";
import { Plus, Trash2, Edit2, Layers, GripVertical } from "lucide-react";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface Section {
    id: string;
    title: string;
    title_ar?: string | null;
    content: string;
    content_ar?: string | null;
    order: number;
    colorTheme: string;
}

export default function ProductSectionsManager({
    productId,
    initialSections = [],
}: {
    productId: string;
    initialSections?: Section[];
}) {
    const t = useTranslations('AdminProductSections');
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [contentTab, setContentTab] = useState<'en' | 'ar'>('en');
    const [formData, setFormData] = useState({
        title: "",
        title_ar: "",
        content: "",
        content_ar: "",
        order: 0,
        colorTheme: "blue",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "order" ? parseInt(value) || 0 : value,
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (editingId) {
                handleUpdateSection(e as any);
            } else {
                handleAddSection(e as any);
            }
        }
    };

    const handleAddSection = async (e: React.FormEvent | React.MouseEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, String(value));
        });

        await createProductSection(productId, formDataObj);
        
        // Refresh sections list after adding
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);

        setFormData({
            title: "",
            title_ar: "",
            content: "",
            content_ar: "",
            order: sections.length,
            colorTheme: "blue",
        });
        setIsLoading(false);
    };

    const handleUpdateSection = async (e: React.FormEvent | React.MouseEvent) => {
        if (!editingId) return;
        e.preventDefault();
        setIsLoading(true);

        const formDataObj = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataObj.append(key, String(value));
        });

        await updateProductSection(editingId, formDataObj);

        // Refresh sections list after update
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);

        setEditingId(null);
        setFormData({
            title: "",
            title_ar: "",
            content: "",
            content_ar: "",
            order: 0,
            colorTheme: "blue",
        });
        setIsLoading(false);
    };

    const handleEditSection = (section: Section) => {
        setEditingId(section.id);
        setFormData({
            title: section.title,
            title_ar: section.title_ar || "",
            content: section.content,
            content_ar: section.content_ar || "",
            order: section.order,
            colorTheme: section.colorTheme,
        });
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        setIsLoading(true);
        await deleteProductSection(sectionId, productId);
        
        // Refresh sections list after delete
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);
        
        setIsLoading(false);
    };

    return (
        <div className="mt-12">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
                <Layers className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-800">
                    {t('title')}
                </h3>
            </div>

            {/* Form Replacement */}
            <div className="mb-10 p-6 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="lg:col-span-2 space-y-2">
                        <label className="pf-label">
                            {t('sectionTitleEn')}
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="pf-input"
                            placeholder="e.g. Specifications"
                        />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                        <label className="pf-label">
                            {t('sectionTitleAr')}
                        </label>
                        <input
                            type="text"
                            name="title_ar"
                            value={formData.title_ar}
                            onChange={handleInputChange}
                            className="pf-input"
                            placeholder="العنوان بالعربية"
                            dir="rtl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="pf-label">
                            {t('order')}
                        </label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            min="0"
                            className="pf-input"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="pf-label">
                            Color Theme
                        </label>
                        <div className="relative space-y-2">
                            <select
                                name="colorTheme"
                                value={formData.colorTheme}
                                onChange={handleInputChange}
                                className="pf-select"
                            >
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="orange">Orange</option>
                            </select>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(formData.colorTheme) ? formData.colorTheme : '#e9496c'}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, colorTheme: e.target.value }))}
                                    style={{ width: '40px', height: '36px', border: 'none', background: 'transparent', padding: 0 }}
                                />
                                <input
                                    type="text"
                                    value={formData.colorTheme}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, colorTheme: e.target.value }))}
                                    className="pf-input"
                                    placeholder="#e9496c"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="pf-lang-switch p-1 gap-1 border-b-0 rounded-b-none">
                        <button
                            type="button"
                            onClick={() => setContentTab('en')}
                            className={`pf-lang-btn flex-1 ${contentTab === 'en' ? 'active' : ''}`}
                        >
                            <span>English Content</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setContentTab('ar')}
                            className={`pf-lang-btn ar flex-1 ${contentTab === 'ar' ? 'active' : ''}`}
                        >
                            <span>Arabic Content</span>
                        </button>
                    </div>
                    
                    <div className="p-4 border-t border-slate-200">
                        {contentTab === 'en' ? (
                            <RichTextEditor
                                label=""
                                value={formData.content}
                                onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                            />
                        ) : (
                            <RichTextEditor
                                label=""
                                value={formData.content_ar}
                                onChange={(html) => setFormData(prev => ({ ...prev, content_ar: html }))}
                                dir="rtl"
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="button"
                        onClick={editingId ? handleUpdateSection : handleAddSection}
                        disabled={isLoading}
                        className="pf-btn pf-btn-primary"
                    >
                        {editingId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {editingId ? t('updateSection') : t('addSection')}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: "",
                                    title_ar: "",
                                    content: "",
                                    content_ar: "",
                                    order: 0,
                                    colorTheme: "blue",
                                });
                            }}
                            className="pf-btn pf-btn-secondary"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Sections List */}
            <div className="space-y-4">
                {sections.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-600 font-medium mb-2">No sections added yet</p>
                        <p className="text-slate-400 text-sm">Add custom sections like &quot;Specifications&quot;, &quot;Usage&quot;, etc.</p>
                    </div>
                ) : (
                    sections.map((section) => (
                        <div
                            key={section.id}
                            className="group p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-slate-300 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="p-2 bg-slate-50 rounded-md text-slate-400 cursor-move hover:text-slate-600 hover:bg-slate-100 transition-colors">
                                    <GripVertical size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-bold text-slate-900">{section.title}</h4>
                                    {section.title_ar && (
                                        <p className="text-sm text-slate-500 font-arabic mt-0.5">{section.title_ar}</p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-bold uppercase tracking-wider">
                                        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">Order: {section.order}</span>
                                        <span
                                            className={`px-2 py-1 rounded flex items-center gap-1 border ${
                                                /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(section.colorTheme)
                                                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                                                    : section.colorTheme === 'blue'
                                                        ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                        : section.colorTheme === 'green'
                                                            ? 'bg-green-50 text-green-700 border-green-100'
                                                            : section.colorTheme === 'purple'
                                                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                                : 'bg-orange-50 text-orange-700 border-orange-100'
                                            }`}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(section.colorTheme) ? section.colorTheme : undefined }}
                                            ></span>
                                            {section.colorTheme}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                                <button
                                    onClick={() => handleEditSection(section)}
                                    className="p-2 text-slate-500 hover:text-[var(--primary)] hover:bg-pink-50 rounded-md transition-colors"
                                    title="Edit"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={isLoading}
                                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
