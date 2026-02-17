'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from '@/navigation';
import { getDocumentById, updateDocument } from '@/actions/documentActions';
import { useParams } from 'next/navigation';

type DocumentRecord = {
    id: string;
    title: string;
    title_ar: string | null;
    description: string | null;
    description_ar: string | null;
    filePath: string;
    category: string;
};

export default function EditDocumentPage() {
    const router = useRouter();
    const params = useParams();

    const documentId = useMemo(() => {
        const raw = (params as Record<string, string | string[] | undefined>)?.id;
        if (!raw) return null;
        return Array.isArray(raw) ? raw[0] : raw;
    }, [params]);

    const [initializing, setInitializing] = useState(true);
    const [document, setDocument] = useState<DocumentRecord | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        title_ar: '',
        description: '',
        description_ar: '',
        category: 'optimum-conditions',
        file: null as File | null
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            if (!documentId) {
                setInitializing(false);
                return;
            }

            try {
                setInitializing(true);
                setError('');
                const result = await getDocumentById(documentId);
                if (cancelled) return;

                if (result.success && result.data) {
                    const doc = result.data as DocumentRecord;
                    setDocument(doc);
                    setFormData({
                        title: doc.title || '',
                        title_ar: doc.title_ar || '',
                        description: doc.description || '',
                        description_ar: doc.description_ar || '',
                        category: doc.category || 'optimum-conditions',
                        file: null
                    });
                } else {
                    setDocument(null);
                    setError(result.error || 'Document not found');
                }
            } catch {
                if (!cancelled) setError('An error occurred while loading the document');
            } finally {
                if (!cancelled) setInitializing(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [documentId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({
            ...prev,
            file
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!documentId) {
            setError('Missing document ID');
            return;
        }

        if (!formData.title || !formData.category) {
            setError('Title and category are required');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('title_ar', formData.title_ar);
            data.append('description', formData.description);
            data.append('description_ar', formData.description_ar);
            data.append('category', formData.category);
            if (formData.file) {
                data.append('file', formData.file);
            }

            const result = await updateDocument(documentId, data);

            if (result.success) {
                router.push('/admin/documents');
            } else {
                setError(result.error || 'Failed to update document');
            }
        } catch {
            setError('An error occurred while updating the document');
        } finally {
            setSaving(false);
        }
    };

    if (initializing) {
        return (
            <div className="container">
                <div style={{ padding: '2rem' }}>
                    <div>Loading...</div>
                </div>
            </div>
        );
    }

    if (!documentId || (!document && error)) {
        return (
            <div className="container">
                <div style={{ padding: '2rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        ← Back
                    </button>
                    <h1>Edit Document</h1>
                    <div style={{ marginTop: '1rem', color: '#dc2626' }}>{error || 'Document not found'}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            background: 'none',
                            border: '1px solid #d1d5db',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.25rem',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                        }}
                    >
                        ← Back
                    </button>
                    <h1>Edit Document</h1>
                </div>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    padding: '2rem'
                }}>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Title (English) *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Title (Arabic)
                            </label>
                            <input
                                type="text"
                                name="title_ar"
                                value={formData.title_ar}
                                onChange={handleInputChange}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem',
                                    background: 'white'
                                }}
                            >
                                <option value="optimum-conditions">Optimum Conditions</option>
                                <option value="mixing-table">Mixing Table</option>
                                <option value="technical-guides">Technical Guides</option>
                                <option value="product-catalogs">Product Catalogs</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Description (English)
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Description (Arabic)
                            </label>
                            <textarea
                                name="description_ar"
                                value={formData.description_ar}
                                onChange={handleInputChange}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                PDF File
                            </label>
                            <input
                                type="file"
                                name="file"
                                onChange={handleFileChange}
                                accept=".pdf"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem',
                                    fontSize: '1rem'
                                }}
                            />
                            {document?.filePath && (
                                <div style={{ marginTop: '0.75rem' }}>
                                    <a
                                        href={document.filePath}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: '#2563eb', textDecoration: 'underline' }}
                                    >
                                        View current PDF
                                    </a>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                style={{
                                    background: 'none',
                                    border: '1px solid #d1d5db',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.375rem',
                                    cursor: 'pointer',
                                    fontSize: '1rem'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    background: saving ? '#9ca3af' : '#10b981',
                                    color: 'white',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: 600
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

