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
        <div className="mb-6">
            {label && (
                <label className="block text-sm font-bold text-slate-700 mb-2">
                    {label}
                </label>
            )}

            <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${value ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {value ? "📄" : "📁"}
                </div>

                <div className="flex-1 relative">
                    <div className="relative">
                        <input
                            type="file"
                            accept={accept}
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <button
                            type="button"
                            className="w-full py-2.5 px-4 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            {isUploading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                                    {t('uploading')}
                                </span>
                            ) : value ? (
                                t('changeFile')
                            ) : (
                                finalPlaceholder
                            )}
                        </button>
                    </div>
                    {fileName && (
                        <p className="mt-2 text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                            <span>✓</span> {fileName}
                        </p>
                    )}
                </div>

                {value && (
                    <button
                        type="button"
                        onClick={() => { onChange(""); setFileName(""); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove file"
                    >
                        <span className="text-lg">🗑️</span>
                    </button>
                )}
            </div>
        </div>
    );
}
