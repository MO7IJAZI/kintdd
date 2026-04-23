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
  icon?: string;
  pdfUrl?: string;
  pdfUrl_ar?: string;
  documentTitle?: string;
  documentTitle_ar?: string;
  category?: string;
  category_ar?: string;
  productionSeason_ar?: string;
  metaTitle?: string;
  metaTitle_ar?: string;
  products?: any[];
  order?: number;
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
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || initialData?.icon || "");
  const [pdfUrl, setPdfUrl] = useState(initialData?.pdfUrl || "");
  const [pdfUrl_ar, setPdfUrlAr] = useState(initialData?.pdfUrl_ar || "");
  const [documentTitle, setDocumentTitle] = useState(initialData?.documentTitle || "");
  const [documentTitle_ar, setDocumentTitleAr] = useState(initialData?.documentTitle_ar || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [category_ar, setCategoryAr] = useState(initialData?.category_ar || "");
  const [productionSeason_ar, setProductionSeasonAr] = useState(initialData?.productionSeason_ar || "");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaTitle_ar, setMetaTitleAr] = useState(initialData?.metaTitle_ar || "");
  const [selectedProducts, setSelectedProducts] = useState<string[]>(initialData?.products?.map(p => p.id) || []);
  const [order, setOrder] = useState(initialData?.order || 0);
  
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

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited && !initialData?.id) {
      setSlug(generateSlug(val));
    }
    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
  };

  const handleNameArChange = (val: string) => {
    setNameAr(val);
    if (errors.name_ar) setErrors(prev => ({ ...prev, name_ar: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('nameRequired') || "Name is required";
    if (!name_ar.trim()) newErrors.name_ar = t('nameArRequired') || "Arabic name is required";
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
       const payload = { 
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
         category,
         category_ar,
         productionSeason_ar,
         metaTitle,
         metaTitle_ar,
         productIds: selectedProducts,
         order, 
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
       };
       if (initialData?.id) {
         await updateAnimalType(initialData.id, payload);
       } else {
         await createAnimalType(payload);
       }
       router.push('/admin/animal-types');
       router.refresh();
     } catch (error) {
       console.error(error);
     } finally {
       setIsPending(false);
     }
   };

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('EnglishName')} <span style={{ color: 'red' }}>*</span></label>
          <input 
            value={name} 
            onChange={e => handleNameChange(e.target.value)} 
            className={`input ${errors.name ? 'border-red-500' : ''}`} 
          />
          {errors.name && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name}</p>}
        </div>
        <div className="form-field" dir="rtl">
          <label>{t('ArabicName')} <span style={{ color: 'red' }}>*</span></label>
          <input 
            value={name_ar} 
            onChange={e => handleNameArChange(e.target.value)} 
            className={`input ${errors.name_ar ? 'border-red-500' : ''}`} 
          />
          {errors.name_ar && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.name_ar}</p>}
        </div>
      </div>
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('Order') || 'Order'}</label>
          <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value || '0'))} className="input" />
        </div>
        <div className="form-field">
            <label>{t('CategoryEn')}</label>
            <input 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input"
                placeholder="e.g. Poultry, Cattle"
            />
        </div>
        <div className="form-field" dir="rtl">
            <label>{t('CategoryAr')}</label>
            <input 
                value={category_ar}
                onChange={(e) => setCategoryAr(e.target.value)}
                className="input"
                placeholder="مثال: الدواجن، المواشي"
            />
        </div>
      </div>

      <div className="form-group-grid">
        <div className="form-field">
            <label>{t('MetaTitleEn')}</label>
            <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="input" placeholder="Meta title..." />
        </div>
        <div className="form-field" dir="rtl">
            <label>{t('MetaTitleAr')}</label>
            <input value={metaTitle_ar} onChange={e => setMetaTitleAr(e.target.value)} className="input" placeholder="عنوان الميتا..." />
        </div>
      </div>

      <div className="form-group-grid">
        <div className="form-field" dir="rtl">
            <label>{t('ProductionSeason')}</label>
            <input value={productionSeason_ar} onChange={e => setProductionSeasonAr(e.target.value)} className="input" placeholder="مثال: طوال العام" />
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
      <div className="form-group-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        <FileUpload
          label={`PDF (English)`}
          value={pdfUrl}
          onChange={setPdfUrl}
        />
        <FileUpload
          label={`PDF (العربية)`}
          value={pdfUrl_ar}
          onChange={setPdfUrlAr}
        />
      </div>
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('DocumentTitleEn')}</label>
          <input value={documentTitle} onChange={e => setDocumentTitle(e.target.value)} className="input" placeholder="e.g. Poultry Nutrition Guide" />
        </div>
        <div className="form-field" dir="rtl">
          <label>{t('DocumentTitleAr')}</label>
          <input value={documentTitle_ar} onChange={e => setDocumentTitleAr(e.target.value)} className="input" placeholder="مثال: دليل تغذية الدواجن" />
        </div>
      </div>
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('MetaTitleEn')}</label>
          <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="input" placeholder="SEO title in English" />
        </div>
        <div className="form-field" dir="rtl">
          <label>{t('MetaTitleAr')}</label>
          <input value={metaTitle_ar} onChange={e => setMetaTitleAr(e.target.value)} className="input" placeholder="عنوان SEO بالعربي" />
        </div>
        <div className="form-field" dir="rtl">
          <label>{t('ProductionSeason')}</label>
          <input value={productionSeason_ar} onChange={e => setProductionSeasonAr(e.target.value)} className="input" placeholder="مثال: طوال العام، الشتاء..." />
        </div>
      </div>

      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('DescriptionEN')}</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input" />
        </div>
        <div className="form-field">
          <label>{t('DescriptionAR')}</label>
          <textarea value={description_ar} onChange={e => setDescriptionAr(e.target.value)} rows={3} className="input" dir="rtl" />
        </div>
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
