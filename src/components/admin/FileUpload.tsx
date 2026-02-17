"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';

interface FileUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    accept?: string;
    placeholder?: string;
}

export default function FileUpload({ value, onChange, label, accept = "application/pdf", placeholder }: FileUploadProps) {
    const t = useTranslations('AdminFileUpload');
    const [isUploading, setIsUploading] = useState(false);
    const [fileName, setFileName] = useState(value ? value.split('/').pop() : "");

    const defaultPlaceholder = t('placeholder');
    const finalPlaceholder = placeholder || defaultPlaceholder;

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.url) {
                onChange(data.url);
                setFileName(file.name);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert(t('uploadError'));
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{label}</label>}

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: value ? '#fee2e2' : 'white',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border)',
                    fontSize: '1.5rem'
                }}>
                    {value ? "📄" : "📁"}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                            }}
                        />
                        <button
                            type="button"
                            className="btn btn-outline"
                            style={{ width: '100%', pointerEvents: 'none', justifyContent: 'center' }}
                        >
                            {isUploading ? t('uploading') : value ? t('changeFile') : finalPlaceholder}
                        </button>
                    </div>
                    {fileName && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                            ✓ {fileName}
                        </p>
                    )}
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={() => { onChange(""); setFileName(""); }}
                        style={{ padding: '0.5rem', color: '#ef4444', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        🗑️
                    </button>
                )}
            </div>
        </div>
    );
}
