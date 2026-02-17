"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState(value || "");

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
                setPreview(data.url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div style={{ marginBottom: '1.5rem' }}>
            {label && <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem' }}>{label}</label>}

            <div className="image-upload-row" style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f8fafc',
                borderRadius: '0.75rem',
                border: '1px solid var(--border)'
            }}>
                <div style={{
                    position: 'relative',
                    width: '120px',
                    height: '120px',
                    backgroundColor: 'white',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {preview ? (
                        <Image src={preview} alt="Preview" fill style={{ objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontSize: '2rem', opacity: 0.2 }}>🖼️</span>
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept="image/*"
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
                            disabled={isUploading}
                            className="btn btn-outline"
                            style={{ width: '100%', pointerEvents: 'none' }}
                        >
                            {isUploading ? "UPLOADING..." : "CHOOSE IMAGE FROM COMPUTER"}
                        </button>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        Recommended size: 800x600px. Formats: JPG, PNG, WEBP.
                    </p>
                </div>

                {preview && (
                    <button
                        type="button"
                        onClick={() => { onChange(""); setPreview(""); }}
                        style={{ padding: '0.5rem', color: '#ef4444', fontSize: '1.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        🗑️
                    </button>
                )}
            </div>
            <style>{`
              @media (max-width: 520px) {
                .image-upload-row {
                  gap: 1rem !important;
                  padding: 1rem !important;
                }
              }
            `}</style>
        </div>
    );
}
