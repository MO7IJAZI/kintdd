"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { getDynamicCategories, saveDynamicCategories, deleteDynamicCategory, DynamicCategory } from "@/actions/categorySettingsActions";
import { X, Edit2, Trash2, Plus, Save } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface CategoryManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'animal' | 'crop';
    onCategoriesUpdated: (categories: DynamicCategory[]) => void;
}

export default function CategoryManagerModal({ isOpen, onClose, type, onCategoriesUpdated }: CategoryManagerModalProps) {
    const t = useTranslations("CategoryManager");
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [categories, setCategories] = useState<DynamicCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNameEn, setEditNameEn] = useState("");
    const [editNameAr, setEditNameAr] = useState("");

    const [newCategoryEn, setNewCategoryEn] = useState("");
    const [newCategoryAr, setNewCategoryAr] = useState("");

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen, type]);

    const loadCategories = async () => {
        setIsLoading(true);
        const data = await getDynamicCategories(type);
        setCategories(data);
        setIsLoading(false);
    };

    const handleAdd = async () => {
        if (!newCategoryEn.trim() || !newCategoryAr.trim()) return;
        setIsSaving(true);
        
        const newCat: DynamicCategory = {
            id: Date.now().toString(),
            nameEn: newCategoryEn.trim(),
            nameAr: newCategoryAr.trim()
        };
        
        const updated = [...categories, newCat];
        await saveDynamicCategories(type, updated);
        
        setCategories(updated);
        onCategoriesUpdated(updated);
        setNewCategoryEn("");
        setNewCategoryAr("");
        setIsSaving(false);
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editNameEn.trim() || !editNameAr.trim()) return;
        setIsSaving(true);
        
        const updated = categories.map(c => 
            c.id === editingId ? { ...c, nameEn: editNameEn.trim(), nameAr: editNameAr.trim() } : c
        );
        
        await saveDynamicCategories(type, updated);
        setCategories(updated);
        onCategoriesUpdated(updated);
        setEditingId(null);
        setIsSaving(false);
    };

    const startEdit = (cat: DynamicCategory) => {
        if (cat.isDefault) return;
        setEditingId(cat.id);
        setEditNameEn(cat.nameEn);
        setEditNameAr(cat.nameAr);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('confirmDelete') || "Are you sure? This will move associated items to Uncategorized.")) {
            setIsSaving(true);
            const res = await deleteDynamicCategory(type, id);
            if (res.success) {
                const updated = categories.filter(c => c.id !== id);
                setCategories(updated);
                onCategoriesUpdated(updated);
            }
            setIsSaving(false);
        }
    };

    if (!isOpen || typeof document === 'undefined') return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }} dir={isRtl ? 'rtl' : 'ltr'}>
            <div style={{
                backgroundColor: 'white', borderRadius: '1rem',
                width: '100%', maxWidth: '600px', maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{t('manageCategories') || "Manage Categories"}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
                    {/* Add New */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '2rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('englishName') || "English Name"}</label>
                            <input 
                                value={newCategoryEn} onChange={(e) => setNewCategoryEn(e.target.value)}
                                className="input" style={{ width: '100%' }} placeholder="e.g. Fish"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>{t('arabicName') || "Arabic Name"}</label>
                            <input 
                                value={newCategoryAr} onChange={(e) => setNewCategoryAr(e.target.value)}
                                className="input" style={{ width: '100%' }} placeholder="مثل: أسماك"
                            />
                        </div>
                        <button 
                            onClick={handleAdd}
                            disabled={isSaving || !newCategoryEn.trim() || !newCategoryAr.trim()}
                            className="btn btn-primary"
                            style={{ padding: '0.75rem', height: '42px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} /> {t('add') || "Add"}
                        </button>
                    </div>

                    {/* List */}
                    {isLoading ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>Loading...</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {categories.map((cat) => (
                                <div key={cat.id} style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem',
                                    backgroundColor: cat.isDefault ? '#f1f5f9' : 'white'
                                }}>
                                    {editingId === cat.id ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', width: '100%' }}>
                                            <input 
                                                value={editNameEn} onChange={(e) => setEditNameEn(e.target.value)}
                                                className="input" style={{ width: '100%' }}
                                            />
                                            <input 
                                                value={editNameAr} onChange={(e) => setEditNameAr(e.target.value)}
                                                className="input" style={{ width: '100%' }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={handleSaveEdit} disabled={isSaving} className="btn btn-primary" style={{ padding: '0.5rem' }}><Save size={16} /></button>
                                                <button onClick={() => setEditingId(null)} className="btn btn-outline" style={{ padding: '0.5rem' }}><X size={16} /></button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                                <div style={{ flex: 1, fontWeight: 600 }}>{cat.nameEn} {cat.isDefault && <span style={{fontSize:'0.7rem', color:'#64748b'}}>(Default)</span>}</div>
                                                <div style={{ flex: 1, fontWeight: 600 }}>{cat.nameAr} {cat.isDefault && <span style={{fontSize:'0.7rem', color:'#64748b'}}>(افتراضي)</span>}</div>
                                            </div>
                                            {!cat.isDefault && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => startEdit(cat)} className="btn btn-outline" style={{ padding: '0.5rem', borderColor: '#e2e8f0' }}><Edit2 size={16} color="#3b82f6" /></button>
                                                    <button onClick={() => handleDelete(cat.id)} className="btn btn-outline" style={{ padding: '0.5rem', borderColor: '#e2e8f0' }} disabled={isSaving}><Trash2 size={16} color="#ef4444" /></button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
