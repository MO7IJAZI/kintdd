"use client";

import { useState } from "react";
import RichTextEditor from "./RichTextEditor";

interface Product {
    id: string;
    name: string;
}

interface Stage {
    name: string;
    name_ar?: string;
    description?: string;
    description_ar?: string;
    products: string[]; // Product IDs
}

interface StagesEditorProps {
    initialData?: Stage[];
    products: Product[];
    onChange: (data: Stage[]) => void;
}

export default function StagesEditor({ initialData, products, onChange }: StagesEditorProps) {
    const [stages, setStages] = useState<Stage[]>(initialData || []);

    const addStage = () => {
        const newStages = [...stages, { name: "", name_ar: "", description_ar: "", products: [] }];
        setStages(newStages);
        onChange(newStages);
    };

    const removeStage = (index: number) => {
        const newStages = stages.filter((_, i) => i !== index);
        setStages(newStages);
        onChange(newStages);
    };

    const updateStageField = <K extends keyof Stage>(index: number, field: K, value: Stage[K]) => {
        const newStages = [...stages];
        newStages[index] = { ...newStages[index], [field]: value };
        setStages(newStages);
        onChange(newStages);
    };

    const addProductToStage = (stageIndex: number, productId: string) => {
        if (!productId) return;
        const newStages = [...stages];
        const currentProducts = newStages[stageIndex].products || [];
        if (!currentProducts.includes(productId)) {
            newStages[stageIndex].products = [...currentProducts, productId];
            setStages(newStages);
            onChange(newStages);
        }
    };

    const removeProductFromStage = (stageIndex: number, productId: string) => {
        const newStages = [...stages];
        newStages[stageIndex].products = newStages[stageIndex].products.filter(id => id !== productId);
        setStages(newStages);
        onChange(newStages);
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--foreground)', opacity: 0.8 }}>CROP GROWTH STAGES</label>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {stages.map((stage, index) => (
                    <div key={index} style={{ 
                        padding: '1.5rem', 
                        border: '1px solid var(--border)', 
                        borderRadius: '0.75rem',
                        backgroundColor: '#f8fafc',
                        position: 'relative'
                    }}>
                        <button 
                            type="button"
                            onClick={() => removeStage(index)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                color: '#ef4444',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            REMOVE
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>STAGE NAME (English)</label>
                                <input 
                                    className="input" 
                                    style={{ width: '100%', backgroundColor: 'white' }}
                                    placeholder="e.g. Tillering, Flowering, Fruit Setting..."
                                    value={stage.name}
                                    onChange={(e) => updateStageField(index, 'name', e.target.value)}
                                />
                            </div>
                            <div dir="rtl">
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>اسم المرحلة (بالعربية)</label>
                                <input 
                                    className="input" 
                                    style={{ width: '100%', backgroundColor: 'white' }}
                                    placeholder="مثال: التزهير، عقد الثمار..."
                                    value={stage.name_ar || ''}
                                    onChange={(e) => updateStageField(index, 'name_ar', e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <RichTextEditor
                                label="STAGE DESCRIPTION (English)"
                                value={stage.description || ''}
                                onChange={(value) => updateStageField(index, 'description', value)}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }} dir="rtl">
                            <RichTextEditor
                                label="وصف المرحلة (بالعربية)"
                                value={stage.description_ar || ''}
                                onChange={(value) => updateStageField(index, 'description_ar', value)}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: '600' }}>RECOMMENDED PRODUCTS FOR THIS STAGE</label>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                {stage.products?.map(prodId => {
                                    const prod = products.find(p => p.id === prodId);
                                    return (
                                        <div key={prodId} style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: '0.5rem',
                                            backgroundColor: 'white',
                                            border: '1px solid var(--border)',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '2rem',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {prod ? prod.name : 'Unknown Product'}
                                            <button 
                                                type="button"
                                                onClick={() => removeProductFromStage(index, prodId)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem', lineHeight: 1 }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <select 
                                className="input" 
                                style={{ width: '100%', backgroundColor: 'white' }}
                                onChange={(e) => {
                                    addProductToStage(index, e.target.value);
                                    e.target.value = ""; // Reset select
                                }}
                            >
                                <option value="">+ Add Product to Stage</option>
                                {products
                                    .filter(p => !stage.products?.includes(p.id))
                                    .map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                type="button"
                onClick={addStage}
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '1rem', borderStyle: 'dashed', justifyContent: 'center' }}
            >
                + ADD GROWTH STAGE
            </button>
        </div>
    );
}
