"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';

interface Column {
    key: string;
    label: string;
    type?: "text" | "number";
    width?: string;
}

interface DynamicTableEditorProps {
    label: string;
    columns: Column[];
    initialData?: Record<string, string>[];
    onChange: (data: Record<string, string>[]) => void;
    dir?: string;
}

export default function DynamicTableEditor({ label, columns, initialData, onChange, dir = 'ltr' }: DynamicTableEditorProps) {
    const t = useTranslations('AdminTableEditor');
    const [rows, setRows] = useState<Record<string, string>[]>(initialData || []);

    const handleCellChange = (index: number, key: string, value: string) => {
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [key]: value };
        setRows(newRows);
        onChange(newRows);
    };

    const addRow = () => {
        const newRow: Record<string, string> = {};
        columns.forEach(col => newRow[col.key] = "");
        const newRows = [...rows, newRow];
        setRows(newRows);
        onChange(newRows);
    };

    const removeRow = (index: number) => {
        const newRows = rows.filter((_, i) => i !== index);
        setRows(newRows);
        onChange(newRows);
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.8 }}>{label}</label>
            
            <div style={{ 
                border: '1px solid var(--border)', 
                borderRadius: '0.75rem', 
                overflow: 'hidden',
                backgroundColor: 'white'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', direction: dir === 'rtl' ? 'rtl' : 'ltr' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                            {columns.map(col => (
                                <th key={col.key} style={{ 
                                    padding: '0.75rem 1rem', 
                                    textAlign: dir === 'rtl' ? 'right' : 'left', 
                                    fontSize: '0.75rem', 
                                    fontWeight: '600',
                                    color: 'var(--muted-foreground)',
                                    width: col.width
                                }}>
                                    {col.label.toUpperCase()}
                                </th>
                            ))}
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border)' }}>
                                {columns.map(col => (
                                    <td key={col.key} style={{ padding: '0' }}>
                                        <input 
                                            type={col.type || "text"}
                                            value={row[col.key] || ""}
                                            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                                            style={{
                                                width: '100%',
                                                border: 'none',
                                                padding: '0.75rem 1rem',
                                                outline: 'none',
                                                fontSize: '0.875rem',
                                                backgroundColor: 'transparent',
                                                textAlign: dir === 'rtl' ? 'right' : 'left'
                                            }}
                                            placeholder={t('enter', { label: col.label.toLowerCase() })}
                                            dir={dir === 'rtl' ? 'rtl' : undefined}
                                        />
                                    </td>
                                ))}
                                <td style={{ textAlign: 'center' }}>
                                    <button 
                                        type="button"
                                        onClick={() => removeRow(rowIndex)}
                                        style={{ 
                                            color: '#ef4444', 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            fontSize: '1.2rem'
                                        }}
                                        title={t('removeRow')}
                                    >
                                        &times;
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                                    {t('noData')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', backgroundColor: '#f8fafc' }}>
                    <button 
                        type="button" 
                        onClick={addRow}
                        className="btn btn-outline"
                        style={{ width: '100%', borderStyle: 'dashed', justifyContent: 'center' }}
                    >
                        {t('addRow')}
                    </button>
                </div>
            </div>
        </div>
    );
}
