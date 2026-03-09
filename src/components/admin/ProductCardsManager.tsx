"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { updateProductCardMedia } from "@/actions/productCardActions";

interface ProductCardItem {
  id: string;
  slug: string;
  name: string;
  name_ar?: string | null;
  image?: string | null;
  icon?: string | null;
  parent?: {
    slug: string;
    name: string;
    name_ar?: string | null;
  } | null;
}

interface ProductCardsManagerProps {
  initialCards: ProductCardItem[];
}

export default function ProductCardsManager({ initialCards }: ProductCardsManagerProps) {
  const [cards, setCards] = useState(initialCards);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);
  const [uploadingIconId, setUploadingIconId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const updateLocalCard = (id: string, patch: Partial<ProductCardItem>) => {
    setCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...patch } : card)));
  };

  const uploadCardImage = async (id: string, file?: File) => {
    if (!file) return;
    setUploadingImageId(id);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data?.url) throw new Error("upload failed");
      updateLocalCard(id, { image: data.url });
      setMessage("تم رفع الصورة بنجاح");
    } catch {
      setMessage("تعذر رفع الصورة");
    } finally {
      setUploadingImageId(null);
    }
  };

  const uploadCardIcon = async (id: string, file?: File) => {
    if (!file) return;
    setUploadingIconId(id);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data?.url) throw new Error("upload failed");
      updateLocalCard(id, { icon: data.url });
      setMessage("تم رفع الأيقونة بنجاح");
    } catch {
      setMessage("تعذر رفع الأيقونة");
    } finally {
      setUploadingIconId(null);
    }
  };

  const saveCard = (card: ProductCardItem) => {
    setMessage("");
    setSavingId(card.id);
    startTransition(async () => {
      try {
        await updateProductCardMedia(card.id, {
          image: card.image || "",
          icon: card.icon || "",
        });
        setMessage("تم حفظ التعديلات بنجاح");
      } catch {
        setMessage("تعذر حفظ التعديلات");
      } finally {
        setSavingId(null);
      }
    });
  };

  return (
    <div className="card" style={{ padding: "2rem", maxWidth: "1200px" }}>
      <h2 style={{ marginTop: 0, marginBottom: "1.25rem" }}>تعديل صور وأيقونات بطاقات الصفحات</h2>
      <div style={{ display: "grid", gap: "1rem" }}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {card.name} / {card.name_ar || card.name}
            </div>
            <div style={{ color: "#64748b", fontSize: "0.9rem" }}>
              {card.parent?.name || ""} • slug: {card.slug}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "1rem", alignItems: "center" }}>
              <div
                style={{
                  width: "120px",
                  height: "80px",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--border)",
                  background: "#f8fafc",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {card.image ? (
                  <Image src={card.image} alt={card.name} fill style={{ objectFit: "cover" }} />
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                  {uploadingImageId === card.id ? "جارٍ الرفع..." : "رفع صورة"}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImageId === card.id}
                    style={{ display: "none" }}
                    onChange={(e) => uploadCardImage(card.id, e.target.files?.[0])}
                  />
                </label>
                {card.image && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => updateLocalCard(card.id, { image: "" })}
                  >
                    إزالة الصورة
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontWeight: 600 }}>أيقونة البطاقة:</label>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "999px",
                  border: "1px solid var(--border)",
                  background: "#f8fafc",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {card.icon ? (
                  <Image src={card.icon} alt={`${card.name}-icon`} fill style={{ objectFit: "cover" }} />
                ) : null}
              </div>
              <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                {uploadingIconId === card.id ? "جارٍ رفع الأيقونة..." : "رفع أيقونة"}
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingIconId === card.id}
                  style={{ display: "none" }}
                  onChange={(e) => uploadCardIcon(card.id, e.target.files?.[0])}
                />
              </label>
              {card.icon && (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => updateLocalCard(card.id, { icon: "" })}
                >
                  إزالة الأيقونة
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => saveCard(card)}
                disabled={isPending || savingId === card.id}
              >
                {savingId === card.id ? "جارٍ الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {message && <div style={{ marginTop: "1rem", color: "#475569", fontWeight: 600 }}>{message}</div>}
    </div>
  );
}
