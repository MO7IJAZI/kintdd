"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';
import { createCrop, updateCrop } from "@/actions/cropActions";
import { useRouter } from "next/navigation";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";
import StagesEditor from "./StagesEditor";
import { generateSlug } from "@/lib/slugUtils";

interface CropProduct {
    id: string;
    name: string;
}

interface CropStageData {
    name: string;
    name_ar?: string;
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
    description?: string | null;
    description_ar?: string | null;
    harvestSeason_ar?: string | null;
    image?: string | null;
    pdfUrl?: string | null;
    metaTitle?: string | null;
    metaTitle_ar?: string | null;
    recommendedProducts?: CropRecommendedProduct[];
    stages?: CropStageData[];
}

interface StageFormData {
    name: string;
    name_ar?: string;
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
    const [isPending, setIsPending] = useState(false);
    const [description, setDescription] = useState(initialData?.description || "");
    const [description_ar, setDescriptionAr] = useState(initialData?.description_ar || "");
    const [image, setImage] = useState(initialData?.image || "");
    const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
    const [slug, setSlug] = useState(initialData?.slug || "");
    const [slugEdited, setSlugEdited] = useState(false);
    
    // Legacy simple product selection (might be redundant if stages are used, but good to keep for general recommendations)
    const [selectedProducts, setSelectedProducts] = useState<string[]>(
        initialData?.recommendedProducts?.map((p) => p.id) || []
    );

    // Stages
    const [stages, setStages] = useState<StageFormData[]>(
        initialData?.stages?.map((s) => ({
            name: s.name,
            name_ar: s.name_ar || "",
            description_ar: s.description_ar || "",
            products: s.recommendation?.products || []
        })) || []
    );

    // Auto-generate slug from name when name changes and slug hasn't been manually edited
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!slugEdited && !initialData?.id) {
            setSlug(generateSlug(e.target.value));
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
        formData.set("description", description);
        formData.set("description_ar", description_ar);
        formData.set("image", image);
        formData.set("pdfUrl", pdfUrl);
        formData.set("slug", slug);
        formData.set("productIds", JSON.stringify(selectedProducts));
        formData.set("stages", JSON.stringify(stages));

        if (initialData?.id) {
            await updateCrop(initialData.id, formData);
        } else {
            await createCrop(formData);
        }

        setIsPending(false);
        router.push("/admin/crops");
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('cropNameEn')}</label>
                    <input name="name" defaultValue={initialData?.name} onChange={handleNameChange} required className="input" style={{ width: '100%' }} placeholder={t('cropNamePlaceholder')} />
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('cropNameAr')}</label>
                    <input name="name_ar" defaultValue={initialData?.name_ar || ''} className="input" style={{ width: '100%' }} placeholder={t('cropNameArPlaceholder')} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('slug')}</label>
                    <input value={slug} onChange={handleSlugChange} required className="input" style={{ width: '100%' }} placeholder="url-friendly-slug" />
                    <input type="hidden" name="slug" value={slug} />
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('harvestSeasonAr')}</label>
                    <input name="harvestSeason_ar" defaultValue={initialData?.harvestSeason_ar || ''} className="input" style={{ width: '100%' }} placeholder={t('harvestSeasonArPlaceholder')} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('categoryEn')}</label>
                    <select name="metaTitle" defaultValue={initialData?.metaTitle || "Arable Crops"} className="input" style={{ width: '100%' }}>
                        <option value="Arable Crops">{t('arableCrops')}</option>
                        <option value="Vegetable Crops">{t('vegetableCrops')}</option>
                        <option value="Fruit Crops">{t('fruitCrops')}</option>
                    </select>
                </div>
                <div dir="rtl">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('metaTitleAr')}</label>
                    <input name="metaTitle_ar" defaultValue={initialData?.metaTitle_ar || ''} className="input" style={{ width: '100%' }} placeholder={t('metaTitleArPlaceholder')} />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <ImageUpload
                    label={t('image')}
                    value={image}
                    onChange={setImage}
                />
                <FileUpload
                    label={t('pdf')}
                    value={pdfUrl}
                    onChange={setPdfUrl}
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <RichTextEditor
                        label={t('descriptionEn')}
                        value={description}
                        onChange={setDescription}
                    />
                    <div dir="rtl">
                        <RichTextEditor
                            label={t('descriptionAr')}
                            value={description_ar}
                            onChange={setDescriptionAr}
                        />
                    </div>
                </div>
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
