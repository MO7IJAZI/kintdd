'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

interface Certificate {
    id: string;
    title: string;
    title_ar: string | null;
    description: string;
    description_ar: string | null;
    imageUrl: string;
    order: number;
}

export default function AdminCertificates() {
    const t = useTranslations('AdminCertificates');
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        imageUrl: '',
    });

    useEffect(() => {
        fetchCertificates();
    }, []);

    const fetchCertificates = async () => {
        try {
            const res = await fetch('/api/certificates');
            if (res.ok) {
                const data = await res.json();
                setCertificates(data);
            }
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
        setLoading(true);

        try {
            const res = await fetch('/api/certificates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setFormData({ title: '', title_ar: '', description: '', description_ar: '', imageUrl: '' });
                setShowForm(false);
                fetchCertificates();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('deleteConfirm'))) return;
        
        try {
            const res = await fetch(`/api/certificates?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchCertificates();
            }
        } catch {
            console.error('Failed to delete certificate');
            alert(t('deleteFail'));
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{t('title')}</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {t('subtitle')}
                    </p>
                </div>
                <button 
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                >
                    {showForm ? t('cancel') : `+ ${t('add')}`}
                </button>
            </div>

            {/* Add Certificate Form */}
            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>{t('addNew')}</h3>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    {t('titleEn')}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder={t('titleEnPlaceholder')}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }} dir="rtl">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    {t('titleAr')}
                                </label>
                                <input
                                    type="text"
                                    value={formData.title_ar}
                                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                                    placeholder={t('titleArPlaceholder')}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    {t('descEn')}
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder={t('descEnPlaceholder')}
                                    rows={2}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', resize: 'vertical' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }} dir="rtl">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                    {t('descAr')}
                                </label>
                                <textarea
                                    value={formData.description_ar}
                                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                    placeholder={t('descArPlaceholder')}
                                    rows={2}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '0.5rem', resize: 'vertical' }}
                                />
                            </div>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                                {t('image')}
                            </label>
                            
                            {/* Image Preview */}
                            {formData.imageUrl && (
                                <div style={{ marginBottom: '1rem', position: 'relative', width: '200px', height: '150px' }}>
                                    <Image 
                                        src={formData.imageUrl} 
                                        alt="Preview" 
                                        fill
                                        style={{ objectFit: 'contain', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                        style={{
                                            position: 'absolute',
                                            top: '-0.5rem',
                                            right: '-0.5rem',
                                            background: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px'
                                        }}
                                        title={t('delete')}
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
                                        required
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                                    />
                                    {uploading && <p style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.25rem' }}>{t('uploading')}</p>}
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" disabled={loading || uploading} className="btn btn-primary">
                                {loading ? t('saving') : t('save')}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn" style={{ border: '1px solid var(--border)' }}>
                                {t('cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Certificates Grid */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '1.5rem' 
            }}>
                {loading && certificates.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                        <p>{t('loading')}</p>
                    </div>
                ) : certificates.length === 0 ? (
                    <div style={{ 
                        gridColumn: '1 / -1', 
                        textAlign: 'center', 
                        padding: '3rem', 
                        background: 'var(--muted)',
                        borderRadius: '1rem' 
                    }}>
                        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                            {t('noData')}
                        </p>
                        <button onClick={() => setShowForm(true)} className="btn btn-primary">
                            {t('addFirst')}
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Add New Card */}
                        <div 
                            className="card" 
                            style={{ 
                                border: '2px dashed var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '250px',
                                cursor: 'pointer',
                                opacity: certificates.length >= 5 ? 0.5 : 1
                            }}
                            onClick={() => certificates.length < 5 && setShowForm(true)}
                        >
                            <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>+</span>
                            <span style={{ fontWeight: '600' }}>{t('add')}</span>
                        </div>

                        {/* Existing Certificates */}
                        {certificates.map((cert) => (
                            <div key={cert.id} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ 
                                    position: 'relative', 
                                    height: '200px', 
                                    background: 'var(--muted)',
                                    overflow: 'hidden'
                                }}>
                                    <Image 
                                        src={cert.imageUrl} 
                                        alt={cert.title}
                                        fill
                                        style={{ 
                                            objectFit: 'cover' 
                                        }}
                                    />
                                </div>
                                <div style={{ padding: '1.25rem' }}>
                                    <h3 style={{ 
                                        fontSize: '1.1rem', 
                                        fontWeight: '600', 
                                        marginBottom: '0.5rem',
                                        color: 'var(--foreground)'
                                    }}>
                                        {cert.title}
                                    </h3>
                                    {cert.title_ar && <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '0.5rem', direction: 'rtl' }}>{cert.title_ar}</h4>}
                                    {cert.description && (
                                        <p style={{ 
                                            fontSize: '0.9rem', 
                                            color: 'var(--muted-foreground)',
                                            marginBottom: '1rem'
                                        }}>
                                            {cert.description}
                                        </p>
                                    )}
                                    {cert.description_ar && (
                                        <p style={{ 
                                            fontSize: '0.9rem', 
                                            color: 'var(--muted-foreground)',
                                            marginBottom: '1rem',
                                            direction: 'rtl'
                                        }}>
                                            {cert.description_ar}
                                        </p>
                                    )}
                                    <button
                                        onClick={() => handleDelete(cert.id)}
                                        className="btn"
                                        style={{ 
                                            color: '#ef4444',
                                            fontSize: '0.85rem',
                                            padding: '0.4rem 0.75rem',
                                            border: '1px solid #ef4444',
                                            borderRadius: '0.375rem',
                                            width: '100%'
                                        }}
                                    >
                                        {t('delete')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Info Box */}
            {certificates.length > 0 && (
                <div style={{ 
                    marginTop: '2rem', 
                    padding: '1.5rem', 
                    background: 'var(--muted)',
                    borderRadius: '0.75rem',
                    textAlign: 'center'
                }}>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {certificates.length} / 5 {t('countInfo')}
                    </p>
                    {certificates.length >= 5 && (
                        <p style={{ 
                            color: 'var(--primary)', 
                            marginTop: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            {t('maxLimitReached')}
                        </p>
                    )}
                </div>
            )}

        </div>
    );
}
