"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

function getFilenameFromContentDisposition(headerValue: string | null): string | null {
    if (!headerValue) return null;
    const match = /filename\*?=(?:UTF-8''|")?([^\";]+)"?/i.exec(headerValue);
    if (!match) return null;
    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

export default function AdminBackupPage() {
    const t = useTranslations("AdminBackup");
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const canImport = useMemo(() => !isImporting && !!selectedFile, [isImporting, selectedFile]);

    const downloadBackup = async () => {
        setError(null);
        setMessage(null);
        setIsExporting(true);
        try {
            const res = await fetch("/api/backup/export", { method: "GET" });
            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "Failed to export backup");
            }

            const blob = await res.blob();
            const filename =
                getFilenameFromContentDisposition(res.headers.get("content-disposition")) ||
                `kint-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.zip`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            setMessage(filename);
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsExporting(false);
        }
    };

    const restoreBackup = async () => {
        if (!selectedFile) return;
        setError(null);
        setMessage(null);
        setIsImporting(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await fetch("/api/backup/import", {
                method: "POST",
                body: formData,
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) {
                const msg = (data && (data.error || data.message)) || "Failed to restore backup";
                throw new Error(msg);
            }

            setSelectedFile(null);
            setMessage("OK");
        } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        } finally {
            setIsImporting(false);
        }
    };

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
                            onClick={downloadBackup}
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
                            onClick={restoreBackup}
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

