"use client";

import { useState, useEffect, useCallback } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/actions/categoryActions';
import { generateSlug } from '@/lib/slugUtils';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import ImageUpload from '@/components/admin/ImageUpload';

interface CategoryCount {
    products?: number;
}

interface Category {
    id: string;
    name: string;
    name_ar: string;
    slug: string;
    description?: string | null;
    description_ar?: string | null;
    image?: string | null;
    parentId?: string | null;
    parent?: { name: string } | null;
    _count?: CategoryCount;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [formName, setFormName] = useState("");
    const [formNameAr, setFormNameAr] = useState("");
    const [formParentId, setFormParentId] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formDescriptionAr, setFormDescriptionAr] = useState("");
    const [formImage, setFormImage] = useState("");
    const [newCategorySlug, setNewCategorySlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const locale = useLocale();
    const t = useTranslations('AdminCategories');
    const tCommon = useTranslations('AdminCommon');

    const fetchCategories = useCallback(async () => {
        const data = await getCategories();
        setCategories(
            (data as any[]).map((cat) => ({
                ...cat,
                name_ar: cat.name_ar || cat.name,
            }))
        );
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchCategories();
        };
        load();
    }, [fetchCategories]);

    const resetForm = () => {
        setEditingCategoryId(null);
        setFormName("");
        setFormNameAr("");
        setFormParentId("");
        setFormDescription("");
        setFormDescriptionAr("");
        setFormImage("");
        setNewCategorySlug("");
        setSlugEdited(false);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (cat: Category) => {
        setEditingCategoryId(cat.id);
        setFormName(cat.name || "");
        setFormNameAr(cat.name_ar || "");
        setFormParentId(cat.parentId || "");
        setFormDescription(cat.description || "");
        setFormDescriptionAr(cat.description_ar || "");
        setFormImage(cat.image || "");
        setNewCategorySlug(cat.slug || "");
        setSlugEdited(true);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.set("slug", newCategorySlug);
            formData.set("image", formImage);
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, formData);
            } else {
                await createCategory(formData);
            }
            closeModal();
            void fetchCategories();
        } catch (err) {
            setIsLoading(false);
            if (err instanceof Error && err.message.includes("name_ar")) {
                alert(t('nameArRequired'));
                return;
            }
            alert(err instanceof Error ? err.message : "Error");
        }
    }

    async function handleDelete(id: string) {
        if (confirm(t('deleteConfirm'))) {
            setIsLoading(true);
            await deleteCategory(id);
            void fetchCategories();
        }
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormName(e.target.value);
        if (!slugEdited) {
            setNewCategorySlug(generateSlug(e.target.value));
        }
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setNewCategorySlug(generateSlug(e.target.value));
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>{t('subtitle')}</p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    {t('addNew')}
                </button>
            </div>

            <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem 1.5rem' }}>{tCommon('name')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{tCommon('slug')}</th>
                            <th style={{ padding: '1rem 1.5rem' }}>{t('productsCount')}</th>
                            <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>{tCommon('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat) => (
                            <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {cat.image ? (
                                            <div style={{ position: 'relative', width: '44px', height: '44px', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)', background: '#fff' }}>
                                                <Image src={cat.image} alt={cat.name} fill sizes="44px" style={{ objectFit: 'cover' }} />
                                            </div>
                                        ) : (
                                            <div style={{ width: '44px', height: '44px', borderRadius: '0.5rem', border: '1px solid var(--border)', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
                                                🖼️
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{cat.name}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', direction: 'rtl' }}>{cat.name_ar}</div>
                                        </div>
                                    </div>
                                    {cat.parent && <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{t('parent')}: {cat.parent.name}</div>}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{cat.slug}</td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <span style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem' }}>
                                    {cat._count?.products || 0} {t('productsCount')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                    <button onClick={() => openEditModal(cat)} style={{ color: 'var(--primary)', fontWeight: '600', marginRight: '1rem' }}>{tCommon('edit')}</button>
                                    <button onClick={() => handleDelete(cat.id)} style={{ color: '#ef4444', fontWeight: '600' }}>{tCommon('delete')}</button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && categories.length === 0 && (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                                    {t('notFound')}
                                </td>
                            </tr>
                        )}
                        {isLoading && (
                            <tr>
                                <td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }}>{tCommon('loading')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '2rem 1rem',
                    overflowY: 'auto',
                    zIndex: 2000
                }}>
                    <form
                        onSubmit={handleSubmit}
                        className="card"
                        style={{
                            width: 'min(520px, 100%)',
                            padding: '1.5rem',
                            backgroundColor: 'white',
                            boxSizing: 'border-box'
                        }}
                    >
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingCategoryId ? tCommon('edit') : t('addNew')}</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('categoryName')}</label>
                                <input
                                    name="name" required type="text" placeholder={t('namePlaceholder')}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                    value={formName}
                                    onChange={handleNameChange}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{tCommon('slug')}</label>
                                <input
                                    name="slug" required type="text" placeholder={t('slugPlaceholder')}
                                    value={newCategorySlug}
                                    onChange={handleSlugChange}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('parentOptional')}</label>
                                <select
                                    name="parentId"
                                    value={formParentId}
                                    onChange={(e) => setFormParentId(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                >
                                    <option value="">{t('noParent')}</option>
                                    {categories
                                        .filter((c) => c.id !== editingCategoryId)
                                        .map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {locale === 'ar' ? c.name_ar : c.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                            <div style={{ direction: 'rtl' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('categoryNameAr')}</label>
                                <input
                                    name="name_ar" required type="text" placeholder={t('nameArPlaceholder')}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                    value={formNameAr}
                                    onChange={(e) => setFormNameAr(e.target.value)}
                                />
                            </div>
                            <ImageUpload value={formImage} onChange={setFormImage} label={tCommon('image')} />
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{tCommon('descriptionEn')}</label>
                                <textarea
                                    name="description" rows={3}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ direction: 'rtl' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{tCommon('descriptionAr')}</label>
                                <textarea
                                    name="description_ar" rows={3}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)' }}
                                    value={formDescriptionAr}
                                    onChange={(e) => setFormDescriptionAr(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{tCommon('save')}</button>
                                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={closeModal}>{tCommon('cancel')}</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
