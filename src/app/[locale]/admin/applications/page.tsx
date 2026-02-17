"use client";

import { useState, useEffect } from "react";
import { Eye, Check, X, Trash2, Mail, Phone, Linkedin, FileText, Download } from "lucide-react";
import { getJobApplications, updateJobApplicationStatus, deleteJobApplication } from "@/actions/jobApplicationActions";
import { useTranslations, useLocale } from 'next-intl';

interface JobApplication {
    id: string;
    jobOfferId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    address: string | null;
    linkedIn: string | null;
    cvUrl: string | null;
    coverLetter: string | null;
    status: string;
    notes: string | null;
    submittedAt: Date;
    jobOffer: {
        id: string;
        title: string;
    };
}

export default function ApplicationsAdminPage() {
    const t = useTranslations('AdminJobApplications');
    const locale = useLocale();
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        loadApplications();
    }, []);

    async function loadApplications() {
        try {
            const data = await getJobApplications();
            setApplications(data as JobApplication[]);
        } catch (error) {
            console.error("Failed to load applications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(id: string, status: string) {
        await updateJobApplicationStatus(id, status);
        loadApplications();
        if (selectedApplication?.id === id) {
            setSelectedApplication({ ...selectedApplication, status });
        }
    }

    async function handleDelete(id: string) {
        if (!confirm(t('deleteConfirm'))) return;
        await deleteJobApplication(id);
        loadApplications();
        if (selectedApplication?.id === id) {
            setSelectedApplication(null);
        }
    }

    const filteredApplications = filter === "all" 
        ? applications 
        : applications.filter(app => app.status === filter);

    const statusCounts = {
        all: applications.length,
        pending: applications.filter(app => app.status === "pending").length,
        reviewed: applications.filter(app => app.status === "reviewed").length,
        contacted: applications.filter(app => app.status === "contacted").length,
        rejected: applications.filter(app => app.status === "rejected").length,
        hired: applications.filter(app => app.status === "hired").length,
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>{t('title')}</h1>
                <span className="total-count">{t('total')}: {applications.length}</span>
            </div>

            {/* Filters */}
            <div className="filters">
                {["all", "pending", "reviewed", "contacted", "rejected", "hired"].map((status) => (
                    <button
                        key={status}
                        className={`filter-btn ${filter === status ? 'active' : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {t(`filter.${status}`)}
                        <span className="count">{statusCounts[status as keyof typeof statusCounts]}</span>
                    </button>
                ))}
            </div>

            {/* Applications List */}
            <div className="content-card">
                {loading ? (
                    <div className="loading">{t('loading')}</div>
                ) : filteredApplications.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('noData')}</p>
                    </div>
                ) : (
                    <div className="applications-list">
                        {filteredApplications.map((app) => (
                            <div key={app.id} className={`application-item ${app.status}`}>
                                <div className="app-info">
                                    <div className="app-header">
                                        <h3>{app.firstName} {app.lastName}</h3>
                                        <span className={`status-badge ${app.status}`}>
                                            {t(`filter.${app.status}`)}
                                        </span>
                                    </div>
                                    <p className="app-position">{t('list.appliedFor')}: <strong>{app.jobOffer.title}</strong></p>
                                    <div className="app-contact">
                                        <span><Mail size={14} /> {app.email}</span>
                                        {app.phone && <span><Phone size={14} /> {app.phone}</span>}
                                    </div>
                                    <p className="app-date">
                                        {t('list.submitted')}: {new Date(app.submittedAt).toLocaleDateString(locale, {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                                <div className="app-actions">
                                    <button 
                                        onClick={() => setSelectedApplication(app)}
                                        className="btn-view"
                                        title={t('list.view')}
                                    >
                                        <Eye size={18} />
                                    </button>
                                    {app.status === "pending" && (
                                        <button 
                                            onClick={() => handleStatusUpdate(app.id, "reviewed")}
                                            className="btn-review"
                                            title={t('list.markReviewed')}
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    {app.status !== "hired" && (
                                        <button 
                                            onClick={() => handleStatusUpdate(app.id, "hired")}
                                            className="btn-hire"
                                            title={t('list.markHired')}
                                        >
                                            ✓
                                        </button>
                                    )}
                                    {app.status !== "rejected" && (
                                        <button 
                                            onClick={() => handleStatusUpdate(app.id, "rejected")}
                                            className="btn-reject"
                                            title={t('list.reject')}
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(app.id)}
                                        className="btn-delete"
                                        title={t('list.delete')}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedApplication && (
                <div className="modal-overlay" onClick={() => setSelectedApplication(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('modal.title')}</h2>
                            <button onClick={() => setSelectedApplication(null)} className="btn-close">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>{t('modal.personalInfo')}</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>{t('modal.fullName')}</label>
                                        <p>{selectedApplication.firstName} {selectedApplication.lastName}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.email')}</label>
                                        <p><a href={`mailto:${selectedApplication.email}`}>{selectedApplication.email}</a></p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.phone')}</label>
                                        <p>{selectedApplication.phone || t('modal.notProvided')}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.address')}</label>
                                        <p>{selectedApplication.address || t('modal.notProvided')}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>{t('modal.professionalLinks')}</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>{t('modal.linkedIn')}</label>
                                        <p>
                                            {selectedApplication.linkedIn ? (
                                                <a href={selectedApplication.linkedIn} target="_blank" rel="noopener noreferrer">
                                                    <Linkedin size={14} /> {t('modal.viewProfile')}
                                                </a>
                                            ) : t('modal.notProvided')}
                                        </p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.cv')}</label>
                                        <div className="cv-container">
                                            {selectedApplication.cvUrl ? (
                                                <div className="cv-actions">
                                                    <a href={selectedApplication.cvUrl} target="_blank" rel="noopener noreferrer" className="cv-link">
                                                        <FileText size={14} /> {t('modal.viewCv')}
                                                    </a>
                                                    <a href={selectedApplication.cvUrl} download className="cv-download">
                                                        <Download size={14} /> {t('modal.download')}
                                                    </a>
                                                </div>
                                            ) : (
                                                <p>{t('modal.notProvided')}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>{t('modal.coverLetter')}</h3>
                                <div className="cover-letter">
                                    {selectedApplication.coverLetter ? (
                                        <p style={{ whiteSpace: "pre-wrap" }}>{selectedApplication.coverLetter}</p>
                                    ) : (
                                        <p className="not-provided">{t('modal.noCoverLetter')}</p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h3>{t('modal.appInfo')}</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <label>{t('modal.position')}</label>
                                        <p>{selectedApplication.jobOffer.title}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.submitted')}</label>
                                        <p>{new Date(selectedApplication.submittedAt).toLocaleDateString(locale)}</p>
                                    </div>
                                    <div className="detail-item">
                                        <label>{t('modal.status')}</label>
                                        <select 
                                            value={selectedApplication.status}
                                            onChange={(e) => handleStatusUpdate(selectedApplication.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="pending">{t('filter.pending')}</option>
                                            <option value="reviewed">{t('filter.reviewed')}</option>
                                            <option value="contacted">{t('filter.contacted')}</option>
                                            <option value="rejected">{t('filter.rejected')}</option>
                                            <option value="hired">{t('filter.hired')}</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .page {
                    padding: 2rem;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .page-header h1 {
                    font-size: 1.75rem;
                    color: #1e293b;
                    font-weight: 700;
                }

                .total-count {
                    background: #f1f5f9;
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    color: #475569;
                    font-weight: 600;
                }

                .filters {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-weight: 500;
                    color: #475569;
                    transition: all 0.2s;
                }

                .filter-btn:hover {
                    border-color: #e9496c;
                    color: #e9496c;
                }

                .filter-btn.active {
                    background: linear-gradient(135deg, #e9496c 0%, #d63d5c 100%);
                    color: white;
                    border-color: #e9496c;
                }

                .filter-btn .count {
                    background: rgba(0,0,0,0.1);
                    padding: 0.1rem 0.4rem;
                    border-radius: 0.25rem;
                    font-size: 0.75rem;
                }

                .filter-btn.active .count {
                    background: rgba(255,255,255,0.2);
                }

                .content-card {
                    background: white;
                    border-radius: 1rem;
                    padding: 1.5rem;
                    border: 1px solid #e2e8f0;
                }

                .loading, .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: #64748b;
                }

                .applications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .application-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    background: #f8fafc;
                    border-radius: 0.75rem;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }

                .application-item:hover {
                    border-color: #e9496c50;
                }

                .application-item.pending {
                    border-left: 4px solid #f59e0b;
                }

                .application-item.reviewed {
                    border-left: 4px solid #3b82f6;
                }

                .application-item.contacted {
                    border-left: 4px solid #8b5cf6;
                }

                .application-item.rejected {
                    border-left: 4px solid #ef4444;
                    opacity: 0.7;
                }

                .application-item.hired {
                    border-left: 4px solid #10b981;
                }

                .app-info {
                    flex: 1;
                }

                .app-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 0.5rem;
                }

                .app-header h3 {
                    font-size: 1.1rem;
                    color: #1e293b;
                    margin: 0;
                }

                .status-badge {
                    font-size: 0.75rem;
                    padding: 0.2rem 0.6rem;
                    border-radius: 1rem;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .status-badge.pending {
                    background: #fef3c7;
                    color: #92400e;
                }

                .status-badge.reviewed {
                    background: #dbeafe;
                    color: #1e40af;
                }

                .status-badge.contacted {
                    background: #ede9fe;
                    color: #5b21b6;
                }

                .status-badge.rejected {
                    background: #fee2e2;
                    color: #991b1b;
                }

                .status-badge.hired {
                    background: #d1fae5;
                    color: #065f46;
                }

                .app-position {
                    font-size: 0.9rem;
                    color: #475569;
                    margin-bottom: 0.5rem;
                }

                .app-contact {
                    display: flex;
                    gap: 1.5rem;
                    font-size: 0.85rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }

                .app-contact span {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .app-date {
                    font-size: 0.8rem;
                    color: #94a3b8;
                }

                .app-actions {
                    display: flex;
                    gap: 0.5rem;
                }

                .app-actions button {
                    padding: 0.5rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.375rem;
                    cursor: pointer;
                    color: #475569;
                    transition: all 0.2s;
                }

                .app-actions button:hover {
                    background: #f1f5f9;
                }

                .btn-view:hover {
                    color: #3b82f6;
                    border-color: #3b82f6;
                }

                .btn-review:hover {
                    color: #3b82f6;
                    border-color: #3b82f6;
                }

                .btn-hire:hover {
                    color: #10b981;
                    border-color: #10b981;
                }

                .btn-reject:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                }

                .btn-delete:hover {
                    color: #ef4444;
                    border-color: #ef4444;
                    background: #fee2e2;
                }

                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 2rem;
                }

                .modal-content {
                    background: white;
                    border-radius: 1rem;
                    width: 100%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .modal-header h2 {
                    font-size: 1.25rem;
                    color: #1e293b;
                    margin: 0;
                }

                .btn-close {
                    padding: 0.5rem;
                    background: none;
                    border: none;
                    color: #64748b;
                    cursor: pointer;
                    border-radius: 0.375rem;
                }

                .btn-close:hover {
                    background: #f1f5f9;
                }

                .modal-body {
                    padding: 1.5rem;
                }

                .detail-section {
                    margin-bottom: 1.5rem;
                }

                .detail-section h3 {
                    font-size: 1rem;
                    color: #142346;
                    margin-bottom: 1rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .cv-actions {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }

                .cv-link, .cv-download {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.3rem 0.6rem;
                    border-radius: 0.25rem;
                    font-size: 0.85rem;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .cv-link {
                    background: #f1f5f9;
                    color: #475569;
                }

                .cv-link:hover {
                    background: #e2e8f0;
                    color: #1e293b;
                }

                .cv-download {
                    background: #e9496c;
                    color: white;
                }

                .cv-download:hover {
                    background: #d63d5c;
                }


                .detail-item label {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-bottom: 0.25rem;
                }

                .detail-item p {
                    color: #1e293b;
                    font-size: 0.95rem;
                    margin: 0;
                }

                .detail-item a {
                    color: #e9496c;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.3rem;
                }

                .detail-item a:hover {
                    text-decoration: underline;
                }

                .cover-letter {
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    font-size: 0.95rem;
                    line-height: 1.6;
                    color: #475569;
                }

                .not-provided {
                    color: #94a3b8;
                    font-style: italic;
                }

                .status-select {
                    padding: 0.5rem;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.375rem;
                    font-size: 0.9rem;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .application-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }

                    .app-actions {
                        width: 100%;
                        justify-content: flex-end;
                    }

                    .detail-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}
