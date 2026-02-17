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
    const [slug, setSlug] = useState(initialData?.slug || "");

    // Auto-generate slug from title when title changes
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!initialData?.id || !initialData?.slug) {
            setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
        }
    };

    async function action(formData: FormData) {
        setIsPending(true);
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
        <form action={action} className="card" style={{ padding: '2rem', maxWidth: '900px' }}>
            {/* Hidden input for controlled component */}
            <input type="hidden" name="content" value={content} />
            <input type="hidden" name="content_ar" value={contentAr} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('titleEn')}</label>
                    <input 
                        name="title" 
                        defaultValue={initialData?.title} 
                        onChange={handleTitleChange} 
                        required 
                        className="input" 
                        style={{ width: '100%' }} 
                        placeholder={t('titlePlaceholder')}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('titleAr')}</label>
                    <input 
                        name="title_ar" 
                        defaultValue={initialData?.title_ar || ""} 
                        dir="rtl"
                        className="input" 
                        style={{ width: '100%' }} 
                        placeholder={t('titleArPlaceholder')}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>{t('slug')}</label>
                    <input 
                        name="slug" 
                        value={slug} 
                        onChange={(e) => setSlug(e.target.value)} 
                        required 
                        className="input" 
                        style={{ width: '100%' }} 
                        placeholder={t('slugPlaceholder')}
                    />
                </div>
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
                <RichTextEditor 
                    label={t('contentEn')}
                    value={content}
                    onChange={setContent}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <RichTextEditor 
                    label={t('contentAr')}
                    value={contentAr}
                    onChange={setContentAr}
                    dir="rtl"
                />
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
