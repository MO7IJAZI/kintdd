"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { createAnimalType, updateAnimalType } from "@/actions/animalTypeActions";
import ImageUpload from "./ImageUpload";
import { generateSlug } from "@/lib/slugUtils";

interface IssueItem {
  id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
  isActive?: boolean;
}

interface TabImageItem {
  id?: string;
  imageUrl: string;
  title?: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
}

interface TabItem {
  id?: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  order?: number;
  images: TabImageItem[];
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
  order?: number;
  issues?: IssueItem[];
  tabs?: TabItem[];
}

import { useTranslations } from "next-intl";

export default function AnimalTypeForm({ initialData }: { initialData?: InitialData }) {
  const t = useTranslations("AnimalTypeForm");
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [name, setName] = useState(initialData?.name || "");
  const [name_ar, setNameAr] = useState(initialData?.name_ar || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [description_ar, setDescriptionAr] = useState(initialData?.description_ar || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || initialData?.icon || "");
  const [order, setOrder] = useState(initialData?.order || 0);
  const [issues, setIssues] = useState<IssueItem[]>(initialData?.issues || []);
  const [tabs, setTabs] = useState<TabItem[]>(initialData?.tabs || []);
  const [isPending, setIsPending] = useState(false);
  const [openTab, setOpenTab] = useState<number | null>(null);

  useEffect(() => {
    if (!slug && name) setSlug(generateSlug(name));
  }, [name, slug]);

  // --- Issues Handlers ---
  const addIssue = () => {
    setIssues(prev => [...prev, { title: "", title_ar: "", description: "", description_ar: "", order: prev.length }]);
  };

  const updateIssue = (idx: number, patch: Partial<IssueItem>) => {
    setIssues(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  const removeIssue = (idx: number) => {
    setIssues(prev => prev.filter((_, i) => i !== idx));
  };

  // --- Tabs Handlers ---
  const addTab = () => setTabs(prev => [...prev, { title: "", order: prev.length, images: [] }]);
  const updateTab = (tabIdx: number, patch: Partial<TabItem>) => setTabs(prev => prev.map((tab, i) => i === tabIdx ? { ...tab, ...patch } : tab));
  const removeTab = (tabIdx: number) => setTabs(prev => prev.filter((_, i) => i !== tabIdx));

  // --- Tab Images Handlers ---
  const addImage = (tabIdx: number) => {
    const newImage: TabImageItem = { imageUrl: "", order: tabs[tabIdx].images.length };
    const newTabs = [...tabs];
    newTabs[tabIdx].images.push(newImage);
    setTabs(newTabs);
  };
  const updateImage = (tabIdx: number, imgIdx: number, patch: Partial<TabImageItem>) => {
    const newTabs = [...tabs];
    newTabs[tabIdx].images[imgIdx] = { ...newTabs[tabIdx].images[imgIdx], ...patch };
    setTabs(newTabs);
  };
  const removeImage = (tabIdx: number, imgIdx: number) => {
    const newTabs = [...tabs];
    newTabs[tabIdx].images = newTabs[tabIdx].images.filter((_, i) => i !== imgIdx);
    setTabs(newTabs);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const payload = { name, name_ar, slug, description, description_ar, imageUrl, order, issues, tabs };
      if (initialData?.id) {
        await updateAnimalType(initialData.id, payload);
      } else {
        await createAnimalType(payload);
      }
      router.push("/admin/animal-types");
      router.refresh(); // Add this line
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="form-grid">
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('EnglishName')}</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input" required />
        </div>
        <div className="form-field">
          <label>{t('ArabicName')}</label>
          <input value={name_ar} onChange={e => setNameAr(e.target.value)} className="input" dir="rtl" />
        </div>
      </div>
      <div className="form-group-grid">
        <div className="form-field">
          <label>{t('Slug')}</label>
          <input value={slug} onChange={e => setSlug(e.target.value)} className="input" required />
        </div>
        <div className="form-field">
          <label>{t('Order')}</label>
          <input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value || '0'))} className="input" />
        </div>
      </div>
      <div className="form-field">
        <ImageUpload
          label={t('ImageOrIcon')}
          value={imageUrl}
          onChange={setImageUrl}
        />
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

        <div className="issues-grid">
          {issues.map((issue, idx) => (
            <div key={idx} className="card issue-card">
              <div className="form-group-grid">
                <div className="form-field">
                  <label>{t('TitleEN')}</label>
                  <input value={issue.title} onChange={e => updateIssue(idx, { title: e.target.value })} className="input" required />
                </div>
                <div className="form-field">
                  <label>{t('TitleAR')}</label>
                  <input value={issue.title_ar || ''} onChange={e => updateIssue(idx, { title_ar: e.target.value })} className="input" dir="rtl" />
                </div>
              </div>
              <div className="form-group-grid">
                <div className="form-field">
                  <label>{t('DescriptionEN')}</label>
                  <textarea value={issue.description || ''} onChange={e => updateIssue(idx, { description: e.target.value })} rows={3} className="input" />
                </div>
                <div className="form-field">
                  <label>{t('DescriptionAR')}</label>
                  <textarea value={issue.description_ar || ''} onChange={e => updateIssue(idx, { description_ar: e.target.value })} rows={3} className="input" dir="rtl" />
                </div>
              </div>
              <div className="issue-actions">
                <label>{t('Order')}</label>
                <input type="number" value={issue.order ?? idx} onChange={e => updateIssue(idx, { order: parseInt(e.target.value || '0') })} className="input issue-order-input" />
                <label className="checkbox-label">{t('Active')}</label>
                <input type="checkbox" checked={issue.isActive ?? true} onChange={e => updateIssue(idx, { isActive: e.target.checked })} />
                <button type="button" onClick={() => removeIssue(idx)} className="btn btn-outline btn-danger">{t('RemoveIssue')}</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addIssue} className="btn btn-secondary">{t('AddIssue')}</button>
        </div>
      </div>

      {/* --- Tabs Section --- */}
      <div className="form-section">
        <h3 className="form-section-title">{t('Tabs')}</h3>
        <p className="form-section-description">{t('TabsDescription')}</p>
        <div className="tabs-grid">
          {tabs.map((tab, tabIdx) => (
            <div key={tab.id || tabIdx} className="tab-card">
              <div className="tab-header" onClick={() => setOpenTab(openTab === tabIdx ? null : tabIdx)}>
                <h4>{t('Tab')} #{tabIdx + 1}: {tab.title || `(${t('NewTab')})`}</h4>
                <div className="tab-toggle-icon" style={{ transform: openTab === tabIdx ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
              {openTab === tabIdx && (
                <div className="tab-content">
                  <div className="form-group-grid">
                    <div className="form-field"><label>{t('TitleEN')}</label><input value={tab.title} onChange={e => updateTab(tabIdx, { title: e.target.value })} className="input" required /></div>
                    <div className="form-field"><label>{t('TitleAR')}</label><input value={tab.title_ar || ''} onChange={e => updateTab(tabIdx, { title_ar: e.target.value })} className="input" dir="rtl" /></div>
                  </div>
                  <div className="form-group-grid">
                    <div className="form-field"><label>{t('DescriptionEN')}</label><textarea value={tab.description || ''} onChange={e => updateTab(tabIdx, { description: e.target.value })} rows={3} className="input" /></div>
                    <div className="form-field"><label>{t('DescriptionAR')}</label><textarea value={tab.description_ar || ''} onChange={e => updateTab(tabIdx, { description_ar: e.target.value })} rows={3} className="input" dir="rtl" /></div>
                  </div>
                  <div className="form-field"><label>{t('Order')}</label><input type="number" value={tab.order ?? tabIdx} onChange={e => updateTab(tabIdx, { order: parseInt(e.target.value || '0') })} className="input issue-order-input" /></div>
                  
                  {/* --- Images Slider Section --- */}
                  <div className="form-section">
                    <h5 className="form-section-title">{t('ImagesSlider')}</h5>
                    {tab.images.map((image, imgIdx) => (
                      <div key={image.id || imgIdx} className="card image-card">
                        <ImageUpload label={t('Image')} value={image.imageUrl} onChange={val => updateImage(tabIdx, imgIdx, { imageUrl: val })} />
                        <div className="form-group-grid">
                          <div className="form-field"><label>{t('TitleEN')}</label><input value={image.title || ''} onChange={e => updateImage(tabIdx, imgIdx, { title: e.target.value })} className="input" /></div>
                          <div className="form-field"><label>{t('TitleAR')}</label><input value={image.title_ar || ''} onChange={e => updateImage(tabIdx, imgIdx, { title_ar: e.target.value })} className="input" dir="rtl" /></div>
                        </div>
                        <div className="form-group-grid">
                          <div className="form-field"><label>{t('DescriptionEN')}</label><textarea value={image.description || ''} onChange={e => updateImage(tabIdx, imgIdx, { description: e.target.value })} rows={2} className="input" /></div>
                          <div className="form-field"><label>{t('DescriptionAR')}</label><textarea value={image.description_ar || ''} onChange={e => updateImage(tabIdx, imgIdx, { description_ar: e.target.value })} rows={2} className="input" dir="rtl" /></div>
                        </div>
                        <div className="issue-actions">
                          <label>{t('Order')}</label>
                          <input type="number" value={image.order ?? imgIdx} onChange={e => updateImage(tabIdx, imgIdx, { order: parseInt(e.target.value || '0') })} className="input issue-order-input" />
                          <button type="button" onClick={() => removeImage(tabIdx, imgIdx)} className="btn btn-outline btn-danger">{t('RemoveImage')}</button>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={() => addImage(tabIdx)} className="btn btn-secondary">{t('AddImage')}</button>
                  </div>
                  <button type="button" onClick={() => removeTab(tabIdx)} className="btn btn-outline btn-danger">{t('RemoveTab')}</button>
                </div>
              )}
            </div>
          ))}
          <button type="button" onClick={addTab} className="btn btn-secondary">{t('AddTab')}</button>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isPending}>{initialData?.id ? t('UpdateButton') : t('CreateButton')}</button>
        <button type="button" className="btn btn-outline" onClick={() => router.back()}>{t('CancelButton')}</button>
      </div>
    </form>
  );
}
