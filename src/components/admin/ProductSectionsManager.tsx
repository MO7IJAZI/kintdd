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
                        <label className="block text-sm font-bold text-slate-700">
                            {t('sectionTitleEn')}
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="input w-full"
                            placeholder="e.g. Specifications"
                        />
                    </div>
                    <div className="lg:col-span-2 space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            {t('sectionTitleAr')}
                        </label>
                        <input
                            type="text"
                            name="title_ar"
                            value={formData.title_ar}
                            onChange={handleInputChange}
                            className="input w-full"
                            placeholder="العنوان بالعربية"
                            dir="rtl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            {t('order')}
                        </label>
                        <input
                            type="number"
                            name="order"
                            value={formData.order}
                            onChange={handleInputChange}
                            min="0"
                            className="input w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-slate-700">
                            Color Theme
                        </label>
                        <div className="relative">
                            <select
                                name="colorTheme"
                                value={formData.colorTheme}
                                onChange={handleInputChange}
                                className="input w-full"
                            >
                                <option value="blue">Blue</option>
                                <option value="green">Green</option>
                                <option value="purple">Purple</option>
                                <option value="orange">Orange</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mb-6 bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div className="flex border-b border-slate-200 bg-slate-50 p-1 gap-1">
                        <button
                            type="button"
                            onClick={() => setContentTab('en')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                                contentTab === 'en' 
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <span>English Content</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setContentTab('ar')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                                contentTab === 'ar' 
                                    ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <span>Arabic Content</span>
                        </button>
                    </div>
                    
                    <div className="p-4">
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
                        className="btn btn-primary"
                    >
                        {editingId ? <Edit2 className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
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
                            className="btn btn-outline"
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
                        <p className="text-slate-400 text-sm">Add custom sections like "Specifications", "Usage", etc.</p>
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
                                        <span className={`px-2 py-1 rounded flex items-center gap-1 border ${
                                            section.colorTheme === 'blue' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                            section.colorTheme === 'green' ? 'bg-green-50 text-green-700 border-green-100' :
                                            section.colorTheme === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                            'bg-orange-50 text-orange-700 border-orange-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full bg-current`}></span>
                                            {section.colorTheme}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                                <button
                                    onClick={() => handleEditSection(section)}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
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
