"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createAnimalType, updateAnimalType } from "@/actions/animalTypeActions";
import ImageUpload from "./ImageUpload";
import FileUpload from "./FileUpload";
import { generateSlug } from "@/lib/slugUtils";
import StagesEditor from "./StagesEditor";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface IssueItem {
  id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
  isActive?: boolean;
  recommendation?: any;
}

interface InitialData {
  id?: string;
  name?: string;
  name_ar?: string;
  slug?: string;
  description?: string;
  description_ar?: string;
  imageUrl?: string;
  pdfUrl?: string;
  pdfUrl_ar?: string;
  documentTitle?: string;
  documentTitle_ar?: string;
  category?: string;
  category_ar?: string;
  metaTitle?: string;
  metaTitle_ar?: string;
  productIds?: string[];
  issues?: IssueItem[];
}

import { useTranslations } from "next-intl";

export default function AnimalTypeForm({ initialData, products = [] }: { initialData?: InitialData, products?: any[] }) {
  const t = useTranslations("AnimalTypeForm");
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [name, setName] = useState(initialData?.name || "");
  const [name_ar, setNameAr] = useState(initialData?.name_ar || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState(initialData?.description || "");
  const [description_ar, setDescriptionAr] = useState(initialData?.description_ar || "");
  const [descriptionTab, setDescriptionTab] = useState<'en' | 'ar'>('en');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
  const [pdfUrl_ar, setPdfUrlAr] = useState(initialData?.pdfUrl_ar || "");
  const [documentTitle, setDocumentTitle] = useState(initialData?.documentTitle || "");
  const [documentTitle_ar, setDocumentTitleAr] = useState(initialData?.documentTitle_ar || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaTitle_ar, setMetaTitleAr] = useState(initialData?.metaTitle_ar || "");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.productIds || []);
  const predefinedCategories = ["poultry", "cattle", "fish", "bees", "other"]; // Example categories, adjust as needed
  const isExistingInitialCategory = initialData?.category ? predefinedCategories.includes(initialData.category) : true;
  const [categoryMode, setCategoryMode] = useState<'existing' | 'new'>(isExistingInitialCategory ? 'existing' : 'new');
  const [selectedCategory, setSelectedCategory] = useState(
      isExistingInitialCategory ? (initialData?.category || "poultry") : "poultry"
  );
  const [newCategoryEn, setNewCategoryEn] = useState(isExistingInitialCategory ? "" : (initialData?.category || ""));
  const [newCategoryAr, setNewCategoryAr] = useState(isExistingInitialCategory ? "" : (initialData?.category_ar || ""));

  const storageKey = `${initialData?.id ? `animalType:${initialData.id}` : 'animalType:new'}:${isRtl ? 'ar' : 'en'}`;

  // Map issues to generic "stages" structure used by StagesEditor
  const initialStages = (initialData?.issues || []).map(i => ({
    id: i.id,
    name: i.title,
    name_ar: i.title_ar || "",
    description: i.description || "",
    description_ar: i.description_ar || "",
    products: i.recommendation?.products || []
  }));
  const [stages, setStages] = useState<any[]>(initialStages);
  
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return;
        const saved = JSON.parse(raw) as {
            description?: string;
            description_ar?: string;
            imageUrl?: string;
            pdfUrl?: string;
            pdfUrl_ar?: string;
            documentTitle?: string;
            documentTitle_ar?: string;
            slug?: string;
            selectedProducts?: string[];
            stages?: any[];
            selectedCategory?: string;
            newCategoryEn?: string;
            newCategoryAr?: string;
            categoryMode?: 'existing' | 'new';
        };
        setTimeout(() => {
            if (saved.description !== undefined) setDescription(prev => prev || saved.description || '');
            if (saved.description_ar !== undefined) setDescriptionAr(prev => prev || saved.description_ar || '');
            if (saved.imageUrl !== undefined) setImageUrl(prev => prev || saved.imageUrl || '');
            if (saved.pdfUrl !== undefined) setPdfUrl(prev => prev || saved.pdfUrl || '');
            if (saved.pdfUrl_ar !== undefined) setPdfUrlAr(prev => prev || saved.pdfUrl_ar || '');
            if (saved.documentTitle !== undefined) setDocumentTitle(prev => prev || saved.documentTitle || '');
            if (saved.documentTitle_ar !== undefined) setDocumentTitleAr(prev => prev || saved.documentTitle_ar || '');
            if (saved.slug !== undefined) setSlug(prev => prev || saved.slug || '');
            if (Array.isArray(saved.selectedProducts) && saved.selectedProducts.length) {
                setSelectedProducts(prev => prev.length ? prev : saved.selectedProducts as string[]);
            }
            if (Array.isArray(saved.stages) && saved.stages.length) {
                setStages(prev => prev.length ? prev : saved.stages as any[]);
            }
            if (saved.selectedCategory !== undefined) setSelectedCategory(prev => prev || saved.selectedCategory || '');
            if (saved.newCategoryEn !== undefined) setNewCategoryEn(prev => prev || saved.newCategoryEn || '');
            if (saved.newCategoryAr !== undefined) setNewCategoryAr(prev => prev || saved.newCategoryAr || '');
            if (saved.categoryMode !== undefined) setCategoryMode(prev => prev || saved.categoryMode!);
        }, 0);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try {
        const payload = JSON.stringify({
            description,
            description_ar,
            imageUrl,
            pdfUrl,
            pdfUrl_ar,
            documentTitle,
            documentTitle_ar,
            slug,
            selectedProducts,
            stages,
            selectedCategory,
            newCategoryEn,
            newCategoryAr,
            categoryMode,
        });
        localStorage.setItem(storageKey, payload);
    } catch {}
  }, [description, description_ar, imageUrl, pdfUrl, pdfUrl_ar, documentTitle, documentTitle_ar, slug, selectedProducts, stages, selectedCategory, newCategoryEn, newCategoryAr, categoryMode, storageKey]);

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

  const toggleProduct = (productId: string) => {
      setSelectedProducts(prev => 
          prev.includes(productId) 
          ? prev.filter(id => id !== productId) 
          : [...prev, productId]
      );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setIsPending(true);
 
     try {
       const payload: any = { 
         name, 
         name_ar, 
         slug, 
         description, 
         description_ar, 
         imageUrl, 
         pdfUrl,
         pdfUrl_ar,
         documentTitle,
         documentTitle_ar,
         metaTitle,
         metaTitle_ar,
         productIds: selectedProducts,
         issues: stages.map((s, idx) => ({
           id: s.id,
           title: s.name,
           title_ar: s.name_ar,
           description: s.description,
           description_ar: s.description_ar,
           order: idx,
           isActive: true,
           recommendation: { products: s.products }
         })),
         category: categoryMode === 'new' ? newCategoryEn.trim() : selectedCategory,
         category_ar: categoryMode === 'new' ? newCategoryAr.trim() : (initialData?.category_ar || "")
       };

       if (initialData?.id) {
         await updateAnimalType(initialData.id, payload);
       } else {
         await createAnimalType(payload);
       }
       router.push('/admin/animal-types');
       router.refresh();
       try {
           localStorage.removeItem(storageKey);
       } catch {}
     } catch (error) {
       console.error(error);
     } finally {
       setIsPending(false);
     }
   };

  return (
    <form onSubmit={onSubmit} className="card" style={{ padding: '2.5rem', maxWidth: '1000px', backgroundColor: 'white' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <div className="form-field">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('EnglishName')} <span style={{ color: 'red' }}>*</span></label>
          <input 
            value={name} 
            onChange={handleNameChange} 
            className={`input ${errors.name ? 'border-red-500' : ''}`} 
            style={{ width: '100%' }}
            placeholder={t('animalNamePlaceholder')}
          />
          {errors.name && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</p>}
        </div>
        <div className="form-field" dir="rtl">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>{t('ArabicName')} <span style={{ color: 'red' }}>*</span></label>
          <input 
            value={name_ar} 
            onChange={handleNameArChange} 
            className={`input ${errors.name_ar ? 'border-red-500' : ''}`} 
            style={{ width: '100%' }}
            placeholder={t('animalNameArPlaceholder')}
          />
          {errors.name_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name_ar}</p>}
        </div>
      </div>
      <input type="hidden" name="slug" value={slug} />

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
                {predefinedCategories.map(cat => (
                    <option key={cat} value={cat}>{t(cat)}</option>
                ))}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
                {t('MetaTitleEn')}
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
                {t('MetaTitleAr')}
            </label>
            <input 
                value={metaTitle_ar}
                onChange={(e) => setMetaTitleAr(e.target.value)}
                className="input"
                style={{ width: '100%' }}
                placeholder={t('metaTitleArPlaceholder')}
            />
        </div>
      </div>

      <div className="form-field">
        <ImageUpload
          label={t('ImageOrIcon')}
          value={imageUrl}
          onChange={setImageUrl}
        />
      </div>

      {/* PDF & Document Fields */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        <div className="form-field">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
            {t('DocumentTitleEn')}
          </label>
          <input 
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="input"
            style={{ width: '100%' }}
            placeholder={t('documentTitlePlaceholder')}
          />
        </div>
        <div className="form-field" dir="rtl">
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.9rem' }}>
            {t('DocumentTitleAr')}
          </label>
          <input 
            value={documentTitle_ar}
            onChange={(e) => setDocumentTitleAr(e.target.value)}
            className="input"
            style={{ width: '100%' }}
            placeholder={t('documentTitleArPlaceholder')}
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
          {descriptionTab === 'en' && (
              <RichTextEditor 
                  value={description} 
                  onChange={setDescription} 
              />
          )}
          {descriptionTab === 'ar' && (
              <RichTextEditor 
                  value={description_ar} 
                  onChange={setDescriptionAr} 
                  dir="rtl"
              />
          )}
      </div>

      <div className="form-section">
        <h3 className="form-section-title">{t('MostCommonIssues')}</h3>
        <p className="form-section-description">{t('IssuesDescription')}</p>

        <StagesEditor 
          initialData={stages}
          products={products}
          onChange={setStages}
          labels={{
            sectionTitle: t('MostCommonIssues'),
            itemNameEn: t('IssueNameEn'),
            itemNameAr: t('IssueNameAr'),
            itemDescriptionEn: t('IssueDescriptionEn'),
            itemDescriptionAr: t('IssueDescriptionAr'),
            addItem: t('AddIssue'),
            recommendedProducts: t('RecommendedProductsForIssue')
          }}
        />
      </div>

      <div style={{ marginBottom: '2.5rem' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '1.1rem' }}>
            {t('GeneralRecommendedProducts')}
          </label>
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
              {products?.map(product => (
                  <label key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                      <input 
                          type="checkbox" 
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                          style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                      />
                      {isRtl && product.name_ar ? product.name_ar : product.name}
                  </label>
              ))}
          </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>{initialData?.id ? t('UpdateButton') : t('CreateButton')}</button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>{t('CancelButton')}</button>
      </div>
    </form>
  );
}
