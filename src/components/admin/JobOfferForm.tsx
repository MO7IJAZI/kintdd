"use client";

import { useState } from "react";
import { createJobOffer, updateJobOffer } from "@/actions/jobOfferActions";
import RichTextEditor from "./RichTextEditor";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface JobOfferFormProps {
    jobOffer?: {
        id: string;
        title: string;
        title_ar?: string | null;
        location: string | null;
        location_ar?: string | null;
        workType: string | null;
        workType_ar?: string | null;
        contractType: string | null;
        contractType_ar?: string | null;
        employmentType: string | null;
        employmentType_ar?: string | null;
        companyIntro: string | null;
        companyIntro_ar?: string | null;
        responsibilities: string | null;
        responsibilities_ar?: string | null;
        benefits: string | null;
        benefits_ar?: string | null;
        qualifications: string | null;
        qualifications_ar?: string | null;
        isActive: boolean;
        expiresAt?: Date | null;
    };
}

export default function JobOfferForm({ jobOffer }: JobOfferFormProps) {
    const t = useTranslations('AdminJobOfferForm');
    const tErrors = useTranslations('AdminErrors');
    const isEditing = !!jobOffer;
    const [currentLang, setCurrentLang] = useState<'en' | 'ar'>('en');
    const router = useRouter();
    const locale = useLocale();
    const [isPending, setIsPending] = useState(false);

    // State for controlled rich text fields
    const [companyIntro, setCompanyIntro] = useState(jobOffer?.companyIntro || "");
    const [companyIntroAr, setCompanyIntroAr] = useState(jobOffer?.companyIntro_ar || "");
    const [responsibilities, setResponsibilities] = useState(jobOffer?.responsibilities || "");
    const [responsibilitiesAr, setResponsibilitiesAr] = useState(jobOffer?.responsibilities_ar || "");
    const [benefits, setBenefits] = useState(jobOffer?.benefits || "");
    const [benefitsAr, setBenefitsAr] = useState(jobOffer?.benefits_ar || "");
    const [qualifications, setQualifications] = useState(jobOffer?.qualifications || "");
    const [qualificationsAr, setQualificationsAr] = useState(jobOffer?.qualifications_ar || "");

    // Format date for input type="date" (YYYY-MM-DD)
    const formattedDate = jobOffer?.expiresAt 
        ? new Date(jobOffer.expiresAt).toISOString().split('T')[0] 
        : "";

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.currentTarget);
        // Append rich text content manually
        formData.set('companyIntro', companyIntro);
        formData.set('companyIntro_ar', companyIntroAr);
        formData.set('responsibilities', responsibilities);
        formData.set('responsibilities_ar', responsibilitiesAr);
        formData.set('benefits', benefits);
        formData.set('benefits_ar', benefitsAr);
        formData.set('qualifications', qualifications);
        formData.set('qualifications_ar', qualificationsAr);

        try {
            if (isEditing) {
                await updateJobOffer(jobOffer.id, formData);
            } else {
                await createJobOffer(formData);
            }
            
            // Redirect to the list page after success
            router.push(`/${locale}/admin/career`);
            router.refresh();
        } catch (error) {
            console.error("Operation failed:", error);
            alert(tErrors('savingFailed'));
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="job-offer-form"
            style={{ maxWidth: "900px", margin: "0 auto" }}
        >
            <div className="header-section">
                <h2 style={{ color: "#142346", margin: 0 }}>
                    {isEditing ? t('editTitle') : t('createTitle')}
                </h2>
                <div className="lang-toggle">
                    <button
                        type="button"
                        onClick={() => setCurrentLang('en')}
                        className={currentLang === 'en' ? 'active' : ''}
                    >
                        {t('english')}
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentLang('ar')}
                        className={currentLang === 'ar' ? 'active' : ''}
                    >
                        {t('arabic')}
                    </button>
                </div>
            </div>

            <div className="form-card">
                <h3 className="section-title">Basic Information</h3>
                
                <div className="form-group">
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label>{t('jobTitleEn')}</label>
                        <input
                            type="text"
                            name="title"
                            defaultValue={jobOffer?.title || ""}
                            required={currentLang === 'en'}
                            className="form-input"
                        />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label>{t('jobTitleAr')}</label>
                        <input
                            type="text"
                            name="title_ar"
                            defaultValue={jobOffer?.title_ar || ""}
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                            <label>{t('locationEn')}</label>
                            <input
                                type="text"
                                name="location"
                                defaultValue={jobOffer?.location || ""}
                                placeholder={t('locationPlaceholder')}
                                className="form-input"
                            />
                        </div>
                        <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                            <label>{t('locationAr')}</label>
                            <input
                                type="text"
                                name="location_ar"
                                defaultValue={jobOffer?.location_ar || ""}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                            <label>{t('workTypeEn')}</label>
                            <select
                                name="workType"
                                defaultValue={jobOffer?.workType || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectWorkType')}</option>
                                <option value="Full-time">{t('types.Full-time')}</option>
                                <option value="Part-time">{t('types.Part-time')}</option>
                                <option value="Remote">{t('types.Remote')}</option>
                                <option value="Hybrid">{t('types.Hybrid')}</option>
                                <option value="On-site">{t('types.On-site')}</option>
                            </select>
                        </div>
                        <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                            <label>{t('workTypeAr')}</label>
                            <select
                                name="workType_ar"
                                defaultValue={jobOffer?.workType_ar || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectWorkType')}</option>
                                <option value={t('types.Full-time')}>{t('types.Full-time')}</option>
                                <option value={t('types.Part-time')}>{t('types.Part-time')}</option>
                                <option value={t('types.Remote')}>{t('types.Remote')}</option>
                                <option value={t('types.Hybrid')}>{t('types.Hybrid')}</option>
                                <option value={t('types.On-site')}>{t('types.On-site')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                            <label>{t('contractTypeEn')}</label>
                            <select
                                name="contractType"
                                defaultValue={jobOffer?.contractType || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectContractType')}</option>
                                <option value="Permanent">{t('types.Permanent')}</option>
                                <option value="Fixed-term">{t('types.Fixed-term')}</option>
                                <option value="B2B">{t('types.B2B')}</option>
                                <option value="Mandate">{t('types.Mandate')}</option>
                            </select>
                        </div>
                        <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                            <label>{t('contractTypeAr')}</label>
                            <select
                                name="contractType_ar"
                                defaultValue={jobOffer?.contractType_ar || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectContractType')}</option>
                                <option value={t('types.Permanent')}>{t('types.Permanent')}</option>
                                <option value={t('types.Fixed-term')}>{t('types.Fixed-term')}</option>
                                <option value={t('types.B2B')}>{t('types.B2B')}</option>
                                <option value={t('types.Mandate')}>{t('types.Mandate')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                            <label>{t('employmentTypeEn')}</label>
                            <select
                                name="employmentType"
                                defaultValue={jobOffer?.employmentType || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectEmploymentType')}</option>
                                <option value="Employee">{t('types.Employee')}</option>
                                <option value="Manager">{t('types.Manager')}</option>
                                <option value="Specialist">{t('types.Specialist')}</option>
                                <option value="Director">{t('types.Director')}</option>
                                <option value="Other">{t('types.Other')}</option>
                            </select>
                        </div>
                        <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                            <label>{t('employmentTypeAr')}</label>
                            <select
                                name="employmentType_ar"
                                defaultValue={jobOffer?.employmentType_ar || ""}
                                className="form-select"
                            >
                                <option value="">{t('selectEmploymentType')}</option>
                                <option value={t('types.Employee')}>{t('types.Employee')}</option>
                                <option value={t('types.Manager')}>{t('types.Manager')}</option>
                                <option value={t('types.Specialist')}>{t('types.Specialist')}</option>
                                <option value={t('types.Director')}>{t('types.Director')}</option>
                                <option value={t('types.Other')}>{t('types.Other')}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label>{t('expiresAt')}</label>
                    <input
                        type="date"
                        name="expiresAt"
                        defaultValue={formattedDate}
                        className="form-input"
                        style={{ maxWidth: "200px" }}
                    />
                    <small style={{ color: "#718096", display: "block", marginTop: "4px" }}>
                        {t('expiresAtHelp')}
                    </small>
                </div>
            </div>

            <div className="form-card">
                <h3 className="section-title">Job Details</h3>
                
                <div className="form-group">
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label>{t('companyIntroEn')}</label>
                        <RichTextEditor
                            value={companyIntro}
                            onChange={setCompanyIntro}
                        />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label>{t('companyIntroAr')}</label>
                        <RichTextEditor
                            value={companyIntroAr}
                            onChange={setCompanyIntroAr}
                            dir="rtl"
                        />
                    </div>
                    <input type="hidden" name="companyIntro" value={companyIntro} />
                    <input type="hidden" name="companyIntro_ar" value={companyIntroAr} />
                </div>

                <div className="form-group">
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label>{t('responsibilitiesEn')}</label>
                        <RichTextEditor
                            value={responsibilities}
                            onChange={setResponsibilities}
                        />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label>{t('responsibilitiesAr')}</label>
                        <RichTextEditor
                            value={responsibilitiesAr}
                            onChange={setResponsibilitiesAr}
                            dir="rtl"
                        />
                    </div>
                    <input type="hidden" name="responsibilities" value={responsibilities} />
                    <input type="hidden" name="responsibilities_ar" value={responsibilitiesAr} />
                </div>

                <div className="form-group">
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label>{t('benefitsEn')}</label>
                        <RichTextEditor
                            value={benefits}
                            onChange={setBenefits}
                        />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label>{t('benefitsAr')}</label>
                        <RichTextEditor
                            value={benefitsAr}
                            onChange={setBenefitsAr}
                            dir="rtl"
                        />
                    </div>
                    <input type="hidden" name="benefits" value={benefits} />
                    <input type="hidden" name="benefits_ar" value={benefitsAr} />
                </div>

                <div className="form-group">
                    <div style={{ display: currentLang === 'en' ? 'block' : 'none' }}>
                        <label>{t('qualificationsEn')}</label>
                        <RichTextEditor
                            value={qualifications}
                            onChange={setQualifications}
                        />
                    </div>
                    <div style={{ display: currentLang === 'ar' ? 'block' : 'none' }} dir="rtl">
                        <label>{t('qualificationsAr')}</label>
                        <RichTextEditor
                            value={qualificationsAr}
                            onChange={setQualificationsAr}
                            dir="rtl"
                        />
                    </div>
                    <input type="hidden" name="qualifications" value={qualifications} />
                    <input type="hidden" name="qualifications_ar" value={qualificationsAr} />
                </div>
            </div>

            <div className="form-card" style={{ display: 'flex', alignItems: 'center' }}>
                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked={jobOffer?.isActive ?? true}
                    />
                    <span>{t('active')}</span>
                </label>
            </div>

            <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={isPending}>
                    {isPending ? t('processing') : (isEditing ? t('updateBtn') : t('createBtn'))}
                </button>
            </div>

            <style jsx>{`
                .header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .lang-toggle {
                    display: flex;
                    gap: 0.5rem;
                    background: #f7fafc;
                    padding: 0.25rem;
                    border-radius: 0.5rem;
                }

                .lang-toggle button {
                    padding: 0.5rem 1rem;
                    border-radius: 0.375rem;
                    border: none;
                    background: transparent;
                    color: #718096;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .lang-toggle button.active {
                    background: white;
                    color: #1a202c;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .form-card {
                    background: white;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    margin-bottom: 2rem;
                    border: 1px solid #e2e8f0;
                }

                .section-title {
                    margin-bottom: 1.5rem;
                    color: #2d3748;
                    font-size: 1.25rem;
                    border-bottom: 1px solid #edf2f7;
                    padding-bottom: 0.75rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .form-group {
                    margin-bottom: 1.5rem;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #4a5568;
                }

                .form-input, .form-select {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                }

                .form-input:focus, .form-select:focus {
                    outline: none;
                    border-color: #3182ce;
                    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
                }

                .checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: #2d3748;
                }

                .checkbox-label input {
                    width: 1.25rem;
                    height: 1.25rem;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 1rem;
                }

                .btn-submit {
                    background-color: #3182ce;
                    color: white;
                    padding: 0.75rem 2rem;
                    border: none;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: background-color 0.2s;
                }

                .btn-submit:hover {
                    background-color: #2c5282;
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </form>
    );
}
