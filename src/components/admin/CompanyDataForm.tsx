'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateCompanyData } from '@/actions/companyDataActions';
import { useTranslations } from 'next-intl';

interface CompanyData {
    id: string;
    companyName: string;
    companyName_ar?: string | null;
    address?: string | null;
    address_ar?: string | null;
    courtInfo?: string | null;
    courtInfo_ar?: string | null;
    ncrNumber?: string | null;
    vatNumber?: string | null;
    capital?: string | null;
    capital_ar?: string | null;
}

export default function CompanyDataForm({ initialData }: { initialData: CompanyData }) {
    const t = useTranslations('AdminCompanyData');
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CompanyData>(initialData);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await updateCompanyData(formData);
            if (result.success) {
                setMessage({ type: 'success', text: t('successMessage') });
                router.refresh();
            } else {
                setMessage({ type: 'error', text: result.error || t('errorMessage') });
            }
        } catch (err) {
            setMessage({ type: 'error', text: t('unexpectedError') });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="admin-form">
            {message && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="form-section">
                <h3>{t('basicInfo')}</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>{t('companyNameEn')}</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName || ''}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('companyNameAr')}</label>
                        <input
                            type="text"
                            name="companyName_ar"
                            value={formData.companyName_ar || ''}
                            onChange={handleChange}
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>{t('contactAddress')}</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>{t('addressEn')}</label>
                        <textarea
                            name="address"
                            value={formData.address || ''}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('addressAr')}</label>
                        <textarea
                            name="address_ar"
                            value={formData.address_ar || ''}
                            onChange={handleChange}
                            rows={4}
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>{t('registrationDetails')}</h3>
                <div className="form-grid">
                    <div className="form-group">
                        <label>{t('courtInfoEn')}</label>
                        <textarea
                            name="courtInfo"
                            value={formData.courtInfo || ''}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('courtInfoAr')}</label>
                        <textarea
                            name="courtInfo_ar"
                            value={formData.courtInfo_ar || ''}
                            onChange={handleChange}
                            rows={3}
                            dir="rtl"
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('ncrNumber')}</label>
                        <input
                            type="text"
                            name="ncrNumber"
                            value={formData.ncrNumber || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('vatNumber')}</label>
                        <input
                            type="text"
                            name="vatNumber"
                            value={formData.vatNumber || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('capitalEn')}</label>
                        <input
                            type="text"
                            name="capital"
                            value={formData.capital || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('capitalAr')}</label>
                        <input
                            type="text"
                            name="capital_ar"
                            value={formData.capital_ar || ''}
                            onChange={handleChange}
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? t('saving') : t('saveChanges')}
                </button>
            </div>

            <style jsx>{`
                .admin-form {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .form-section {
                    margin-bottom: 2rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .form-section:last-child {
                    border-bottom: none;
                }

                .form-section h3 {
                    margin-bottom: 1.5rem;
                    color: #1a202c;
                    font-size: 1.25rem;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-weight: 500;
                    color: #4a5568;
                }

                input, textarea {
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #3182ce;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                .message {
                    padding: 1rem;
                    border-radius: 0.5rem;
                    margin-bottom: 2rem;
                }

                .message.success {
                    background-color: #c6f6d5;
                    color: #276749;
                }

                .message.error {
                    background-color: #fed7d7;
                    color: #9b2c2c;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 1rem;
                }

                .btn-primary {
                    background-color: #3182ce;
                    color: white;
                    padding: 0.75rem 2rem;
                    border-radius: 0.5rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .btn-primary:hover {
                    background-color: #2c5282;
                }

                .btn-primary:disabled {
                    background-color: #a0aec0;
                    cursor: not-allowed;
                }
            `}</style>
        </form>
    );
}