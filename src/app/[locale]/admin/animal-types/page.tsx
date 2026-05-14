'use client';

import React from 'react';
import { Link } from "@/navigation";
import { useLocale, useTranslations } from 'next-intl';
import { deleteAnimalType } from "@/actions/animalTypeActions";

interface AnimalType {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  category?: string | null;
  category_ar?: string | null;
  _count: {
    issues: number;
  };
}

export default function AnimalTypesAdminPage() {
  const t = useTranslations('Product');
  const tCommon = useTranslations('AdminCommon');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [items, setItems] = React.useState<AnimalType[]>([]);
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState('');

  const fetchData = async () => {
    const response = await fetch('/api/animal-types');
    const data = await response.json();
    setItems(data);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm(tCommon('confirmDelete') || "Are you sure you want to delete this?")) {
      try {
        await deleteAnimalType(id);
        fetchData();
      } catch (error) {
        console.error("Failed to delete", error);
      }
    }
  };

  const categoryOptions = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const it of items) {
      const value = (it.category || it.category_ar || '').trim();
      if (!value) continue;
      const label = isAr ? (it.category_ar || it.category || value) : (it.category || it.category_ar || value);
      if (!map.has(value)) map.set(value, label);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, isAr ? 'ar' : 'en'));
  }, [items, isAr]);

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const cat = category.trim();
    return items.filter((it) => {
      if (cat) {
        const a = (it.category || '').toLowerCase();
        const b = (it.category_ar || '').toLowerCase();
        const c = cat.toLowerCase();
        if (a !== c && b !== c) return false;
      }
      if (!q) return true;
      const hay = `${it.name} ${it.name_ar || ''} ${it.slug} ${it.category || ''} ${it.category_ar || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query, category]);

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <div>
          <h1>{t('AnimalTypes')}</h1>
          <p>{t('ManageAnimalTypes')}</p>
        </div>
        <Link href={"/admin/animal-types/new" as any} className="btn btn-primary">{t('AddAnimalType')}</Link>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
          <input
            type="search"
            className="input"
            placeholder={tCommon('searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ minWidth: 260, flex: '1 1 260px' }}
          />
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ minWidth: 260, flex: '0 0 260px' }}
          >
            <option value="">{tCommon('allCategories')}</option>
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(query || category) && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setQuery(''); setCategory(''); }}
            >
              {tCommon('clearFilters')}
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
          <strong>{t('Name')}</strong>
          <strong>{t('Slug')}</strong>
          <strong>{tCommon('category')}</strong>
          <strong>{t('Issues')}</strong>
          <strong>{t('Actions')}</strong>
        </div>
        <div>
          {filteredItems.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>{isAr ? (item.name_ar || item.name) : item.name}{item.name_ar && !isAr ? ` / ${item.name_ar}` : ''}</div>
              <div>{item.slug}</div>
              <div>{isAr ? (item.category_ar || item.category || '') : (item.category || item.category_ar || '')}</div>
              <div>{(item as any)._count?.issues ?? 0}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={{ pathname: '/admin/animal-types/[id]', params: { id: item.id } } as any} className="btn btn-outline">{t('Edit')}</Link>
                <button onClick={() => handleDelete(item.id)} className="btn btn-outline btn-danger" style={{ cursor: 'pointer' }}>
                  {tCommon('delete')}
                </button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="admin-dashboard empty-message">{t('NoAnimalTypesYet')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
