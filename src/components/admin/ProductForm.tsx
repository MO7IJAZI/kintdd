"use client";

import { useRef, useState } from "react";
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
    Leaf
} from "lucide-react";

// Dynamic imports for heavy components
const ImageUpload = dynamic(() => import("./ImageUpload"), { ssr: false });
const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });
const DownloadsManager = dynamic(() => import("./DownloadsManager"), { ssr: false });
const TabsManager = dynamic(() => import("./TabsManager"), { ssr: false });


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
    const isArLocale = locale === "ar";

    const [isPending, setIsPending] = useState(false);
    
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
    const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
    const [sku, setSku] = useState(initialData?.sku || "");
    const [colorTheme, setColorTheme] = useState(initialData?.colorTheme || "blue");

    // Tab states for Description and Tabs
    const [descTab, setDescTab] = useState<'en' | 'ar'>('en');
    const [tabsTab, setTabsTab] = useState<'en' | 'ar'>('en');

    // Auto-generate slug from name when name changes and slug hasn't been manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nameValue = e.target.value;
        setNameEn(nameValue);
        if (!slugEdited && !initialData?.id) {
            setSlug(generateAutoSlug(nameValue, nameAr, 'en'));
        }
    };

    const handleNameArChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNameAr = e.target.value;
        setNameAr(newNameAr);
        if (!slugEdited && !initialData?.id && locale === 'ar') {
            const nameValue = nameEn;
            setSlug(generateAutoSlug(nameValue, newNameAr, 'ar'));
        }
    };

    // Allow manual slug editing
    const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSlugEdited(true);
        setSlug(generateSlug(e.target.value));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        // Explicitly set controlled values
        formData.set("name", nameEn);
        formData.set("name_ar", nameAr);
        formData.set("shortDesc", shortDescEn);
        formData.set("shortDesc_ar", shortDescAr);
        formData.set("description", description);
        formData.set("description_ar", descriptionAr);
        formData.set("image", image);
        formData.set("slug", slug);
        formData.set("categoryId", categoryId);
        formData.set("sku", sku);
        formData.set("isFeatured", String(isFeatured));
        formData.set("isOrganic", String(isOrganic));
        formData.set("order", String(order));
        formData.set("colorTheme", colorTheme);
        formData.set("metaTitle", metaTitleEn);
        formData.set("metaTitle_ar", metaTitleAr);
        formData.set("metaDesc", metaDescEn);
        formData.set("metaDesc_ar", metaDescAr);
        
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
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2.5rem', maxWidth: '1200px', backgroundColor: 'white', margin: '0 auto' }}>
            <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-900">
                    {initialData?.id ? t('update') : t('create')}
                </h1>
                <div className="flex gap-2">
                    <button type="submit" disabled={isPending} className="btn btn-primary px-6">
                        {isPending ? t('processing') : t('saveChanges')}
                    </button>
                    <button type="button" onClick={() => router.back()} className="btn btn-outline px-6">
                        {tCommon('cancel')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('productName')} (EN) <span className="text-red-500">*</span>
                    </label>
                    <input 
                        name="name" 
                        value={nameEn} 
                        onChange={handleNameChange} 
                        required 
                        className="input w-full"
                        placeholder="e.g., Premium Tomato Seeds"
                    />
                </div>
                <div dir="rtl">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('productName')} (AR)
                    </label>
                    <input 
                        name="name_ar" 
                        value={nameAr} 
                        onChange={handleNameArChange} 
                        className="input w-full"
                        placeholder="اسم المنتج بالعربية"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('slug')}
                    </label>
                    <input 
                        value={slug} 
                        onChange={handleSlugChange} 
                        className="input w-full font-mono text-sm"
                        placeholder="url-friendly-slug" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('category')} <span className="text-red-500">*</span>
                    </label>
                    <select 
                        name="categoryId" 
                        value={categoryId} 
                        onChange={(e) => setCategoryId(e.target.value)}
                        required 
                        className="input w-full"
                    >
                        <option value="">{t('selectCategory')}</option>
                        {categories.map((c) => {
                            const label = isArLocale ? (c.name_ar || c.name) : c.name;
                            let fullPath = label;
                            if (c.parent) {
                                const parentLabel = isArLocale ? (c.parent.name_ar || c.parent.name) : c.parent.name;
                                fullPath = `${parentLabel} / ${label}`;
                            }
                            return (
                                <option key={c.id} value={c.id}>
                                    {fullPath}
                                </option>
                            );
                        })}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('sku')}
                    </label>
                    <input 
                        name="sku" 
                        value={sku} 
                        onChange={(e) => setSku(e.target.value)}
                        className="input w-full"
                        placeholder="PROD-001"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('displayOrder')}
                    </label>
                    <input 
                        type="number" 
                        value={order} 
                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)} 
                        className="input w-full"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('colorTheme')}
                    </label>
                    <select
                        value={colorTheme}
                        onChange={(e) => setColorTheme(e.target.value)}
                        className="input w-full"
                    >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="pink">Pink</option>
                        <option value="slate">Slate</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('summary')} (EN)
                    </label>
                    <textarea
                        name="shortDesc"
                        value={shortDescEn}
                        onChange={(e) => setShortDescEn(e.target.value)}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="Brief summary..."
                    />
                </div>
                <div dir="rtl">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                        {t('summary')} (AR)
                    </label>
                    <textarea
                        name="shortDesc_ar"
                        value={shortDescAr}
                        onChange={(e) => setShortDescAr(e.target.value)}
                        rows={3}
                        className="input w-full resize-none"
                        placeholder="وصف مختصر..."
                    />
                </div>
            </div>

            <div className="mb-8">
                <ImageUpload
                    label={t('image')}
                    value={image}
                    onChange={setImage}
                />
            </div>

            <div className="flex gap-8 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isFeatured} 
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 accent-primary"
                    />
                    <span className="font-bold text-slate-700">{t('showOnHomepage')}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={isOrganic} 
                        onChange={(e) => setIsOrganic(e.target.checked)}
                        className="w-5 h-5 accent-green-600"
                    />
                    <span className="font-bold text-slate-700">{t('certifiedOrganic')}</span>
                </label>
            </div>

            {/* Description Section with Tabs */}
            <div className="mb-8">
                <div className="flex gap-1 mb-2 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setDescTab('en')}
                        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
                            descTab === 'en' 
                                ? 'bg-slate-100 text-slate-900 border-t border-x border-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {t('descriptionEn')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setDescTab('ar')}
                        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
                            descTab === 'ar' 
                                ? 'bg-slate-100 text-slate-900 border-t border-x border-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {t('descriptionAr')}
                    </button>
                </div>
                
                <div className={descTab === 'en' ? 'block' : 'hidden'}>
                    <RichTextEditor
                        label=""
                        value={description}
                        onChange={setDescription}
                    />
                </div>
                <div className={descTab === 'ar' ? 'block' : 'hidden'} dir="rtl">
                    <RichTextEditor
                        label=""
                        value={descriptionAr}
                        onChange={setDescriptionAr}
                        dir="rtl"
                    />
                </div>
            </div>

            {/* Tabs Manager Section with Tabs */}
            <div className="mb-8">
                <div className="flex gap-1 mb-2 border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setTabsTab('en')}
                        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
                            tabsTab === 'en' 
                                ? 'bg-slate-100 text-slate-900 border-t border-x border-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        Additional Tabs (EN)
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabsTab('ar')}
                        className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${
                            tabsTab === 'ar' 
                                ? 'bg-slate-100 text-slate-900 border-t border-x border-slate-200' 
                                : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        Additional Tabs (AR)
                    </button>
                </div>
                
                <div className={tabsTab === 'en' ? 'block' : 'hidden'}>
                    <TabsManager initialData={tabs} onChange={setTabs} />
                </div>
                <div className={tabsTab === 'ar' ? 'block' : 'hidden'} dir="rtl">
                    <TabsManager initialData={tabsAr} onChange={setTabsAr} dir="rtl" />
                </div>
            </div>

            <div className="mb-8 border-t border-slate-200 pt-8">
                <DownloadsManager 
                    initialData={downloads}
                    onChange={setDownloads}
                />
            </div>



            <div className="mb-8 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">{t('seo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                {t('metaTitle')} (EN)
                            </label>
                            <input 
                                name="metaTitle" 
                                value={metaTitleEn} 
                                onChange={(e) => setMetaTitleEn(e.target.value)} 
                                className="input w-full"
                                placeholder="SEO Title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                {t('metaDesc')} (EN)
                            </label>
                            <textarea 
                                name="metaDesc" 
                                value={metaDescEn} 
                                onChange={(e) => setMetaDescEn(e.target.value)} 
                                rows={3} 
                                className="input w-full resize-none"
                                placeholder="SEO Description"
                            />
                        </div>
                    </div>
                    <div className="space-y-4" dir="rtl">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                {t('metaTitle')} (AR)
                            </label>
                            <input 
                                name="metaTitle_ar" 
                                value={metaTitleAr} 
                                onChange={(e) => setMetaTitleAr(e.target.value)} 
                                className="input w-full"
                                placeholder="عنوان SEO"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                {t('metaDesc')} (AR)
                            </label>
                            <textarea 
                                name="metaDesc_ar" 
                                value={metaDescAr} 
                                onChange={(e) => setMetaDescAr(e.target.value)} 
                                rows={3} 
                                className="input w-full resize-none"
                                placeholder="وصف SEO"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-slate-200 pt-8">
                <button type="button" onClick={() => router.back()} className="btn btn-outline px-8 py-3">
                    {tCommon('cancel')}
                </button>
                <button type="submit" disabled={isPending} className="btn btn-primary px-8 py-3">
                    {isPending ? t('processing') : t('saveChanges')}
                </button>
            </div>
        </form>
    );
}
