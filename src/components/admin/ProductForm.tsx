"use client";

import { useRef, useState, lazy, Suspense } from "react";
import dynamic from "next/dynamic";
import { createProduct, updateProduct } from "@/actions/productActions";
import { useRouter } from "next/navigation";
import { generateSlug, generateAutoSlug } from "@/lib/slugUtils";
import { useLocale, useTranslations } from 'next-intl';

// Dynamic imports for heavy components
const ImageUpload = dynamic(() => import("./ImageUpload"), { ssr: false });
const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });
const DownloadsManager = dynamic(() => import("./DownloadsManager"), { ssr: false });
const TabsManager = dynamic(() => import("./TabsManager"), { ssr: false });
const ProductSectionsManager = dynamic(() => import("./ProductSectionsManager"), { ssr: false });

import type { Tab } from "./TabsManager";

interface Section {
    id: string;
    title: string;
    title_ar?: string | null;
    content: string;
    content_ar?: string | null;
    order: number;
    colorTheme: string;
}

interface Category {
    id: string;
    name: string;
    name_ar?: string | null;
}

interface DownloadItem {
    id?: string;
    title: string;
    type: string;
    fileUrl: string;
}

interface ProductData {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    categoryId?: string | null;
    sku?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    tabs?: Tab[] | null;
    tabs_ar?: Tab[] | null;
    image?: string | null;
    downloads?: DownloadItem[];
    metaTitle?: string | null;
    metaTitle_ar?: string | null;
    metaDesc?: string | null;
    metaDesc_ar?: string | null;
    isFeatured?: boolean;
    isOrganic?: boolean;
    order?: number;
    colorTheme?: string;
}

export default function ProductForm({ 
    categories, 
    initialData, 
    initialSections = [] 
}: { 
    categories: Category[], 
    initialData?: Partial<ProductData>,
    initialSections?: Section[]
}) {
    const router = useRouter();
    const locale = useLocale();
    const t = useTranslations('AdminProductForm');
    const tCommon = useTranslations('AdminCommon');
    const [isPending, setIsPending] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [activeLang, setActiveLang] = useState<'en' | 'ar'>('en');
    const [tabsSyncKey, setTabsSyncKey] = useState(0);
    const isArLocale = locale === "ar";

    const nameEnRef = useRef<HTMLInputElement | null>(null);
    
    // English State
    const [nameEn, setNameEn] = useState(initialData?.name || "");
    const [shortDescEn, setShortDescEn] = useState(initialData?.shortDesc || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [tabs, setTabs] = useState<Tab[]>(
        Array.isArray(initialData?.tabs) ? (initialData?.tabs as Tab[]) : []
    );
    const [metaTitleEn, setMetaTitleEn] = useState(initialData?.metaTitle || "");
    const [metaDescEn, setMetaDescEn] = useState(initialData?.metaDesc || "");

    // Arabic State
    const [nameAr, setNameAr] = useState(initialData?.name_ar || "");
    const [shortDescAr, setShortDescAr] = useState(initialData?.shortDesc_ar || "");
    const [descriptionAr, setDescriptionAr] = useState(initialData?.description_ar || "");
    const [tabsAr, setTabsAr] = useState<Tab[]>(
        Array.isArray(initialData?.tabs_ar) ? (initialData?.tabs_ar as Tab[]) : []
    );
    const [metaTitleAr, setMetaTitleAr] = useState(initialData?.metaTitle_ar || "");
    const [metaDescAr, setMetaDescAr] = useState(initialData?.metaDesc_ar || "");

    // Common State
    const [image, setImage] = useState(initialData?.image || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [downloads, setDownloads] = useState<DownloadItem[]>(initialData?.downloads || []);
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
    const [isOrganic, setIsOrganic] = useState(initialData?.isOrganic || false);
    const [order, setOrder] = useState(initialData?.order || 0);
    const [colorTheme, setColorTheme] = useState(initialData?.colorTheme || "blue");

    // Auto-generate slug from name when name changes and slug hasn't been manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nameValue = e.target.value;
        setNameEn(nameValue);
        if (!slugEdited && !initialData?.id) {
            setSlug(generateAutoSlug(nameValue, nameAr, activeLang));
        }
    };

    // Auto-generate slug from Arabic name when Arabic name changes and slug hasn't been manually edited
    const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNameAr = e.target.value;
        setNameAr(newNameAr);
        if (!slugEdited && !initialData?.id && activeLang === 'ar') {
            const nameValue = nameEn;
            setSlug(generateAutoSlug(nameValue, newNameAr, activeLang));
        }
    };

    // Allow manual slug editing
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setSlug(generateSlug(e.target.value));
    };

    async function translateToEnglish() {
        const fetchTranslate = async (q: string | string[], format: "text" | "html") => {
            const res = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ q, source: "ar", target: "en", format }),
            });
            const data = (await res.json().catch(() => null)) as { translatedText?: string | string[]; error?: string } | null;
            if (!res.ok) {
                throw new Error(data?.error || "Failed to translate");
            }
            return data?.translatedText;
        };

        setIsTranslating(true);
        try {
            const name = nameAr?.trim() ? await fetchTranslate(nameAr, "text") : null;
            const shortDesc = shortDescAr?.trim() ? await fetchTranslate(shortDescAr, "text") : null;
            const metaTitle = metaTitleAr?.trim() ? await fetchTranslate(metaTitleAr, "text") : null;
            const metaDesc = metaDescAr?.trim() ? await fetchTranslate(metaDescAr, "text") : null;
            const desc = descriptionAr?.trim() ? await fetchTranslate(descriptionAr, "html") : null;

            if (typeof name === "string") setNameEn(name);
            if (typeof shortDesc === "string") setShortDescEn(shortDesc);
            if (typeof metaTitle === "string") setMetaTitleEn(metaTitle);
            if (typeof metaDesc === "string") setMetaDescEn(metaDesc);
            if (typeof desc === "string") setDescription(desc);

            if (Array.isArray(tabsAr) && tabsAr.length > 0) {
                const titles = tabsAr.map((tab) => tab.title || "");
                const contents = tabsAr.map((tab) => tab.content || "");

                const [translatedTitlesRaw, translatedContentsRaw] = await Promise.all([
                    fetchTranslate(titles, "text"),
                    fetchTranslate(contents, "html"),
                ]);

                const translatedTitles = Array.isArray(translatedTitlesRaw) ? translatedTitlesRaw : [];
                const translatedContents = Array.isArray(translatedContentsRaw) ? translatedContentsRaw : [];

                const nextTabs: Tab[] = tabsAr.map((tab, i) => ({
                    id: tab.id,
                    title: translatedTitles[i] || tab.title,
                    content: translatedContents[i] || tab.content,
                }));
                setTabs(nextTabs);
                setTabsSyncKey((v) => v + 1);
            }

            setActiveLang("en");
        } catch (error) {
            console.error("Translation failed:", error);
            alert(error instanceof Error ? error.message : "Failed to translate");
        } finally {
            setIsTranslating(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        formData.set("description", description);
        formData.set("description_ar", descriptionAr);
        formData.set("image", image);
        formData.set("slug", slug);
        formData.set("isFeatured", String(isFeatured));
        formData.set("isOrganic", String(isOrganic));
        formData.set("order", String(order));
        formData.set("colorTheme", colorTheme);
        
        // Serialize complex data
        formData.set("downloads", JSON.stringify(downloads));
        formData.set("tabs", JSON.stringify(tabs));
        formData.set("tabs_ar", JSON.stringify(tabsAr));

        if (initialData?.id) {
            await updateProduct(initialData.id, formData);
        } else {
            await createProduct(formData);
        }

        setIsPending(false);
        router.push("/admin/products");
    }

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', maxWidth: '1000px', backgroundColor: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('productName')}</label>
                    <input ref={nameEnRef} name="name" value={nameEn} onChange={handleNameChange} required className="input" style={{ width: '100%' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('slug')}</label>
                    <input value={slug} onChange={handleSlugChange} required className="input" style={{ width: '100%' }} placeholder="url-friendly-slug" />
                    <input type="hidden" name="slug" value={slug} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                <ImageUpload
                    label={t('image')}
                    value={image}
                    onChange={setImage}
                />
                
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('category')}</label>
                    <select name="categoryId" defaultValue={initialData?.categoryId || ""} required className="input" style={{ width: '100%' }}>
                        <option value="">{t('selectCategory')}</option>
                        {categories.map((c) => {
                            const label = isArLocale ? (c.name_ar || c.name) : c.name;
                            return (
                                <option key={c.id} value={c.id}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    
                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('sku')}</label>
                        <input name="sku" defaultValue={initialData?.sku || ""} className="input" style={{ width: '100%' }} />
                    </div>
                </div>
            </div>

            {/* Product Options & Settings */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '2rem', 
                marginBottom: '2.5rem', 
                backgroundColor: '#f8fafc', 
                padding: '2rem', 
                borderRadius: '1.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontWeight: '800', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('visibility')}
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: isFeatured ? 'var(--primary-light)' : 'white', borderRadius: '0.75rem', border: `1px solid ${isFeatured ? 'var(--primary)' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                            <input 
                                type="checkbox" 
                                checked={isFeatured} 
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isFeatured ? 'var(--primary)' : '#1e293b' }}>{t('showOnHomepage')}</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', backgroundColor: isOrganic ? '#ecfdf5' : 'white', borderRadius: '0.75rem', border: `1px solid ${isOrganic ? '#10b981' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
                            <input 
                                type="checkbox" 
                                checked={isOrganic} 
                                onChange={(e) => setIsOrganic(e.target.checked)}
                                style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                            />
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isOrganic ? '#059669' : '#1e293b' }}>{t('certifiedOrganic')}</span>
                        </label>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontWeight: '800', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('displayOrder')}
                    </label>
                    <input 
                        type="number" 
                        value={order} 
                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)} 
                        className="input" 
                        style={{ width: '100%', height: '48px', fontWeight: 700 }} 
                        placeholder="0"
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ fontWeight: '800', fontSize: '0.85rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('colorTheme')}
                    </label>
                    <select 
                        value={colorTheme} 
                        onChange={(e) => setColorTheme(e.target.value)} 
                        className="input" 
                        style={{ width: '100%', height: '48px', fontWeight: 700 }}
                    >
                        <option value="blue">Blue (Default)</option>
                        <option value="green">Green (Bio)</option>
                        <option value="purple">Purple (Specialty)</option>
                        <option value="orange">Orange (Fertilizers)</option>
                        <option value="pink">Pink (Growth)</option>
                        <option value="slate">Slate (Industrial)</option>
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={() => setActiveLang('en')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderBottom: activeLang === 'en' ? '2px solid var(--primary)' : '2px solid transparent',
                                fontWeight: activeLang === 'en' ? '700' : '400',
                                color: activeLang === 'en' ? 'var(--primary)' : 'var(--muted-foreground)',
                                backgroundColor: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            {t('tabEnglish')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveLang('ar')}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderBottom: activeLang === 'ar' ? '2px solid var(--primary)' : '2px solid transparent',
                                fontWeight: activeLang === 'ar' ? '700' : '400',
                                color: activeLang === 'ar' ? 'var(--primary)' : 'var(--muted-foreground)',
                                backgroundColor: 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            {t('tabArabic')}
                        </button>
                    </div>

                    <button type="button" className="btn btn-outline" onClick={translateToEnglish} disabled={isPending || isTranslating}>
                        {isTranslating ? t('translating') : t('translateToEnglish')}
                    </button>
                </div>
            </div>

            <div style={{ display: activeLang === 'en' ? 'block' : 'none' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('summary')}</label>
                    <textarea
                        name="shortDesc"
                        value={shortDescEn}
                        onChange={(e) => setShortDescEn(e.target.value)}
                        rows={3}
                        className="input"
                        style={{ width: '100%', fontFamily: 'inherit' }}
                        placeholder="Briefly describe the product's primary purpose..."
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <RichTextEditor
                        label={t('description')}
                        value={description}
                        onChange={setDescription}
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <TabsManager key={`en-${tabsSyncKey}`} initialData={tabs} onChange={setTabs} />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('seo')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaTitle')}</label>
                            <input name="metaTitle" value={metaTitleEn} onChange={(e) => setMetaTitleEn(e.target.value)} className="input" style={{ width: '100%' }} placeholder="SEO Title (optional)" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaDesc')}</label>
                            <textarea name="metaDesc" value={metaDescEn} onChange={(e) => setMetaDescEn(e.target.value)} rows={2} className="input" style={{ width: '100%', fontFamily: 'inherit' }} placeholder="SEO Description (optional)" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: activeLang === 'ar' ? 'block' : 'none' }}>
                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('productName')}</label>
                    <input name="name_ar" value={nameAr} onChange={handleNameArChange} className="input" style={{ width: '100%' }} dir="rtl" />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '0.85rem' }}>{t('summary')}</label>
                    <textarea
                        name="shortDesc_ar"
                        value={shortDescAr}
                        onChange={(e) => setShortDescAr(e.target.value)}
                        rows={3}
                        className="input"
                        style={{ width: '100%', fontFamily: 'inherit' }}
                        dir="rtl"
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <RichTextEditor
                        label={t('description')}
                        value={descriptionAr}
                        onChange={setDescriptionAr}
                        dir="rtl"
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <TabsManager initialData={tabsAr} onChange={setTabsAr} dir="rtl" />
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginBottom: '2.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{t('seo')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaTitle')}</label>
                            <input name="metaTitle_ar" value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} className="input" style={{ width: '100%' }} dir="rtl" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', fontSize: '0.875rem' }}>{t('metaDesc')}</label>
                            <textarea name="metaDesc_ar" value={metaDescAr} onChange={(e) => setMetaDescAr(e.target.value)} rows={2} className="input" style={{ width: '100%', fontFamily: 'inherit' }} dir="rtl" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <DownloadsManager 
                    initialData={downloads}
                    onChange={setDownloads}
                />
            </div>

            {initialData?.id && (
                <div style={{ marginBottom: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <ProductSectionsManager 
                        productId={initialData.id} 
                        initialSections={initialSections} 
                    />
                </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <input 
                        type="checkbox" 
                        name="isFeatured" 
                        id="isFeatured"
                        defaultChecked={initialData?.isFeatured}
                        value="true"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor="isFeatured" style={{ fontWeight: '600', cursor: 'pointer' }}>{t('featured')}</label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <input 
                        type="checkbox" 
                        name="isOrganic" 
                        id="isOrganic"
                        defaultChecked={initialData?.isOrganic}
                        value="true"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                    />
                    <label htmlFor="isOrganic" style={{ fontWeight: '600', cursor: 'pointer' }}>{t('organic')}</label>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <button type="button" onClick={() => router.back()} className="btn btn-outline" disabled={isPending}>
                    {tCommon('cancel')}
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                    {isPending ? t('processing') : initialData ? t('update') : t('create')}
                </button>
            </div>
        </form>
    );
}
