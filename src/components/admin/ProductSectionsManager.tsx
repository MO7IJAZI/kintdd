"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createProductSection, updateProductSection, deleteProductSection, getProductSections } from "@/actions/productSectionActions";
import { Plus, Trash2, Edit2 } from "lucide-react";

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
    const [sections, setSections] = useState<Section[]>(initialSections);
    const [editingId, setEditingId] = useState<string | null>(null);
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

    const handleAddSection = async (e: React.FormEvent) => {
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

    const handleUpdateSection = async (e: React.FormEvent) => {
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
        if (!confirm("Are you sure you want to delete this section?")) return;
        setIsLoading(true);
        await deleteProductSection(sectionId, productId);
        
        // Refresh sections list after delete
        const updatedSections = await getProductSections(productId);
        setSections(updatedSections);
        
        setIsLoading(false);
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-6">
                Product Sections
            </h3>

            {/* Form */}
            <form onSubmit={editingId ? handleUpdateSection : handleAddSection} className="mb-8 p-8 bg-muted rounded-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4 mb-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Section Title (English)"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="p-3 border border-border rounded-lg text-base w-full"
                    />
                    <input
                        type="text"
                        name="title_ar"
                        placeholder="Section Title (Arabic)"
                        value={formData.title_ar}
                        onChange={handleInputChange}
                        className="p-3 border border-border rounded-lg text-base w-full"
                    />
                    <input
                        type="number"
                        name="order"
                        placeholder="Order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        className="p-3 border border-border rounded-lg text-base w-full"
                    />
                    <select
                        name="colorTheme"
                        value={formData.colorTheme}
                        onChange={handleInputChange}
                        className="p-3 border border-border rounded-lg text-base w-full"
                    >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                    </select>
                </div>

                <div className="mb-6">
                    <RichTextEditor
                        label="Content (English)"
                        value={formData.content}
                        onChange={(html) => setFormData(prev => ({ ...prev, content: html }))}
                    />
                </div>
                <div className="mb-6">
                    <RichTextEditor
                        label="Content (Arabic)"
                        value={formData.content_ar}
                        onChange={(html) => setFormData(prev => ({ ...prev, content_ar: html }))}
                        dir="rtl"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold transition-opacity ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-primary-hover'}`}
                >
                    <Plus size={18} />
                    {editingId ? "Update Section" : "Add Section"}
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
                        className="ml-2 px-6 py-3 bg-slate-400 text-white rounded-lg font-semibold hover:bg-slate-500"
                    >
                        Cancel
                    </button>
                )}
            </form>

            {/* Sections List */}
            <div className="grid gap-4">
                {sections.length === 0 ? (
                    <p className="text-muted-foreground text-center p-8">No sections yet</p>
                ) : (
                    sections.map((section) => (
                        <div
                            key={section.id}
                            className="p-6 border border-border rounded-xl bg-background flex justify-between items-center"
                        >
                            <div>
                                <h4 className="m-0 text-lg font-bold">{section.title}</h4>
                                {section.title_ar && (
                                    <p className="mt-1 text-slate-500">{section.title_ar}</p>
                                )}
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Order: {section.order} | Color: {section.colorTheme}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditSection(section)}
                                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={isLoading}
                                    className={`p-2 bg-red-500 text-white rounded-lg flex items-center gap-2 transition-opacity ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-red-600'}`}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
