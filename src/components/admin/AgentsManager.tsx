"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { saveAgents, type AgentItem } from "@/actions/agentActions";

interface AgentsManagerProps {
  initialAgents: AgentItem[];
}

export default function AgentsManager({ initialAgents }: AgentsManagerProps) {
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const updateAgent = (id: string, field: keyof AgentItem, value: string | boolean | number) => {
    setAgents((prev) =>
      prev.map((agent) => (agent.id === id ? { ...agent, [field]: value } : agent))
    );
  };

  const addAgent = () => {
    setAgents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        name_ar: "",
        logo: "",
        order: prev.length,
        isActive: true,
      },
    ]);
  };

  const removeAgent = (id: string) => {
    setAgents((prev) =>
      prev
        .filter((agent) => agent.id !== id)
        .map((agent, index) => ({ ...agent, order: index }))
    );
  };

  const handleSave = () => {
    setMessage("");
    startTransition(async () => {
      try {
        const saved = await saveAgents(agents);
        setAgents(saved);
        setMessage("تم حفظ الوكلاء بنجاح");
      } catch (error) {
        setMessage("تعذر حفظ الوكلاء");
      }
    });
  };

  const handleAgentImageUpload = async (agentId: string, file?: File) => {
    if (!file) return;

    setUploadingId(agentId);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data?.url) {
        throw new Error("upload_failed");
      }

      updateAgent(agentId, "logo", data.url as string);
      setMessage("تم رفع صورة الوكيل بنجاح");
    } catch {
      setMessage("تعذر رفع الصورة");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: "2rem", maxWidth: "1100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0 }}>إدارة الوكلاء</h2>
        <button type="button" className="btn btn-outline" onClick={addAgent}>
          إضافة وكيل
        </button>
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {agents.map((agent, index) => (
          <div
            key={agent.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              padding: "1rem",
              display: "grid",
              gap: "1rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <input
                className="input"
                placeholder="اسم الوكيل (EN)"
                value={agent.name}
                onChange={(e) => updateAgent(agent.id, "name", e.target.value)}
              />
              <input
                className="input"
                dir="rtl"
                placeholder="اسم الوكيل (AR)"
                value={agent.name_ar || ""}
                onChange={(e) => updateAgent(agent.id, "name_ar", e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: "1rem", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "96px",
                    height: "56px",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--border)",
                    background: "#f8fafc",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {agent.logo ? (
                    <div style={{ position: "relative", width: "100%", height: "100%" }}>
                      <Image
                        src={agent.logo}
                        alt={agent.name || "agent-logo"}
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>No image</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <label className="btn btn-outline" style={{ cursor: "pointer" }}>
                    {uploadingId === agent.id ? "جارٍ الرفع..." : "رفع صورة"}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      disabled={uploadingId === agent.id}
                      onChange={(e) => handleAgentImageUpload(agent.id, e.target.files?.[0])}
                    />
                  </label>
                  {agent.logo && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => updateAgent(agent.id, "logo", "")}
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
              </div>
              <input
                className="input"
                type="number"
                style={{ width: "90px" }}
                value={agent.order}
                onChange={(e) => updateAgent(agent.id, "order", Number(e.target.value))}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  checked={agent.isActive}
                  onChange={(e) => updateAgent(agent.id, "isActive", e.target.checked)}
                />
                نشط
              </label>
              <button type="button" className="btn btn-outline" onClick={() => removeAgent(agent.id)}>
                حذف
              </button>
            </div>

            <small style={{ color: "#64748b" }}>#{index + 1}</small>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isPending}>
          {isPending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
        {message && <span style={{ color: "#475569", fontWeight: 600 }}>{message}</span>}
      </div>
    </div>
  );
}
