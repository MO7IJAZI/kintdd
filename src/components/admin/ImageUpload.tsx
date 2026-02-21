"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label }: ImageUploadProps) {
    const t = useTranslations('AdminImageUpload');
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
                const fullUrl = data.url;
                onChange(fullUrl);
                setPreview(fullUrl);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert(t('uploadError'));
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-bold text-slate-700">
                    {label}
                </label>
            )}

            <div className="flex flex-col gap-4">
                {preview ? (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-200 shadow-sm aspect-video bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                            src={preview} 
                            alt="Preview" 
                            className="w-full h-full object-contain" 
                        />
                        <button
                            type="button"
                            onClick={() => { onChange(""); setPreview(""); }}
                            className="absolute top-2 right-2 p-2 bg-white rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 shadow-sm border border-slate-200 transition-colors"
                            title={t('deleteImage')}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-700">
                                {isUploading ? t('uploading') : t('chooseImage')}
                            </p>
                            <p className="text-xs text-slate-400">
                                {t('recommendedSize') || "Click or drag to upload"}
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs font-bold text-blue-600">Uploading...</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {preview && (
                    <div className="relative">
                        <button
                            type="button"
                            className="w-full py-2 px-4 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm flex items-center justify-center gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            {t('changeImage') || "Change Image"}
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
