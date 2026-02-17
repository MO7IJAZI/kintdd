'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Award {
  id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export default function AwardsAdminPage() {
  const t = useTranslations('AdminAwards');
  const tCommon = useTranslations('AdminCommon');
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    imageUrl: '',
    isActive: true,
    order: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      const res = await fetch('/api/awards');
      const data = await res.json();
      setAwards(data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(t('uploadFail'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(t('uploadFail'));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl) {
      alert(t('uploadFail')); // Or a more specific message if needed, using uploadFail for now
      return;
    }

    try {
      const url = isEditing ? `/api/awards/${editId}` : '/api/awards';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setFormData({
          title: '',
          title_ar: '',
          description: '',
          description_ar: '',
          imageUrl: '',
          isActive: true,
          order: 0,
        });
        setIsEditing(false);
        setEditId(null);
        fetchAwards();
      } else {
        alert(t('saveFail'));
      }
    } catch (error) {
      console.error('Error saving award:', error);
      alert(t('saveFail'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('deleteConfirm'))) return;

    try {
      const res = await fetch(`/api/awards?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchAwards();
      } else {
        alert(t('deleteFail'));
      }
    } catch (error) {
      console.error('Error deleting award:', error);
      alert(t('deleteFail'));
    }
  };

  const handleEdit = (award: Award) => {
    setFormData({
      title: award.title,
      title_ar: award.title_ar || '',
      description: award.description || '',
      description_ar: award.description_ar || '',
      imageUrl: award.imageUrl,
      isActive: award.isActive,
      order: award.order,
    });
    setIsEditing(true);
    setEditId(award.id);
  };

  if (loading) return <div>{tCommon('loading')}</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{t('title')}</h1>

      {/* Form */}
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
          {isEditing ? t('edit') : t('addNew')}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('titleEn')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
              />
            </div>
            <div dir="rtl">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('titleAr')}</label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('descriptionEn')}</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', minHeight: '100px' }}
              />
            </div>
            <div dir="rtl">
              <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('descriptionAr')}</label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem', minHeight: '100px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('image')}</label>
            
            {/* Image Preview */}
            {formData.imageUrl && (
              <div style={{ marginBottom: '1rem', position: 'relative', width: '200px', height: '150px' }}>
                <Image 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  fill 
                  style={{ objectFit: 'contain', border: '1px solid #eee', borderRadius: '4px' }} 
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imageUrl: '' })}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ×
                </button>
              </div>
            )}

            {/* Upload Input */}
            {!formData.imageUrl && (
              <div style={{ marginBottom: '0.5rem' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  required={!isEditing} // Only required for new items or if image cleared
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                />
                {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{t('uploading')}</p>}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>{t('order')}</label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              {t('active')}
            </label>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={uploading}
              style={{
                background: 'var(--primary)',
                color: 'white',
                padding: '0.75rem 1.5rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: uploading ? 'not-allowed' : 'pointer',
                opacity: uploading ? 0.7 : 1
              }}
            >
              {isEditing ? t('update') : t('add')}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditId(null);
                  setFormData({
                    title: '',
                    title_ar: '',
                    description: '',
                    description_ar: '',
                    imageUrl: '',
                    isActive: true,
                    order: 0,
                  });
                }}
                style={{
                  background: 'gray',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                }}
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {awards.map((award) => (
          <div key={award.id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'relative', height: '200px', marginBottom: '1rem' }}>
              <Image
                src={award.imageUrl}
                alt={award.title}
                fill
                style={{ objectFit: 'contain', borderRadius: '0.25rem' }}
              />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{award.title}</h3>
            {award.title_ar && <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', direction: 'rtl' }}>{award.title_ar}</h4>}
            {award.description && <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{award.description}</p>}
            {award.description_ar && <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', direction: 'rtl' }}>{award.description_ar}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '999px', 
                fontSize: '0.8rem', 
                background: award.isActive ? '#dcfce7' : '#fee2e2', 
                color: award.isActive ? '#166534' : '#991b1b' 
              }}>
                {award.isActive ? tCommon('active') : tCommon('inactive')}
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(award)}
                  style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}
                >
                  {tCommon('edit')}
                </button>
                <button
                  onClick={() => handleDelete(award.id)}
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
                >
                  {tCommon('delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
