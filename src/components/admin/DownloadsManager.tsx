"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import { useTranslations } from 'next-intl';
import { FileText, Plus, Trash2, Download } from "lucide-react";

interface DownloadItem {
    id?: string;
    title: string;
    type: string;
    fileUrl: string;
}

interface DownloadsManagerProps {
    initialData?: DownloadItem[];
    onChange: (data: DownloadItem[]) => void;
}

export default function DownloadsManager({ initialData = [], onChange }: DownloadsManagerProps) {
    const t = useTranslations('AdminDownloads');
    const [downloads, setDownloads] = useState<DownloadItem[]>(initialData || []);

    const addDownload = () => {
        const newDownload: DownloadItem = { title: "", type: "Label", fileUrl: "" };
        const updated = [...downloads, newDownload];
        setDownloads(updated);
        onChange(updated);
    };

    const removeDownload = (index: number) => {
        const updated = downloads.filter((_, i) => i !== index);
        setDownloads(updated);
        onChange(updated);
    };

    const updateDownload = (index: number, field: keyof DownloadItem, value: string) => {
        const updated = [...downloads];
        // @ts-ignore
        updated[index] = { ...updated[index], [field]: value };
        setDownloads(updated);
        onChange(updated);
    };

    return (
        <div className="mt-8">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
                <Download className="w-6 h-6 text-slate-700" />
                <h3 className="text-xl font-bold text-slate-800">
                    {t('title')}
                </h3>
            </div>

            <div className="space-y-6">
                {downloads.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <p className="text-slate-600 font-medium mb-4">{t('emptyState') || "No downloads added yet"}</p>
                        <button 
                            type="button"
                            onClick={addDownload}
                            className="btn btn-primary"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('add')}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {downloads.map((item, index) => (
                            <div key={index} className="p-6 bg-white border border-slate-200 rounded-lg relative">
                                <button 
                                    type="button"
                                    onClick={() => removeDownload(index)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                    title={t('remove')}
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-[1fr,200px] gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">
                                            {t('docTitle')}
                                        </label>
                                        <input 
                                            className="input w-full"
                                            placeholder={t('placeholder')}
                                            value={item.title}
                                            onChange={(e) => updateDownload(index, 'title', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-slate-700">
                                            {t('type')}
                                        </label>
                                        <div className="relative">
                                            <select 
                                                className="input w-full"
                                                value={item.type}
                                                onChange={(e) => updateDownload(index, 'type', e.target.value)}
                                            >
                                                <option value="Label">{t('types.Label')}</option>
                                                <option value="SDS">{t('types.SDS')}</option>
                                                <option value="Brochure">{t('types.Brochure')}</option>
                                                <option value="Certificate">{t('types.Certificate')}</option>
                                                <option value="Other">{t('types.Other')}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                                    <FileUpload 
                                        label=""
                                        value={item.fileUrl}
                                        onChange={(url) => updateDownload(index, 'fileUrl', url)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {downloads.length > 0 && (
                <button 
                    type="button"
                    onClick={addDownload}
                    className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span className="text-base">{t('add')}</span>
                </button>
            )}
        </div>
    );
}
