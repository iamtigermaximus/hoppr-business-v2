"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, Pencil, Trash, Copy } from "@phosphor-icons/react";

const passTypes: Record<string, { label: string; color: string }> = {
  SKIP_LINE: { label: "Skip Line", color: "#3b82f6" },
  VIP_TABLE: { label: "VIP Table", color: "#f59e0b" },
  DRINK_PACKAGE: { label: "Drink Package", color: "#10b981" },
  COVER_CHARGE: { label: "Cover Charge", color: "#8b5cf6" },
  BOTTLE_SERVICE: { label: "Bottle Service", color: "#e1306c" },
  GUEST_LIST: { label: "Guest List", color: "#06b6d4" },
};

export default function PassesListPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const router = useRouter();
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPasses = () => {
    fetch(`/api/bar/${barSlug}/passes`)
      .then((r) => r.json())
      .then((d) => {
        setPasses(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPasses();
  }, [barSlug]);

  const toggleActive = async (p: any) => {
    const res = await fetch(`/api/bar/${barSlug}/passes/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    if (res.ok) fetchPasses();
  };

  const handleDelete = async (p: any) => {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/bar/${barSlug}/passes/${p.id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchPasses();
  };

  const handleDuplicate = async (p: any) => {
    const res = await fetch(`/api/bar/${barSlug}/passes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${p.title} (Copy)`,
        description: p.description,
        price: p.price,
        type: p.type,
        originalPrice: p.originalPrice,
        maxPerUser: p.maxPerUser,
        benefits: p.benefits,
        validFrom: p.validFrom,
        validUntil: p.validUntil,
        maxQuantity: p.maxQuantity,
        isActive: false,
      }),
    });
    if (res.ok) fetchPasses();
  };

  const cardStyle: React.CSSProperties = {
    padding: "18px 20px",
    background: "var(--color-card, #1a1a1a)",
    border: "1px solid var(--color-card-border, #262626)",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    background: "var(--color-input-bg, #1a1a1a)",
    border: "1px solid var(--color-input-border, #262626)",
    borderRadius: "10px",
    color: "var(--color-text-primary, #fff)",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary, #a3a3a3)",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
    display: "block",
  };

  if (loading) {
    return (
      <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
          VIP Passes
        </h1>
        <Link
          href={`/dashboard/${barSlug}/passes/create`}
          style={{ padding: "10px 18px", background: "#7c3aed", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "13px" }}
        >
          + New Pass
        </Link>
      </div>

      {passes.length === 0 ? (
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>
          No passes yet. Create your first VIP pass!
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {passes.map((p: any) => {
            const pt = passTypes[p.type] || { label: (p.type || "SKIP_LINE").replace(/_/g, " "), color: "#737373" };
            const redemptionCount = p.redemptions?.length || 0;
            const redemptionRate = p.soldQuantity > 0 ? ((redemptionCount / p.soldQuantity) * 100).toFixed(1) : "0";
            const available = p.maxQuantity ? Math.max(0, p.maxQuantity - p.soldQuantity) : "Unlimited";

            return (
              <div key={p.id} style={cardStyle}>
                {/* Top row: title + type badge + price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "15px" }}>
                        {p.title}
                      </span>
                      <span style={{
                        background: `${pt.color}18`, color: pt.color, fontSize: "10px", fontWeight: 700,
                        padding: "3px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.5px",
                      }}>
                        {pt.label}
                      </span>
                    </div>
                    {p.description && (
                      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "4px", marginBottom: 0 }}>
                        {p.description.length > 120 ? p.description.slice(0, 120) + "..." : p.description}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", textDecoration: "line-through" }}>
                          EUR {p.originalPrice}
                        </span>
                      )}
                      <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "18px" }}>
                        EUR {p.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                  <div>
                    <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Sold </span>
                    <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "13px" }}>{p.soldQuantity}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Available </span>
                    <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "13px" }}>{available}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Redemption </span>
                    <span style={{ color: "#10b981", fontWeight: 600, fontSize: "13px" }}>{redemptionRate}%</span>
                  </div>
                </div>

                {/* Valid dates */}
                <div style={{ fontSize: "11px", color: "var(--color-text-muted, #737373)" }}>
                  {new Date(p.validFrom).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - {new Date(p.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>

                {/* Actions row */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--color-card-border, #262626)", paddingTop: "10px" }}>
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(p)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      border: "none",
                      fontWeight: 600,
                      fontSize: "11px",
                      cursor: "pointer",
                      background: p.isActive ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                      color: p.isActive ? "#10b981" : "#ef4444",
                    }}
                  >
                    {p.isActive ? "Active" : "Inactive"}
                  </button>

                  <div style={{ flex: 1 }} />

                  <button
                    onClick={() => router.push(`/dashboard/${barSlug}/passes/${p.id}/edit`)}
                    style={{ padding: "6px 10px", background: "transparent", color: "var(--color-text-secondary, #a3a3a3)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}
                  >
                    <Pencil size={12} /> Edit
                  </button>

                  <button
                    onClick={() => handleDuplicate(p)}
                    style={{ padding: "6px 10px", background: "transparent", color: "var(--color-text-secondary, #a3a3a3)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}
                  >
                    <Copy size={12} /> Duplicate
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    style={{ padding: "6px 10px", background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500 }}
                  >
                    <Trash size={12} /> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
