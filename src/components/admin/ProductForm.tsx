"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { createProduct, updateProduct } from "@/actions/productActions";
import { useRouter } from "next/navigation";
import { generateSlug, generateAutoSlug } from "@/lib/slugUtils";
import { useLocale, useTranslations } from 'next-intl';
import { 
    Save, 
    X, 
    Globe, 
    LayoutGrid, 
    FileText, 
    Image as ImageIcon, 
    Settings, 
    Search,
    Languages,
    ArrowRightLeft,
    CheckCircle2,
    Leaf,
    AlertCircle,
    Download,
    Layers
} from "lucide-react";
import "./ProductForm.css"; // Import custom styles

// Dynamic imports for heavy components
const ImageUpload = dynamic(() => import("./ImageUpload"), { 
    ssr: false,
    loading: () => <div className="h-32 w-full bg-slate-100 animate-pulse rounded-lg" />
});
const RichTextEditor = dynamic(() => import("./RichTextEditor"), { 
    ssr: false,
    loading: () => <div className="h-64 w-full bg-slate-100 animate-pulse rounded-lg" />
});
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
    slug: string;
    parent?: {
        slug: string;
        name: string;
        name_ar?: string | null;
    } | null;
}

interface DownloadItem {
    id?: string;
    title: string;
    title_ar?: string | null;
    type: string;
    fileUrl: string;
    fileUrl_ar?: string | null;
}

interface TableRow {
    [key: string]: string;
}

interface ProductData {
    id: string;
    name: string;
    name_ar?: string | null;
    slug: string;
    categoryId?: string | null;
    shortDesc?: string | null;
    shortDesc_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    composition?: string | null;
    composition_ar?: string | null;
    tabs?: Tab[] | null;
    tabs_ar?: Tab[] | null;
    usageTable?: TableRow[] | null;
    usageTable_ar?: TableRow[] | null;
    compTable?: TableRow[] | null;
    compTable_ar?: TableRow[] | null;
    image?: string | null;
    images?: { id?: string; url: string; alt?: string | null }[];
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
    const tValidation = useTranslations('AdminValidation');
    const isArLocale = locale === "ar";

    const [isPending, setIsPending] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    // English State
    const [nameEn, setNameEn] = useState(initialData?.name || "");
    const [shortDescEn, setShortDescEn] = useState(initialData?.shortDesc || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [composition, setComposition] = useState(initialData?.composition || "");
    const [tabs, setTabs] = useState<Tab[]>(
        Array.isArray(initialData?.tabs) ? (initialData?.tabs as Tab[]) : []
    );
    const [metaTitleEn, setMetaTitleEn] = useState(initialData?.metaTitle || "");
    const [metaDescEn, setMetaDescEn] = useState(initialData?.metaDesc || "");

    // Arabic State
    const [nameAr, setNameAr] = useState(initialData?.name_ar || "");
    const [shortDescAr, setShortDescAr] = useState(initialData?.shortDesc_ar || "");
    const [descriptionAr, setDescriptionAr] = useState(initialData?.description_ar || "");
    const [compositionAr, setCompositionAr] = useState(initialData?.composition_ar || "");
    const [tabsAr, setTabsAr] = useState<Tab[]>(
        Array.isArray(initialData?.tabs_ar) ? (initialData?.tabs_ar as Tab[]) : []
    );
    const [metaTitleAr, setMetaTitleAr] = useState(initialData?.metaTitle_ar || "");
    const [metaDescAr, setMetaDescAr] = useState(initialData?.metaDesc_ar || "");

    // Common State
    const [image, setImage] = useState(initialData?.image || "");
    const [externalImage, setExternalImage] = useState(
        Array.isArray(initialData?.images)
            ? (initialData?.images.find((img) => img.alt === "external-card")?.url || "")
            : ""
    );
    // Slug is now handled automatically by the system
    const [slug] = useState(initialData?.slug || "");
    const [downloads, setDownloads] = useState<DownloadItem[]>(initialData?.downloads || []);
    const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
    const [isOrganic, setIsOrganic] = useState(initialData?.isOrganic || false);
    const [order, setOrder] = useState(initialData?.order || 0);
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [colorTheme, setColorTheme] = useState(initialData?.colorTheme || "blue");

    // UI State
    const [descTab, setDescTab] = useState<'en' | 'ar'>('en');
    const [tabsTab, setTabsTab] = useState<'en' | 'ar'>('en');

    // Auto-generate slug from name when name changes and slug hasn't been manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nameValue = e.target.value;
        setNameEn(nameValue);
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNameAr = e.target.value;
        setNameAr(newNameAr);
        if (errors.name_ar) {
            setErrors(prev => ({ ...prev, name_ar: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        
        if (!nameEn.trim()) newErrors.name = tValidation('nameRequired');
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validate()) {
            const firstError = Object.values(errors)[0];
            alert(firstError || "Please check the form for errors");
            return;
        }

        setIsPending(true);
        const formData = new FormData();

        // Common
        formData.append("slug", slug);
        if (categoryId) formData.append("categoryId", categoryId);
        if (image) formData.append("image", image);
        if (externalImage) formData.append("externalImage", externalImage);
        formData.append("isFeatured", String(isFeatured));
        formData.append("isOrganic", String(isOrganic));
        formData.append("order", String(order));
        formData.append("colorTheme", colorTheme);

        // English
        formData.append("name", nameEn);
        formData.append("shortDesc", shortDescEn);
        formData.append("description", description);
        formData.append("composition", composition);
        formData.append("metaTitle", metaTitleEn);
        formData.append("metaDesc", metaDescEn);
        formData.append("tabs", JSON.stringify(tabs));

        // Arabic
        formData.append("name_ar", nameAr);
        formData.append("shortDesc_ar", shortDescAr);
        formData.append("description_ar", descriptionAr);
        formData.append("composition_ar", compositionAr);
        formData.append("metaTitle_ar", metaTitleAr);
        formData.append("metaDesc_ar", metaDescAr);
        formData.append("tabs_ar", JSON.stringify(tabsAr));

        // Images (External Card)
        const imagesList = [];
        if (externalImage) {
            imagesList.push({ url: externalImage, alt: "external-card" });
        }
        formData.append("images", JSON.stringify(imagesList));

        // Downloads
        formData.append("downloads", JSON.stringify(downloads));

        try {
            if (initialData?.id) {
                await updateProduct(initialData.id, formData);
            } else {
                await createProduct(formData);
            }
            router.push(`/${locale}/admin/products`);
            router.refresh();
        } catch (error) {
            console.error("Error saving product:", error);
            alert(tCommon('errorOccurred'));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="pf-container space-y-8">
            {/* Action Bar */}
            <div className="pf-actions-bar">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="pf-btn pf-btn-secondary"
                >
                    <X className="w-4 h-4" />
                    {tCommon('cancel')}
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="pf-btn pf-btn-primary"
                >
                    {isPending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {initialData?.id ? tCommon('saveChanges') : tCommon('create')}
                </button>
            </div>

            {/* CARD 1: Basic Information */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <LayoutGrid className="w-5 h-5" />
                        {t('sections.basicInfo')}
                    </h2>
                </div>
                
                <div className="pf-grid pf-grid-2">
                    {/* English Name */}
                    <div>
                        <label className="pf-label flex items-center gap-2">
                            <span className="pf-badge-en">EN</span>
                            {t('fields.productName')}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={nameEn}
                            onChange={handleNameChange}
                            className={`pf-input ${errors.name ? 'border-red-300' : ''}`}
                            placeholder="Product Name"
                            dir="ltr"
                        />
                        {errors.name && <p className="pf-error-text">{errors.name}</p>}
                    </div>

                    {/* Arabic Name */}
                    <div>
                        <label className="pf-label flex items-center gap-2">
                            <span className="pf-badge-ar">AR</span>
                            {t('fields.productNameAr')}
                        </label>
                        <input
                            type="text"
                            value={nameAr}
                            onChange={handleNameArChange}
                            className="pf-input"
                            placeholder="اسم المنتج"
                            dir="rtl"
                        />
                    </div>

                    {/* Slug - HIDDEN - Auto Generated */}
                    {/* <div className="md:col-span-2">
                        <label className="pf-label flex items-center gap-2">
                            <Globe className="w-4 h-4 text-slate-400" />
                            {t('fields.slug')}
                            <span className="text-red-500">*</span>
                        </label>
                        <div className="flex rounded-lg shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-s-lg border border-e-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                                /product/
                            </span>
                            <input
                                type="text"
                                value={slug}
                                onChange={handleSlugChange}
                                className={`pf-input !rounded-s-none ${errors.slug ? 'border-red-300' : ''}`}
                            />
                        </div>
                        {errors.slug && <p className="pf-error-text">{errors.slug}</p>}
                    </div> */}

                    {/* Category */}
                    <div>
                        <label className="pf-label">{t('fields.category')}</label>
                        <select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="pf-select"
                        >
                            <option value="">{t('selectCategory')}</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {isArLocale ? (cat.name_ar || cat.name) : cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Order */}
                    <div>
                        <label className="pf-label">{t('fields.displayOrder')}</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(parseInt(e.target.value))}
                            className="pf-input"
                        />
                    </div>

                    {/* Color Theme */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="pf-label flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-400" />
                            {t('fields.colorTheme') || "Color Theme"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {[
                                { value: 'blue', label: 'Blue', color: '#3b82f6' },
                                { value: 'green', label: 'Green', color: '#10b981' },
                                { value: 'purple', label: 'Purple', color: '#8b5cf6' },
                                { value: 'orange', label: 'Orange', color: '#f59e0b' },
                                { value: 'red', label: 'Red', color: '#ef4444' },
                                { value: 'pink', label: 'Pink', color: '#ec4899' },
                                { value: 'primary', label: 'KINT Pink', color: '#e9496c' }, // Website Primary
                                { value: 'secondary', label: 'KINT Navy', color: '#142346' }, // Website Secondary
                                { value: 'dark', label: 'Dark', color: '#1e293b' },
                                { value: 'light', label: 'Light', color: '#f8fafc', border: true },
                            ].map((theme) => (
                                <button
                                    key={theme.value}
                                    type="button"
                                    onClick={() => setColorTheme(theme.value)}
                                    className={`
                                        relative flex items-center justify-start gap-2 p-2 rounded-lg border transition-all
                                        ${colorTheme === theme.value 
                                            ? 'border-slate-900 ring-1 ring-slate-900 bg-slate-50' 
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <span 
                                        className={`w-6 h-6 rounded-full shadow-sm shrink-0 ${theme.border ? 'border border-slate-200' : ''}`}
                                        style={{ backgroundColor: theme.color }}
                                    />
                                    <span className="text-sm font-medium text-slate-700 truncate">
                                        {theme.label}
                                    </span>
                                    {colorTheme === theme.value && (
                                        <div className="absolute top-1 right-1 w-2 h-2 bg-slate-900 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        <label className="pf-toggle-wrapper">
                            <input
                                type="checkbox"
                                checked={isFeatured}
                                onChange={(e) => setIsFeatured(e.target.checked)}
                                className="pf-toggle-checkbox"
                            />
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-amber-100 text-amber-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">{t('fields.featured')}</span>
                            </div>
                        </label>

                        <label className="pf-toggle-wrapper">
                            <input
                                type="checkbox"
                                checked={isOrganic}
                                onChange={(e) => setIsOrganic(e.target.checked)}
                                className="pf-toggle-checkbox"
                            />
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-full bg-green-100 text-green-600">
                                    <Leaf className="w-4 h-4" />
                                </div>
                                <span className="font-medium text-slate-700">{t('fields.organic')}</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* CARD 2: Description */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <FileText className="w-5 h-5" />
                        {t('sections.shortDescription')}
                    </h2>
                </div>
                <div className="pf-grid pf-grid-2 mb-8">
                    <div>
                        <label className="pf-label flex items-center gap-2">
                            <span className="pf-badge-en">EN</span>
                            English
                        </label>
                        <textarea
                            value={shortDescEn}
                            onChange={(e) => setShortDescEn(e.target.value)}
                            className="pf-textarea h-24 resize-none"
                            dir="ltr"
                        />
                    </div>
                    <div>
                        <label className="pf-label flex items-center gap-2">
                            <span className="pf-badge-ar">AR</span>
                            العربية
                        </label>
                        <textarea
                            value={shortDescAr}
                            onChange={(e) => setShortDescAr(e.target.value)}
                            className="pf-textarea h-24 resize-none"
                            dir="rtl"
                        />
                    </div>
                </div>

                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <FileText className="w-5 h-5" />
                        {t('sections.longDescription')}
                    </h2>
                    <div className="pf-lang-switch">
                        <button
                            type="button"
                            onClick={() => setDescTab('en')}
                            className={`pf-lang-btn ${descTab === 'en' ? 'active' : ''}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setDescTab('ar')}
                            className={`pf-lang-btn ar ${descTab === 'ar' ? 'active' : ''}`}
                        >
                            العربية
                        </button>
                    </div>
                </div>
                
                <div className={descTab === 'en' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={description}
                        onChange={setDescription}
                    />
                </div>
                <div className={descTab === 'ar' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={descriptionAr}
                        onChange={setDescriptionAr}
                        dir="rtl"
                    />
                </div>
            </div>

            {/* CARD 2.5: Composition */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <FileText className="w-5 h-5" />
                        {t('sections.compositionTable') || "Composition"}
                    </h2>
                    <div className="pf-lang-switch">
                        <button
                            type="button"
                            onClick={() => setDescTab('en')}
                            className={`pf-lang-btn ${descTab === 'en' ? 'active' : ''}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setDescTab('ar')}
                            className={`pf-lang-btn ar ${descTab === 'ar' ? 'active' : ''}`}
                        >
                            العربية
                        </button>
                    </div>
                </div>
                
                <div className={descTab === 'en' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={composition}
                        onChange={setComposition}
                    />
                </div>
                <div className={descTab === 'ar' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        value={compositionAr}
                        onChange={setCompositionAr}
                        dir="rtl"
                    />
                </div>
            </div>

            {/* CARD 3: Product Info Tabs (Features) */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <LayoutGrid className="w-5 h-5" />
                        {t('sections.features')}
                    </h2>
                    <div className="pf-lang-switch">
                        <button
                            type="button"
                            onClick={() => setTabsTab('en')}
                            className={`pf-lang-btn ${tabsTab === 'en' ? 'active' : ''}`}
                        >
                            English
                        </button>
                        <button
                            type="button"
                            onClick={() => setTabsTab('ar')}
                            className={`pf-lang-btn ar ${tabsTab === 'ar' ? 'active' : ''}`}
                        >
                            العربية
                        </button>
                    </div>
                </div>

                <div className={tabsTab === 'en' ? 'block' : 'hidden'}>
                    <TabsManager
                        initialData={tabs}
                        onChange={setTabs}
                    />
                </div>
                <div className={tabsTab === 'ar' ? 'block' : 'hidden'}>
                    <TabsManager
                        initialData={tabsAr}
                        onChange={setTabsAr}
                        dir="rtl"
                    />
                </div>
            </div>

            {/* CARD 4: Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Image */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <h2 className="pf-card-title">
                            <ImageIcon className="w-5 h-5" />
                            {t('sections.mainImage')}
                        </h2>
                    </div>
                    <ImageUpload
                        value={image}
                        onChange={setImage}
                    />
                    <p className="mt-4 pf-helper-text flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        {tCommon('recommendedSize')}
                    </p>
                </div>

                {/* External Card Image */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <h2 className="pf-card-title">
                            <ImageIcon className="w-5 h-5 text-amber-600" />
                            {t('sections.externalCardImage')}
                        </h2>
                    </div>
                    <ImageUpload
                        value={externalImage}
                        onChange={setExternalImage}
                    />
                    <p className="mt-4 pf-helper-text flex items-start gap-2 bg-slate-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                        {tCommon('externalCardNote')}
                    </p>
                </div>
            </div>

            {/* CARD 5: Downloads */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <Download className="w-5 h-5" />
                        {t('sections.downloads')}
                    </h2>
                </div>
                <DownloadsManager
                    initialData={downloads}
                    onChange={setDownloads}
                />
            </div>

            {/* CARD 6: SEO */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <h2 className="pf-card-title">
                        <Search className="w-5 h-5" />
                        {t('sections.seoSettings')}
                    </h2>
                </div>

                <div className="pf-grid pf-grid-2 gap-8">
                    {/* English SEO */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="pf-badge-en">EN</span>
                            English SEO
                        </h3>
                        
                        <div>
                            <label className="pf-label">{t('fields.metaTitle')}</label>
                            <input
                                type="text"
                                value={metaTitleEn}
                                onChange={(e) => setMetaTitleEn(e.target.value)}
                                className="pf-input"
                                placeholder="Meta Title"
                            />
                            <p className="pf-helper-text">Recommended length: 50-60 characters</p>
                        </div>

                        <div>
                            <label className="pf-label">{t('fields.metaDescription')}</label>
                            <textarea
                                value={metaDescEn}
                                onChange={(e) => setMetaDescEn(e.target.value)}
                                className="pf-textarea h-32 resize-none"
                                placeholder="Meta Description"
                            />
                            <p className="pf-helper-text">Recommended length: 150-160 characters</p>
                        </div>
                    </div>

                    {/* Arabic SEO */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                            <span className="pf-badge-ar">AR</span>
                            Arabic SEO
                        </h3>
                        
                        <div>
                            <label className="pf-label">{t('fields.metaTitleAr')}</label>
                            <input
                                type="text"
                                value={metaTitleAr}
                                onChange={(e) => setMetaTitleAr(e.target.value)}
                                className="pf-input"
                                placeholder="عنوان الميتا"
                                dir="rtl"
                            />
                        </div>

                        <div>
                            <label className="pf-label">{t('fields.metaDescriptionAr')}</label>
                            <textarea
                                value={metaDescAr}
                                onChange={(e) => setMetaDescAr(e.target.value)}
                                className="pf-textarea h-32 resize-none"
                                placeholder="وصف الميتا"
                                dir="rtl"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 7: Product Sections (Only in Edit Mode) - REMOVED per user request */}
            {initialData?.id && (
                <div className="pf-card">
                    <div className="pf-card-header">
                        <h2 className="pf-card-title">
                            <Layers className="w-5 h-5" />
                            {t('sections.productSections') || "Product Sections"}
                        </h2>
                    </div>
                    <ProductSectionsManager 
                        productId={initialData.id}
                        initialSections={initialSections}
                    />
                </div>
            )}
        </form>
    );
}
