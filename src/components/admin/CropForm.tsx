"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { createCrop, updateCrop } from "@/actions/cropActions";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";
import StagesEditor from "./StagesEditor";
import { generateSlug } from "@/lib/slugUtils";
import { useLocale } from "next-intl";

interface CropProduct {
    id: string;
    name: string;
}

interface CropStageData {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    recommendation?: {
        products?: string[];
    };
}

interface CropRecommendedProduct {
    id: string;
}

interface CropInitialData {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    category?: string | null;
    category_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    harvestSeason_ar?: string | null;
    image?: string | null;
    pdfUrl?: string | null;
    pdfUrl_ar?: string | null; // Added
    documentTitle?: string | null;
    documentTitle_ar?: string | null;
    metaTitle?: string | null;
    metaTitle_ar?: string | null;
    recommendedProducts?: CropRecommendedProduct[];
    stages?: CropStageData[];
}

interface StageFormData {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    products: string[];
}

interface CropFormProps {
    initialData?: CropInitialData;
    products?: CropProduct[];
}

export default function CropForm({ initialData, products = [] }: CropFormProps) {
    const router = useRouter();
    const t = useTranslations('AdminCropForm');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const [isPending, setIsPending] = useState(false);
    const [description, setDescription] = useState(initialData?.description || "");
    const [description_ar, setDescriptionAr] = useState(initialData?.description_ar || "");
    const [descriptionTab, setDescriptionTab] = useState<'en' | 'ar'>('en');
    const [image, setImage] = useState(initialData?.image || "");
    const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
    const [pdfUrl_ar, setPdfUrlAr] = useState(initialData?.pdfUrl_ar || "");
    const [documentTitle, setDocumentTitle] = useState(initialData?.documentTitle || "");
    const [documentTitleAr, setDocumentTitleAr] = useState(initialData?.documentTitle_ar || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [slugEdited, setSlugEdited] = useState(false);
    const [name, setName] = useState(initialData?.name || "");
    const [name_ar, setNameAr] = useState(initialData?.name_ar || "");
    const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
    const [metaTitleAr, setMetaTitleAr] = useState(initialData?.metaTitle_ar || "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const predefinedCategories = ["vegetables", "fruits", "legumes", "cereals", "industrial", "herbs"];
    const isExistingInitialCategory = initialData?.category ? predefinedCategories.includes(initialData.category) : true;
    const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>(isExistingInitialCategory ? 'existing' : 'new');
    const [selectedCategory, setSelectedCategory] = useState(
        isExistingInitialCategory ? (initialData?.category || "vegetables") : "vegetables"
    );
    const [newCategoryEn, setNewCategoryEn] = useState(isExistingInitialCategory ? "" : (initialData?.category || ""));
    const [newCategoryAr, setNewCategoryAr] = useState(isExistingInitialCategory ? "" : (initialData?.category_ar || ""));

    // Legacy simple product selection (might be redundant if stages are used, but good to keep for general recommendations)
    const [selectedProducts, setSelectedProducts] = useState<string[]>(
        initialData?.recommendedProducts?.map((p) => p.id) || []
    );

    // Stages
    const [stages, setStages] = useState<StageFormData[]>(
        initialData?.stages?.map((s) => ({
            name: s.name,
            name_ar: s.name_ar || "",
            description: s.description || "",
            description_ar: s.description_ar || "",
            products: s.recommendation?.products || []
        })) || []
    );

    const [isTranslatingDesc, setIsTranslatingDesc] = useState(false);
    const storageKey = `${initialData?.id ? `crop:${initialData.id}` : 'crop:new'}:${isRtl ? 'ar' : 'en'}`;

    // manual bilingual entry; client auto-translate removed

    // removed google translate widget

    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return;
            const saved = JSON.parse(raw) as {
                description?: string;
                description_ar?: string;
                image?: string;
                pdfUrl?: string;
                pdfUrl_ar?: string;
                documentTitle?: string;
                documentTitle_ar?: string;
                slug?: string;
                selectedProducts?: string[];
                stages?: StageFormData[];
            };
            setTimeout(() => {
                if (saved.description) setDescription(prev => prev || saved.description!);
                if (saved.description_ar) setDescriptionAr(prev => prev || saved.description_ar!);
                if (saved.image) setImage(prev => prev || saved.image!);
                if (saved.pdfUrl) setPdfUrl(prev => prev || saved.pdfUrl!);
                if (saved.pdfUrl_ar) setPdfUrlAr(prev => prev || saved.pdfUrl_ar!);
                if (saved.documentTitle) setDocumentTitle(prev => prev || saved.documentTitle!);
                if (saved.documentTitle_ar) setDocumentTitleAr(prev => prev || saved.documentTitle_ar!);
                if (saved.slug) setSlug(prev => prev || saved.slug!);
                if (Array.isArray(saved.selectedProducts) && saved.selectedProducts.length) {
                    setSelectedProducts(prev => prev.length ? prev : saved.selectedProducts as string[]);
                }
                if (Array.isArray(saved.stages) && saved.stages.length) {
                    setStages(prev => prev.length ? prev : saved.stages as StageFormData[]);
                }
            }, 0);
        } catch {}
    }, [storageKey]);

    useEffect(() => {
        try {
            const payload = JSON.stringify({
                description,
                description_ar,
                image,
                pdfUrl,
                pdfUrl_ar,
                documentTitle,
                documentTitle_ar: documentTitleAr,
                slug,
                selectedProducts,
                stages,
            });
            localStorage.setItem(storageKey, payload);
        } catch {}
    }, [description, description_ar, image, pdfUrl, pdfUrl_ar, documentTitle, documentTitleAr, slug, selectedProducts, stages, storageKey]);

    // Auto-generate slug from name when name changes and slug hasn't been manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setName(val);
        if (!slugEdited && !initialData?.id) {
            setSlug(generateSlug(val));
        }
        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
    };

    const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNameAr(e.target.value);
        if (errors.name_ar) setErrors(prev => ({ ...prev, name_ar: '' }));
    };

    // Allow manual slug editing
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setSlug(generateSlug(e.target.value));
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = t('nameRequired');
        if (!name_ar.trim()) newErrors.name_ar = t('nameArRequired');
        if (categoryMode === 'new') {
            if (!newCategoryEn.trim()) newErrors.category = t('newCategoryEnRequired');
            if (!newCategoryAr.trim()) newErrors.category_ar = t('newCategoryArRequired');
        }
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
        formData.set("name", name);
        formData.set("name_ar", name_ar);
        formData.set("description", description);
        formData.set("description_ar", description_ar);
        formData.set("image", image);
        formData.set("pdfUrl", pdfUrl);
        formData.set("pdfUrl_ar", pdfUrl_ar);
        formData.set("documentTitle", documentTitle);
        formData.set("documentTitle_ar", documentTitleAr);
        formData.set("metaTitle", metaTitle);
        formData.set("metaTitle_ar", metaTitleAr);
        formData.set("slug", slug);
        if (categoryMode === 'new') {
            formData.set("category", newCategoryEn.trim());
            formData.set("category_ar", newCategoryAr.trim());
        } else {
            formData.set("category", selectedCategory);
            formData.delete("category_ar");
        }
        formData.set("productIds", JSON.stringify(selectedProducts));
        formData.set("stages", JSON.stringify(stages));

        try {
            if (initialData?.id) {
                await updateCrop(initialData.id, formData);
            } else {
                await createCrop(formData);
            }

            setIsPending(false);
            router.push("/admin/crops");
            try {
                localStorage.removeItem(storageKey);
            } catch {}
        } catch (error) {
            console.error("Error saving crop:", error);
            setIsPending(false);
        }
    }

    const toggleProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', maxWidth: '1000px', backgroundColor: 'white' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('cropNameEn')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="name" 
                        value={name} 
                        onChange={handleNameChange} 
                        className={`input ${errors.name ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                        placeholder={t('cropNamePlaceholder')} 
                    />
                    {errors.name && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</p>}
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('cropNameAr')} <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                        name="name_ar" 
                        value={name_ar} 
                        onChange={handleNameArChange}
                        className={`input ${errors.name_ar ? 'border-red-500' : ''}`} 
                        style={{ width: '100%' }} 
                        placeholder={t('cropNameArPlaceholder')} 
                    />
                    {errors.name_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name_ar}</p>}
                </div>
            </div>

            {/* Slug hidden */}
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="pdfUrl" value={pdfUrl} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('categoryEn')}</label>
                    <select
                        value={categoryMode === 'new' ? '__new__' : selectedCategory}
                        onChange={(e) => {
                            if (e.target.value === '__new__') {
                                setCategoryMode('new');
                            } else {
                                setCategoryMode('existing');
                                setSelectedCategory(e.target.value);
                            }
                        }}
                        className="input"
                        style={{ width: '100%' }}
                    >
                        <option value="vegetables">{t('vegetables')}</option>
                        <option value="fruits">{t('fruits')}</option>
                        <option value="legumes">{t('legumes')}</option>
                        <option value="cereals">{t('cereals')}</option>
                        <option value="industrial">{t('industrial')}</option>
                        <option value="herbs">{t('herbs')}</option>
                        <option value="__new__">{t('addNewCategoryOption')}</option>
                    </select>
                    {categoryMode === 'new' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.75rem' }}>
                            <div>
                                <input
                                    value={newCategoryEn}
                                    onChange={(e) => setNewCategoryEn(e.target.value)}
                                    className="input"
                                    style={{ width: '100%' }}
                                    placeholder={t('newCategoryEnPlaceholder')}
                                />
                                {errors.category && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.category}</p>}
                            </div>
                            <div dir="rtl">
                                <input
                                    value={newCategoryAr}
                                    onChange={(e) => setNewCategoryAr(e.target.value)}
                                    className="input"
                                    style={{ width: '100%' }}
                                    placeholder={t('newCategoryArPlaceholder')}
                                />
                                {errors.category_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.category_ar}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <ImageUpload
                    label={t('image')}
                    value={image}
                    onChange={setImage}
                />
                <FileUpload
                    label={`${t('pdf')} (${t('english')})`}
                    value={pdfUrl}
                    onChange={setPdfUrl}
                />
                <FileUpload
                    label={`${t('pdf')} (${t('arabic')})`}
                    value={pdfUrl_ar}
                    onChange={setPdfUrlAr}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('documentTitleEn')}
                    </label>
                    <input 
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder={t('documentTitlePlaceholder')}
                    />
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('documentTitleAr')}
                    </label>
                    <input 
                        value={documentTitleAr}
                        onChange={(e) => setDocumentTitleAr(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder={t('documentTitleArPlaceholder')}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('metaTitle')}
                    </label>
                    <input 
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder="English meta title..."
                    />
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                        {t('metaTitleAr')}
                    </label>
                    <input 
                        value={metaTitleAr}
                        onChange={(e) => setMetaTitleAr(e.target.value)}
                        className="input"
                        style={{ width: '100%' }}
                        placeholder={t('metaTitleArPlaceholder')}
                    />
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                {/* Language Tabs */}
                <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    marginBottom: '1rem',
                    borderBottom: '2px solid #e5e7eb'
                }}>
                    <button
                        type="button"
                        onClick={() => setDescriptionTab('en')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: descriptionTab === 'en' ? '#3b82f6' : 'transparent',
                            color: descriptionTab === 'en' ? 'white' : '#374151',
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
                        onClick={() => setDescriptionTab('ar')}
                        style={{
                            padding: '0.75rem 1.5rem',
                            border: 'none',
                            background: descriptionTab === 'ar' ? '#3b82f6' : 'transparent',
                            color: descriptionTab === 'ar' ? 'white' : '#374151',
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
                {descriptionTab === 'en' ? (
                    <RichTextEditor
                        label={t('descriptionEn')}
                        value={description}
                        onChange={setDescription}
                    />
                ) : (
                    <div dir="rtl">
                        <RichTextEditor
                            label={t('descriptionAr')}
                            value={description_ar}
                            onChange={setDescriptionAr}
                        />
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <StagesEditor 
                    initialData={stages}
                    products={products}
                    onChange={setStages}
                />
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('recommendedProducts')}</label>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1rem',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '1.5rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: '0.75rem',
                    border: '1px solid var(--border)'
                }}>
                    {products.map(product => (
                        <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input 
                                type="checkbox" 
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => toggleProduct(product.id)}
                                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                            />
                            {product.name}
                        </label>
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                <button type="submit" disabled={isPending} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
                    {isPending ? t('processing') : initialData ? t('update') : t('create')}
                </button>
                <button type="button" onClick={() => router.back()} className="btn btn-outline" style={{ padding: '1rem 2rem' }}>{t('cancel')}</button>
            </div>
        </form>
    );
}
