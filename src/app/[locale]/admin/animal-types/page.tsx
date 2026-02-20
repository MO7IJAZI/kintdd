'use client';

import React from 'react';
import { Link } from "@/navigation";
import { useTranslations } from 'next-intl';

interface AnimalType {
  id: string;
  name: string;
  name_ar: string | null;
  slug: string;
  _count: {
    issues: number;
  };
}

export default function AnimalTypesAdminPage() {
  const t = useTranslations('Product');
  const [items, setItems] = React.useState<AnimalType[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/animal-types');
      const data = await response.json();
      setItems(data);
    }
    fetchData();
  }, []);

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
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
          <strong>{t('Name')}</strong>
          <strong>{t('Slug')}</strong>
          <strong>{t('Issues')}</strong>
          <strong>{t('Actions')}</strong>
        </div>
        <div>
          {items.map(item => (
            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
              <div>{item.name} {item.name_ar ? ` / ${item.name_ar}` : ''}</div>
              <div>{item.slug}</div>
              <div>{(item as any)._count?.issues ?? 0}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link href={{ pathname: '/admin/animal-types/[id]', params: { id: item.id } } as any} className="btn btn-outline">{t('Edit')}</Link>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="admin-dashboard empty-message">{t('NoAnimalTypesYet')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
