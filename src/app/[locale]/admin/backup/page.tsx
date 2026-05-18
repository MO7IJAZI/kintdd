"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export default function AdminBackupPage() {
    const t = useTranslations("AdminBackup");
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [exportJobId, setExportJobId] = useState<string | null>(null);
    const [exportPercent, setExportPercent] = useState(0);
    const [exportStage, setExportStage] = useState<string | null>(null);
    const [importJobId, setImportJobId] = useState<string | null>(null);
    const [importPercent, setImportPercent] = useState(0);
    const [importStage, setImportStage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canImport = useMemo(() => !isImporting && !!selectedFile, [isImporting, selectedFile]);
    const exportKey = "kintBackupExportJobId";
    const importKey = "kintBackupImportJobId";

    const stageLabel = (stage: string | null) => {
        if (!stage) return null;
        const map: Record<string, string> = {
            QUEUED: t("stageQueued"),
            MIGRATING: t("stageMigrating"),
            PREPARING_DB: t("stagePreparingDb"),
            ZIPPING: t("stageZipping"),
            FINALIZING: t("stageFinalizing"),
            UPLOADING: t("stageUploading"),
            EXTRACTING: t("stageExtracting"),
            RESTORING_DB: t("stageRestoringDb"),
            REPLACING_FILES: t("stageReplacingFiles"),
            CLEANUP: t("stageCleanup"),
            DONE: t("stageDone"),
            ERROR: t("stageError"),
        };
        return map[stage] || stage;
    };

    const startExport = async () => {
        setError(null);
        setMessage(null);
        setIsExporting(true);
        setExportPercent(0);
        setExportStage(null);
        try {
            const res = await fetch("/api/backup/export/start", { method: "POST" });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.jobId) {
                throw new Error((data && (data.error || data.message)) || "Failed to start export");
            }
            const id = String(data.jobId);
            try {
                window.localStorage.setItem(exportKey, id);
            } catch {}
            setExportJobId(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setIsExporting(false);
        }
    };

    const startImport = async () => {
        if (!selectedFile) return;
        setError(null);
        setMessage(null);
        setIsImporting(true);
        setImportPercent(0);
        setImportStage(null);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("/api/backup/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.jobId) {
                const msg = (data && (data.error || data.message)) || "Failed to start restore";
                throw new Error(msg);
            }
            const id = String(data.jobId);
            try {
                window.localStorage.setItem(importKey, id);
            } catch {}
            setImportJobId(id);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setIsImporting(false);
        }
    };

    useEffect(() => {
        try {
            const storedExport = window.localStorage.getItem(exportKey);
            if (storedExport) {
                setIsExporting(true);
                setExportJobId(storedExport);
            }
            const storedImport = window.localStorage.getItem(importKey);
            if (storedImport) {
                setIsImporting(true);
                setImportJobId(storedImport);
            }
        } catch {}
    }, []);

    useEffect(() => {
        if (!exportJobId) return;
        let cancelled = false;
        const interval = window.setInterval(async () => {
            try {
                const res = await fetch(`/api/backup/export/status?jobId=${encodeURIComponent(exportJobId)}`, {
                    cache: "no-store",
                });
                const job = await res.json().catch(() => null);
                if (!res.ok || !job) throw new Error((job && (job.error || job.message)) || "Export status failed");
                if (cancelled) return;
                setExportPercent(Number(job.percent) || 0);
                setExportStage(job.stage || null);

                if (job.status === "done") {
                    window.clearInterval(interval);
                    setIsExporting(false);
                    try {
                        window.localStorage.removeItem(exportKey);
                    } catch {}
                    setExportJobId(null);
                    window.location.href = `/api/backup/export/download?jobId=${encodeURIComponent(exportJobId)}`;
                    setMessage(job.filename || "OK");
                }
                if (job.status === "error") {
                    window.clearInterval(interval);
                    setIsExporting(false);
                    try {
                        window.localStorage.removeItem(exportKey);
                    } catch {}
                    setExportJobId(null);
                    setError(job.error || "Export failed");
                }
            } catch (e) {
                if (cancelled) return;
                window.clearInterval(interval);
                setIsExporting(false);
                try {
                    window.localStorage.removeItem(exportKey);
                } catch {}
                setExportJobId(null);
                setError(e instanceof Error ? e.message : String(e));
            }
        }, 600);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [exportJobId]);

    useEffect(() => {
        if (!importJobId) return;
        let cancelled = false;
        const interval = window.setInterval(async () => {
            try {
                const res = await fetch(`/api/backup/import/status?jobId=${encodeURIComponent(importJobId)}`, {
                    cache: "no-store",
                });
                const job = await res.json().catch(() => null);
                if (!res.ok || !job) throw new Error((job && (job.error || job.message)) || "Import status failed");
                if (cancelled) return;
                setImportPercent(Number(job.percent) || 0);
                setImportStage(job.stage || null);

                if (job.status === "done") {
                    window.clearInterval(interval);
                    setIsImporting(false);
                    try {
                        window.localStorage.removeItem(importKey);
                    } catch {}
                    setImportJobId(null);
                    setSelectedFile(null);
                    setMessage("OK");
                }
                if (job.status === "error") {
                    window.clearInterval(interval);
                    setIsImporting(false);
                    try {
                        window.localStorage.removeItem(importKey);
                    } catch {}
                    setImportJobId(null);
                    setError(job.error || "Restore failed");
                }
            } catch (e) {
                if (cancelled) return;
                window.clearInterval(interval);
                setIsImporting(false);
                try {
                    window.localStorage.removeItem(importKey);
                } catch {}
                setImportJobId(null);
                setError(e instanceof Error ? e.message : String(e));
            }
        }, 700);

        return () => {
            cancelled = true;
            window.clearInterval(interval);
        };
    }, [importJobId]);

    return (
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>{t("title")}</h1>
                <p style={{ color: "#475569" }}>{t("description")}</p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "1rem",
                }}
            >
                <div
                    style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "1.25rem",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                        <div>
                            <div style={{ fontWeight: 800, marginBottom: "0.25rem" }}>{t("exportButton")}</div>
                            <div style={{ fontSize: "0.875rem", color: "#64748b" }}>
                                {isExporting ? t("exporting") : null}
                            </div>
                        </div>
                        <button
                            onClick={startExport}
                            disabled={isExporting}
                            style={{
                                padding: "0.75rem 1rem",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: isExporting ? "#f1f5f9" : "var(--primary)",
                                color: isExporting ? "#64748b" : "white",
                                cursor: isExporting ? "not-allowed" : "pointer",
                                fontWeight: 700,
                                minWidth: 220,
                            }}
                        >
                            {isExporting ? t("exporting") : t("exportButton")}
                        </button>
                    </div>
                    {isExporting && (
                        <div style={{ marginTop: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#475569" }}>
                                <div>{stageLabel(exportStage)}</div>
                                <div>{Math.min(100, Math.max(0, exportPercent))}%</div>
                            </div>
                            <div style={{ height: 10, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${Math.min(100, Math.max(0, exportPercent))}%`,
                                        background: "var(--primary)",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div
                    style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 12,
                        padding: "1.25rem",
                    }}
                >
                    <div style={{ fontWeight: 800, marginBottom: "0.5rem" }}>{t("importTitle")}</div>
                    <div style={{ color: "#b91c1c", fontWeight: 700, marginBottom: "0.75rem" }}>{t("warning")}</div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
                        <label
                            style={{
                                padding: "0.75rem 1rem",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: "#f8fafc",
                                cursor: isImporting ? "not-allowed" : "pointer",
                                fontWeight: 700,
                            }}
                        >
                            {t("chooseFile")}
                            <input
                                type="file"
                                accept=".zip,application/zip"
                                disabled={isImporting}
                                style={{ display: "none" }}
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                        </label>

                        <div style={{ flex: 1, minWidth: 240, color: "#334155" }}>
                            {selectedFile ? selectedFile.name : null}
                        </div>

                        <button
                            onClick={startImport}
                            disabled={!canImport}
                            style={{
                                padding: "0.75rem 1rem",
                                borderRadius: 10,
                                border: "1px solid #e2e8f0",
                                background: !canImport ? "#f1f5f9" : "#0f172a",
                                color: !canImport ? "#64748b" : "white",
                                cursor: !canImport ? "not-allowed" : "pointer",
                                fontWeight: 800,
                                minWidth: 220,
                            }}
                        >
                            {isImporting ? t("importing") : t("importButton")}
                        </button>
                    </div>
                    {isImporting && (
                        <div style={{ marginTop: "0.75rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "#475569" }}>
                                <div>{stageLabel(importStage)}</div>
                                <div>{Math.min(100, Math.max(0, importPercent))}%</div>
                            </div>
                            <div style={{ height: 10, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                                <div
                                    style={{
                                        height: "100%",
                                        width: `${Math.min(100, Math.max(0, importPercent))}%`,
                                        background: "#0f172a",
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {(error || message) && (
                    <div
                        style={{
                            background: error ? "#fef2f2" : "#f0fdf4",
                            border: `1px solid ${error ? "#fecaca" : "#bbf7d0"}`,
                            borderRadius: 12,
                            padding: "1rem 1.25rem",
                            color: error ? "#991b1b" : "#166534",
                            fontWeight: 700,
                        }}
                    >
                        {error ? error : message}
                    </div>
                )}
            </div>
        </div>
    );
}
