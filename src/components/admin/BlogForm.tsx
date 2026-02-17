"use client";

import { useState } from "react";
import { createBlogPost, updateBlogPost } from "@/actions/blogActions";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import { generateSlug } from "@/lib/slugUtils";
import { useTranslations } from 'next-intl';

interface BlogPostFormData {
    id: string;
    title: string;
    title_ar?: string | null;
    slug: string;
    author: string;
    tags?: string | null;
    excerpt?: string | null;
    excerpt_ar?: string | null;
    content?: string | null;
    content_ar?: string | null;
    image?: string | null;
    metaTitle?: string | null;
    metaDesc?: string | null;
    isPublished?: boolean;
}

export default function BlogForm({ initialData }: { initialData?: Partial<BlogPostFormData> }) {
    const t = useTranslations('AdminBlogForm');
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    const [content, setContent] = useState(initialData?.content || "");
    const [contentAr, setContentAr] = useState(initialData?.content_ar || "");
    const [image, setImage] = useState(initialData?.image || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');

    // Parse initial tags if they exist
    const defaultTags = initialData?.tags 
        ? (() => {
            try {
                return JSON.parse(initialData.tags).join(', ');
            } catch {
                return initialData.tags;
            }
        })()
        : "";

    // Auto-generate slug from title when title changes and slug hasn't been manually edited
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!slugEdited && !initialData?.id && currentLang === 'en') {
            setSlug(generateSlug(e.target.value));
        }
    };

    // Allow manual slug editing
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setSlug(generateSlug(e.target.value));
    };

    async function action(formData: FormData) {
        setIsPending(true);
        // Append rich text content manually since they are state-controlled
        formData.set('content', content);
        formData.set('content_ar', contentAr);
        formData.set('image', image);
        
        try {
            if (initialData?.id) {
                await updateBlogPost(initialData.id, formData);
            } else {
                await createBlogPost(formData);
            }
            router.push("/admin/blog");
        } catch (error) {
            console.error("Failed to save blog post:", error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={action} className="card" style={{ padding: '2rem', maxWidth: '900px' }}>
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('titleEn')}</label>
                    <input name="title" defaultValue={initialData?.title} onChange={handleTitleChange} required={currentLang === 'en'} className="input" style={{ width: '100%' }} />
                </div>
                <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('titleAr')}</label>
                    <input name="title_ar" defaultValue={initialData?.title_ar || ''} className="input" style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('slug')}</label>
                    <input name="slug" value={slug} onChange={handleSlugChange} required className="input" style={{ width: '100%' }} placeholder="url-friendly-slug" />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('author')}</label>
                    <input name="author" defaultValue={initialData?.author} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('tags')}</label>
                    <input name="tags" defaultValue={defaultTags} className="input" style={{ width: '100%' }} placeholder={t('tagsPlaceholder')} />
                </div>
            </div>

            <ImageUpload 
                label={t('mainImage')}
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

            <div style={{ marginBottom: '2rem', display: currentLang === 'en' ? 'block' : 'none' }}>
                <RichTextEditor 
                    label={t('contentEn')}
                    value={content}
                    onChange={setContent}
                />
            </div>
            <div style={{ marginBottom: '2rem', display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                <RichTextEditor 
                    label={t('contentAr')}
                    value={contentAr}
                    onChange={setContentAr}
                />
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('seo')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaTitle')}</label>
                        <input name="metaTitle" defaultValue={initialData?.metaTitle || ""} className="input" style={{ width: '100%' }} placeholder={t('metaTitle')} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaDesc')}</label>
                        <textarea name="metaDesc" defaultValue={initialData?.metaDesc || ""} rows={2} className="input" style={{ width: '100%', fontFamily: 'inherit' }} placeholder={t('metaDesc')} />
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="checkbox" name="isPublished" value="true" defaultChecked={initialData?.isPublished} />
                    {t('publish')}
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
