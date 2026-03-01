"use client";

import { useState } from "react";
import { createPage, updatePage } from "@/actions/pageActions";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import { useTranslations } from 'next-intl';

interface PageFormData {
    id: string;
    title: string;
    title_ar?: string | null;
    slug: string;
    content?: string | null;
    content_ar?: string | null;
    template?: string | null;
    isActive?: boolean;
}

export default function PageForm({ initialData }: { initialData?: Partial<PageFormData> }) {
    const t = useTranslations('AdminPageForm');
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [content, setContent] = useState(initialData?.content || "");
    const [contentAr, setContentAr] = useState(initialData?.content_ar || "");
    const [contentTab, setContentTab] = useState<'en' | 'ar'>('en');
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [title, setTitle] = useState(initialData?.title || "");
    const [titleAr, setTitleAr] = useState(initialData?.title_ar || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Auto-generate slug from title when title changes
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!initialData?.id || !initialData?.slug) {
            setSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
        if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
    };

    const handleTitleArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleAr(e.target.value);
        if (errors.title_ar) setErrors(prev => ({ ...prev, title_ar: '' }));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!title.trim()) newErrors.title = t('titleRequired') || "Title is required";
        if (!titleAr.trim()) newErrors.title_ar = t('titleArRequired') || "Arabic title is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        
        if (!validate()) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsPending(true);
        const formData = new FormData(e.currentTarget);
        formData.set('title', title);
        formData.set('title_ar', titleAr);
        formData.set('content', content);
        formData.set('content_ar', contentAr);
        formData.set('slug', slug);

        try {
            if (initialData?.id) {
                await updatePage(initialData.id, formData);
            } else {
                await createPage(formData);
            }
            router.push("/admin/pages");
        } catch (error) {
            console.error("Failed to save page:", error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', maxWidth: '900px' }}>
            {/* Hidden input for controlled component */}
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="content_ar" value={contentAr} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t('titleEn')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="title" 
                        value={title} 
                        onChange={handleTitleChange} 
                        className={`input ${errors.title ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                        placeholder={t('titlePlaceholder')}
                    />
                    {errors.title && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title}</p>}
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t('titleAr')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="title_ar" 
                        value={titleAr} 
                        onChange={handleTitleArChange}
                        dir="rtl"
                        className={`input ${errors.title_ar ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                        placeholder={t('titleArPlaceholder')}
                    />
                    {errors.title_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title_ar}</p>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Hidden slug input */}
                <input type="hidden" name="slug" value={slug} />
                
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('template')}</label>
                    <select name="template" defaultValue={initialData?.template || "default"} className="input" style={{ width: '100%' }}>
                        <option value="default">{t('templateDefault')}</option>
                        <option value="full-width">{t('templateFullWidth')}</option>
                        <option value="sidebar">{t('templateSidebar')}</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                        type="button"
                        onClick={() => setContentTab('en')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: contentTab === 'en' ? '#3b82f6' : 'transparent',
                            color: contentTab === 'en' ? 'white' : '#374151',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            borderRadius: '8px 8px 0 0',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('english')} 🇬🇧
                    </button>
                    <button
                        type="button"
                        onClick={() => setContentTab('ar')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: contentTab === 'ar' ? '#3b82f6' : 'transparent',
                            color: contentTab === 'ar' ? 'white' : '#374151',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            borderRadius: '8px 8px 0 0',
                            transition: 'all 0.2s',
                        }}
                    >
                        {t('arabic')} 🇸🇦
                    </button>
                </div>
                
                {/* RichTextEditor based on active tab */}
                {contentTab === 'en' ? (
                    <RichTextEditor 
                        label={t('contentEn')}
                        value={content}
                        onChange={setContent}
                    />
                ) : (
                    <div dir="rtl">
                        <RichTextEditor 
                            label={t('contentAr')}
                            value={contentAr}
                            onChange={setContentAr}
                        />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="checkbox" name="isActive" value="true" defaultChecked={initialData?.isActive !== false} />
                    {t('isActive')}
                </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                    {isPending ? t('saving') : initialData ? t('update') : t('create')}
                </button>
                <button type="button" onClick={() => router.back()} className="btn btn-outline">{t('cancel')}</button>
            </div>
        </form>
    );
}
