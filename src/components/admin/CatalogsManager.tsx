"use client";

import { useState } from "react";
import { createCatalog, updateCatalog, deleteCatalog } from "@/actions/catalogActions";
import { Plus, Trash2, Edit2, Download } from "lucide-react";

interface Catalog {
    id: string;
    title: string;
    title_ar?: string | null;
    description?: string | null;
    description_ar?: string | null;
    fileUrl: string;
    category: string;
    order: number;
    isActive: boolean;
}

export default function CatalogsManager({
    initialCatalogs = [],
}: {
    initialCatalogs?: Catalog[];
}) {
    const [catalogs, setCatalogs] = useState<Catalog[]>(initialCatalogs);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        title_ar: "",
        description: "",
        description_ar: "",
        fileUrl: "",
        category: "agricultural",
        order: 0,
        isActive: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "order" ? parseInt(value) || 0 : val,
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setFormData(prev => ({ ...prev, fileUrl: data.url }));
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("File upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddCatalog = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataObj = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataObj.append(key, String(value));
            });

            const newCatalog = await createCatalog(formDataObj);
            // Add the new catalog to the local state for live refresh
            setCatalogs(prev => [...prev, { ...newCatalog, isActive: true }]);
            setFormData({
                title: "",
                title_ar: "",
                description: "",
                description_ar: "",
                fileUrl: "",
                category: "agricultural",
                order: catalogs.length + 1,
                isActive: true,
            });
        } catch (error) {
            console.error("Error creating catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCatalog = async (e: React.FormEvent) => {
        if (!editingId) return;
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataObj = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                formDataObj.append(key, String(value));
            });

            const updatedCatalog = await updateCatalog(editingId, formDataObj);
            // Update the catalog in local state for live refresh
            setCatalogs(prev => prev.map(c => c.id === editingId ? updatedCatalog : c));
            setEditingId(null);
            setFormData({
                title: "",
                title_ar: "",
                description: "",
                description_ar: "",
                fileUrl: "",
                category: "agricultural",
                order: 0,
                isActive: true,
            });
        } catch (error) {
            console.error("Error updating catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditCatalog = (catalog: Catalog) => {
        setEditingId(catalog.id);
        setFormData({
            title: catalog.title,
            title_ar: catalog.title_ar || "",
            description: catalog.description || "",
            description_ar: catalog.description_ar || "",
            fileUrl: catalog.fileUrl,
            category: catalog.category,
            order: catalog.order,
            isActive: catalog.isActive,
        });
    };

    const handleDeleteCatalog = async (id: string) => {
        if (!confirm("Are you sure you want to delete this catalog?")) return;
        setIsLoading(true);

        try {
            await deleteCatalog(id);
            // Remove the catalog from local state for live refresh
            setCatalogs(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting catalog:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ marginTop: "2rem" }}>
            {/* Form */}
            <form onSubmit={editingId ? handleUpdateCatalog : handleAddCatalog} style={{ marginBottom: "2rem", padding: "2rem", backgroundColor: "#f8fafc", borderRadius: "1rem", border: "1px solid #e2e8f0" }}>
                <h3 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 700 }}>
                    {editingId ? "Edit Catalog" : "Add New Catalog"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                    <input
                        type="text"
                        name="title"
                        placeholder="Catalog Title (English)"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    />
                    <input
                        type="text"
                        name="title_ar"
                        placeholder="Catalog Title (Arabic)"
                        value={formData.title_ar}
                        onChange={handleInputChange}
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    />
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    >
                        <option value="agricultural">Agricultural</option>
                        <option value="animal">Animal / Veterinary</option>
                    </select>
                    <input
                        type="number"
                        name="order"
                        placeholder="Display Order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        style={{ padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 1
                            }}
                        />
                        <button
                            type="button"
                            disabled={isUploading}
                            className="btn btn-outline"
                            style={{ width: '100%', pointerEvents: 'none', textAlign: 'left', fontSize: '0.8rem' }}
                        >
                            {isUploading ? "UPLOADING..." : (formData.fileUrl ? "✅ FILE READY" : "📁 UPLOAD PDF")}
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                            type="checkbox"
                            name="isActive"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            style={{ width: '1.25rem', height: '1.25rem' }}
                        />
                        <label htmlFor="isActive" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Visible to Public</label>
                    </div>
                </div>

                <textarea
                    name="description"
                    placeholder="Description (English)"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", marginBottom: "1rem" }}
                />
                <textarea
                    name="description_ar"
                    placeholder="Description (Arabic)"
                    value={formData.description_ar}
                    onChange={handleInputChange}
                    rows={2}
                    style={{ width: "100%", padding: "0.75rem", border: "1px solid #e2e8f0", borderRadius: "0.5rem", marginBottom: "1rem" }}
                />

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: "0.75rem 1.5rem",
                            backgroundColor: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            fontWeight: 600,
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.6 : 1,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                        }}
                    >
                        <Plus size={18} />
                        {editingId ? "Update" : "Add Catalog"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditingId(null);
                                setFormData({
                                    title: "",
                                    title_ar: "",
                                    description: "",
                                    description_ar: "",
                                    fileUrl: "",
                                    category: "agricultural",
                                    order: 0,
                                    isActive: true,
                                });
                            }}
                            style={{
                                padding: "0.75rem 1.5rem",
                                backgroundColor: "#94a3b8",
                                color: "white",
                                border: "none",
                                borderRadius: "0.5rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Catalogs Table */}
            <div className="card" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Title</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Category</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Order</th>
                            <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {catalogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
                                    No catalogs found
                                </td>
                            </tr>
                        ) : (
                            catalogs.map((catalog) => (
                                <tr key={catalog.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ fontWeight: 600 }}>{catalog.title}</div>
                                        {catalog.title_ar && <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{catalog.title_ar}</div>}
                                    </td>
                                    <td style={{ padding: "1rem" }}>
                                        <span style={{
                                            backgroundColor: catalog.category === "agricultural" ? "rgba(34, 197, 94, 0.1)" : "rgba(59, 130, 246, 0.1)",
                                            color: catalog.category === "agricultural" ? "#22c55e" : "#3b82f6",
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: "1rem",
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                        }}>
                                            {catalog.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: "1rem" }}>{catalog.order}</td>
                                    <td style={{ padding: "1rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                            <a
                                                href={catalog.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    padding: "0.5rem",
                                                    backgroundColor: "#10b981",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    cursor: "pointer",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    textDecoration: "none",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                <Download size={14} />
                                            </a>
                                            <button
                                                onClick={() => handleEditCatalog(catalog)}
                                                style={{
                                                    padding: "0.5rem",
                                                    backgroundColor: "#3b82f6",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    cursor: "pointer",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCatalog(catalog.id)}
                                                disabled={isLoading}
                                                style={{
                                                    padding: "0.5rem",
                                                    backgroundColor: "#ef4444",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "0.5rem",
                                                    cursor: isLoading ? "not-allowed" : "pointer",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.25rem",
                                                    opacity: isLoading ? 0.6 : 1,
                                                    fontSize: "0.85rem",
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
