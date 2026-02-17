'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export default function HeadquarterAdminPage() {
  const t = useTranslations('AdminHeadquarter');
  const [formData, setFormData] = useState({
    title: '',
    title_ar: '',
    content: '',
    content_ar: '',
    address: '',
    address_ar: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchHeadquarter();
  }, []);

  const fetchHeadquarter = async () => {
    try {
      const res = await fetch('/api/headquarter');
      const data = await res.json();
      if (data && !data.error && Object.keys(data).length > 0) {
        setFormData({
          title: data.title || 'Company Headquarter',
          title_ar: data.title_ar || '',
          content: data.content || '',
          content_ar: data.content_ar || '',
          address: data.address || '',
          address_ar: data.address_ar || '',
          latitude: data.latitude === null || data.latitude === undefined ? '' : String(data.latitude),
          longitude: data.longitude === null || data.longitude === undefined ? '' : String(data.longitude),
        });
      }
    } catch (error) {
      console.error('Error fetching headquarter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/headquarter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert(t('alertSuccess'));
      } else {
        alert(t('alertError'));
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert(t('alertError'));
    } finally {
      setSaving(false);
    }
  };

  const getEmbedUrl = () => {
    let q = '';
    if (formData.latitude && formData.longitude) {
      q = `${formData.latitude},${formData.longitude}`;
    } else if (formData.address) {
      q = formData.address;
    }
    
    if (!q) return '';
    return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  if (loading) return <div>Loading...</div>;

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid var(--border)',
    borderRadius: '0.5rem',
    fontFamily: 'inherit'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '0.5rem'
  };

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>{t('description')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>{t('pageTitleEn')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={inputStyle}
                placeholder={t('titlePlaceholder')}
              />
            </div>
            <div dir="rtl">
              <label style={labelStyle}>{t('pageTitleAr')}</label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                style={inputStyle}
                placeholder={t('titleArPlaceholder')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={labelStyle}>{t('contentEn')}</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                style={{ ...inputStyle, minHeight: '150px' }}
                placeholder={t('contentPlaceholder')}
              />
            </div>
            <div dir="rtl">
              <label style={labelStyle}>{t('contentAr')}</label>
              <textarea
                value={formData.content_ar}
                onChange={(e) => setFormData({ ...formData, content_ar: e.target.value })}
                style={{ ...inputStyle, minHeight: '150px' }}
                placeholder={t('contentArPlaceholder')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={labelStyle}>{t('addressEn')}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={inputStyle}
                placeholder={t('addressPlaceholder')}
              />
            </div>
            <div dir="rtl">
              <label style={labelStyle}>{t('addressAr')}</label>
              <input
                type="text"
                value={formData.address_ar}
                onChange={(e) => setFormData({ ...formData, address_ar: e.target.value })}
                style={inputStyle}
                placeholder={t('addressArPlaceholder')}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={labelStyle}>{t('latitude')}</label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                style={inputStyle}
                placeholder="e.g. 40.7128"
              />
            </div>
            <div>
              <label style={labelStyle}>{t('longitude')}</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                style={inputStyle}
                placeholder="e.g. -74.0060"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{t('mapPreview')}</h2>
          <div className="card" style={{ overflow: 'hidden', height: '400px', position: 'relative' }}>
            {getEmbedUrl() ? (
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={getEmbedUrl()}
                allowFullScreen
                title={t('title')}
              ></iframe>
            ) : (
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'var(--muted-foreground)',
                textAlign: 'center',
                padding: '1rem'
              }}>
                {t('mapPlaceholder')}
              </div>
            )}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            {t('mapNote')}
          </p>
        </div>
      </div>
    </div>
  );
}
