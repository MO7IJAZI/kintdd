"use client";

import { useState } from "react";
import { createExpertArticle, updateExpertArticle } from "@/actions/expertArticleActions";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import { useTranslations } from "next-intl";

interface ExpertArticle {
    id: string;
    title: string;
    title_ar?: string | null;
    slug: string;
    category: string;
    order: number;
    image?: string | null;
    excerpt?: string | null;
    excerpt_ar?: string | null;
    content: string | null;
    content_ar?: string | null;
    metaTitle?: string | null;
    metaTitle_ar?: string | null;
    metaDesc?: string | null;
    metaDesc_ar?: string | null;
    isPublished?: boolean;
    publishedAt?: string | Date | null;
}

export default function ExpertArticleForm({ initialData }: { initialData?: Partial<ExpertArticle> }) {
    const t = useTranslations('AdminExpertArticleForm');
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [content, setContent] = useState(initialData?.content || "");
    const [contentAr, setContentAr] = useState(initialData?.content_ar || "");
    const [contentTab, setContentTab] = useState<'en' | 'ar'>('en');
    const [image, setImage] = useState(initialData?.image || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
    const [publishedAt, setPublishedAt] = useState(initialData?.publishedAt ? new Date(initialData.publishedAt).toISOString().split('T')[0] : '');
    const [title, setTitle] = useState(initialData?.title || "");
    const [titleAr, setTitleAr] = useState(initialData?.title_ar || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const generateSlug = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')        // Replace spaces with -
            .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
            .replace(/\-\-+/g, '-');     // Replace multiple - with single -
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        if (!initialData && currentLang === 'en') { // Only auto-generate for new articles from English title
            const newSlug = generateSlug(val);
            setSlug(newSlug);
        }
        if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
    };

    const handleTitleArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleAr(e.target.value);
        if (errors.title_ar) setErrors(prev => ({ ...prev, title_ar: '' }));
    };

    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlug(generateSlug(e.target.value));
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
        formData.set('image', image);
        formData.set('slug', slug);
        
        try {
            if (initialData?.id) {
                await updateExpertArticle(initialData.id, formData);
            } else {
                await createExpertArticle(formData);
            }
            router.push("/admin/expert-articles");
        } catch (error) {
            console.error(error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', maxWidth: '1100px' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <button
                    type="button"
                    onClick={() => setCurrentLang('en')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: currentLang === 'en' ? 'var(--primary)' : 'transparent',
                        color: currentLang === 'en' ? 'white' : 'var(--foreground)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    {t('english')}
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentLang('ar')}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: currentLang === 'ar' ? 'var(--primary)' : 'transparent',
                        color: currentLang === 'ar' ? 'white' : 'var(--foreground)',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                >
                    {t('arabic')}
                </button>
            </div>

            {/* Hidden inputs for controlled components */}
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="content_ar" value={contentAr} />
            <input type="hidden" name="image" value={image} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t('articleTitleEn')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="title" 
                        value={title} 
                        onChange={handleTitleChange} 
                        className={`input ${errors.title ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                    />
                    {errors.title && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title}</p>}
                </div>
                <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                        {t('articleTitleAr')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="title_ar" 
                        value={titleAr} 
                        onChange={handleTitleArChange} 
                        className={`input ${errors.title_ar ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                    />
                    {errors.title_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title_ar}</p>}
                </div>
                {/* Hidden slug input */}
                <input type="hidden" name="slug" value={slug} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('category')}</label>
                    <select name="category" defaultValue={initialData?.category || 'arable'} className="input" style={{ width: '100%' }}>
                        <option value="arable">{t('categories.arable')}</option>
                        <option value="fruit">{t('categories.fruit')}</option>
                        <option value="vegetable">{t('categories.vegetable')}</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Publish Date</label>
                    <input 
                        type="date" 
                        name="publishedAt" 
                        value={publishedAt} 
                        onChange={(e) => setPublishedAt(e.target.value)}
                        className="input" 
                        style={{ width: '100%' }} 
                    />
                </div>
            </div>

            <ImageUpload 
                label={t('imageLabel')}
                value={image}
                onChange={setImage}
            />

            <div style={{ marginBottom: '1.5rem', display: currentLang === 'en' ? 'block' : 'none' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('excerptEn')}</label>
                <textarea name="excerpt" defaultValue={initialData?.excerpt || ""} rows={3} className="input" style={{ width: '100%', fontFamily: 'inherit' }} />
            </div>
            <div style={{ marginBottom: '1.5rem', display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('excerptAr')}</label>
                <textarea name="excerpt_ar" defaultValue={initialData?.excerpt_ar || ""} rows={3} className="input" style={{ width: '100%', fontFamily: 'inherit' }} />
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
                        value={content || ""}
                        onChange={setContent}
                    />
                ) : (
                    <div dir="rtl">
                        <RichTextEditor 
                            label={t('contentAr')}
                            value={contentAr || ""}
                            onChange={setContentAr}
                            dir="rtl"
                        />
                    </div>
                )}
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('seoSettings')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaTitleEn')}</label>
                        <input name="metaTitle" defaultValue={initialData?.metaTitle || ""} className="input" style={{ width: '100%' }} placeholder={t('metaTitlePlaceholder')} />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('metaTitleAr')}</label>
                        <input name="metaTitle_ar" defaultValue={initialData?.metaTitle_ar || ""} className="input" style={{ width: '100%' }} placeholder={t('metaTitlePlaceholder')} />
                    </div>
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaDescEn')}</label>
                        <textarea name="metaDesc" defaultValue={initialData?.metaDesc || ""} rows={2} className="input" style={{ width: '100%', fontFamily: 'inherit' }} placeholder={t('metaDescPlaceholder')} />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('metaDescAr')}</label>
                        <textarea name="metaDesc_ar" defaultValue={initialData?.metaDesc_ar || ""} rows={2} className="input" style={{ width: '100%', fontFamily: 'inherit' }} placeholder={t('metaDescPlaceholder')} />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="checkbox" name="isPublished" value="true" defaultChecked={initialData?.isPublished} />
                    {t('publishImmediately')}
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
