'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/navigation';
import { getDocuments, deleteDocument } from '@/actions/documentActions';
import { useSearchParams } from 'next/navigation';

interface Document {
    id: string;
    title: string;
    title_ar: string | null;
    slug: string;
    description: string | null;
    description_ar: string | null;
    filePath: string;
    category: string;
    isActive: boolean;
    downloads: number;
    createdAt: Date;
    updatedAt: Date;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const category = searchParams.get('category') || undefined;

    useEffect(() => {
        let cancelled = false;

        const loadDocuments = async () => {
            try {
                setLoading(true);
                setError('');
                const result = await getDocuments(category);
                if (cancelled) return;

                if (result.success && result.data) {
                    setDocuments(result.data);
                } else {
                    setError(result.error || 'Failed to load documents');
                }
            } catch {
                if (!cancelled) setError('An error occurred while loading documents');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadDocuments();

        return () => {
            cancelled = true;
        };
    }, [category]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this document?')) {
            const result = await deleteDocument(id);
            if (result.success) {
                setDocuments((prev) => prev.filter(doc => doc.id !== id));
            } else {
                setError(result.error || 'Failed to delete document');
            }
        }
    };

    const handleEdit = (id: string) => {
        router.push({pathname: '/admin/documents/edit/[id]', params: {id}});
    };

    const handleCreate = () => {
        const nextUrl = category ? `/admin/documents/create?category=${encodeURIComponent(category)}` : '/admin/documents/create';
        router.push(nextUrl as any);
    };

    if (loading) {
        return (
            <div className="container">
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading documents...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>
                        Manage Documents{category ? `: ${category}` : ''}
                    </h1>
                    <button
                        onClick={handleCreate}
                        style={{
                            background: '#10b981',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Add New Document
                    </button>
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

                <div style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Title</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Category</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Downloads</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Created</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {documents.map((document) => (
                                <tr key={document.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div>
                                            <strong>{document.title}</strong>
                                            {document.title_ar && (
                                                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                    {document.title_ar}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: '#e0e7ff',
                                            color: '#3730a3',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '0.25rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}>
                                            {document.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {document.downloads}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {new Date(document.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleEdit(document.id)}
                                                style={{
                                                    background: '#3b82f6',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.25rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(document.id)}
                                                style={{
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.25rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {documents.length === 0 && !loading && (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                            No documents found. Create your first document.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
