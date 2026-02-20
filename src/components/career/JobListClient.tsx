'use client';

import { useState } from "react";
import JobApplicationForm from "@/components/admin/JobApplicationForm";
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { stripScripts } from '@/lib/sanitizeHtml';

interface JobOffer {
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
}

interface JobListClientProps {
    initialJobs: JobOffer[];
}

export default function JobListClient({ initialJobs }: JobListClientProps) {
    const t = useTranslations('Career');
    const locale = useLocale();
    const isRtl = locale === 'ar';

    const [expandedJob, setExpandedJob] = useState<string | null>(null);
    const [applyingJob, setApplyingJob] = useState<{ id: string; title: string } | null>(null);
    const [jobOffers, setJobOffers] = useState<JobOffer[]>(initialJobs);

    function toggleJob(jobId: string) {
        setExpandedJob(expandedJob === jobId ? null : jobId);
    }

    function startApplication(job: JobOffer) {
        setApplyingJob({ id: job.id, title: isRtl && job.title_ar ? job.title_ar : job.title });
        setExpandedJob(null);
    }

    function closeApplication() {
        setApplyingJob(null);
    }

    function handleApplicationSuccess() {
        setApplyingJob(null);
        // Refetch jobs to show updated list
        fetch("/api/job-offers")
            .then(res => res.ok ? res.json() : [])
            .then(data => setJobOffers(data));
    }

    const visibleJobs = jobOffers.filter((job) => job.isActive);

    return (
        <>
            {/* Jobs List Section */}
            <div className="jobs-container">
                {visibleJobs.length > 0 ? (
                    <div className="jobs-list">
                        {visibleJobs.map((job, idx) => {
                            const isExpanded = expandedJob === job.id;
                            const title = isRtl && job.title_ar ? job.title_ar : job.title;
                            const location = isRtl && job.location_ar ? job.location_ar : job.location;
                            const workType = isRtl && job.workType_ar ? job.workType_ar : job.workType;
                            const contractType = isRtl && job.contractType_ar ? job.contractType_ar : job.contractType;
                            const employmentType = isRtl && job.employmentType_ar ? job.employmentType_ar : job.employmentType;
                            const intro = isRtl && job.companyIntro_ar ? job.companyIntro_ar : job.companyIntro;
                            const responsibilities = isRtl && job.responsibilities_ar ? job.responsibilities_ar : job.responsibilities;
                            const benefits = isRtl && job.benefits_ar ? job.benefits_ar : job.benefits;
                            const qualifications = isRtl && job.qualifications_ar ? job.qualifications_ar : job.qualifications;
                            const safeResponsibilities = responsibilities ? stripScripts(responsibilities) as unknown as TrustedHTML : '';
                            const safeBenefits = benefits ? stripScripts(benefits) as unknown as TrustedHTML : '';
                            const safeQualifications = qualifications ? stripScripts(qualifications) as unknown as TrustedHTML : '';

                            return (
                                <div key={job.id} className="job-item" style={{ marginBottom: '2rem', borderRadius: '0.75rem', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                                    {/* Job Header / Toggle */}
                                    <button
                                        onClick={() => toggleJob(job.id)}
                                        style={{
                                            width: '100%',
                                            padding: '1.5rem',
                                            backgroundColor: isExpanded ? '#f3f4f6' : 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            transition: 'background-color 0.3s'
                                        }}
                                        aria-expanded={isExpanded}
                                    >
                                        <div style={{ textAlign: isRtl ? 'right' : 'left', flex: 1 }}>
                                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#1f2937' }}>{title}</h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                {location && (
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                        📍 {location}
                                                    </span>
                                                )}
                                                {workType && (
                                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                        💼 {workType} {contractType && `• ${contractType}`}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <ChevronDown
                                            size={24}
                                            style={{
                                                transition: 'transform 0.3s',
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                color: '#6b7280',
                                                marginRight: isRtl ? '1rem' : '0',
                                                marginLeft: isRtl ? '0' : '1rem'
                                            }}
                                        />
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div style={{ padding: '1.5rem', borderTop: '1px solid #e5e7eb', backgroundColor: '#fafafa' }}>
                                            {intro && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                                        {t('companyIntro')}
                                                    </h4>
                                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.6 }}>
                                                        {intro}
                                                    </p>
                                                </div>
                                            )}

                                            {responsibilities && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                                        {t('responsibilities')}
                                                    </h4>
                                                    <div style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: safeResponsibilities }} />
                                                </div>
                                            )}

                                            {benefits && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                                        {t('benefits')}
                                                    </h4>
                                                    <div style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: safeBenefits }} />
                                                </div>
                                            )}

                                            {qualifications && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                    <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                                                        {t('qualifications')}
                                                    </h4>
                                                    <div style={{ fontSize: '0.95rem', color: '#6b7280', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: safeQualifications }} />
                                                </div>
                                            )}

                                            <button
                                                onClick={() => startApplication(job)}
                                                style={{
                                                    marginTop: '1.5rem',
                                                    padding: '0.75rem 2rem',
                                                    backgroundColor: 'var(--primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    transition: 'background-color 0.3s'
                                                }}
                                            >
                                                {t('apply')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>{t('noJobs')}</p>
                    </div>
                )}
            </div>

            {/* Application Modal */}
            {applyingJob && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '1rem'
                    }}
                    onClick={closeApplication}
                >
                    <div
                        style={{
                            backgroundColor: 'white',
                            maxWidth: '600px',
                            width: '100%',
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            borderRadius: '1rem',
                            padding: '2rem'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>
                            {t('applyFor')} {applyingJob.title}
                        </h2>
                        <JobApplicationForm
                            jobOfferId={applyingJob.id}
                            jobTitle={applyingJob.title}
                            onClose={closeApplication}
                            onSuccess={handleApplicationSuccess}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
