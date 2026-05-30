"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react";

const passTypes = [
  "SKIP_LINE",
  "VIP_TABLE",
  "DRINK_PACKAGE",
  "COVER_CHARGE",
  "BOTTLE_SERVICE",
  "GUEST_LIST",
];

export default function EditPassPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const passId = (params as any).id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passType, setPassType] = useState("SKIP_LINE");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");
  const [maxPerUser, setMaxPerUser] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [benefits, setBenefits] = useState<string[]>([""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/bar/${barSlug}/passes/${passId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setLoading(false); return; }
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPassType(data.type || "SKIP_LINE");
        setPrice(data.price != null ? String(data.price) : "");
        setOriginalPrice(data.originalPrice != null ? String(data.originalPrice) : "");
        setValidFrom(data.validFrom ? new Date(data.validFrom).toISOString().slice(0, 16) : "");
        setValidUntil(data.validUntil ? new Date(data.validUntil).toISOString().slice(0, 16) : "");
        setMaxQuantity(data.maxQuantity != null ? String(data.maxQuantity) : "");
        setMaxPerUser(data.maxPerUser != null ? String(data.maxPerUser) : "");
        setIsActive(data.isActive);
        setBenefits(data.benefits?.length ? data.benefits : [""]);
        setLoading(false);
      });
  }, [barSlug, passId]);

  const addBenefit = () => setBenefits([...benefits, ""]);
  const removeBenefit = (i: number) => {
    if (benefits.length === 1) return;
    setBenefits(benefits.filter((_, idx) => idx !== i));
  };
  const updateBenefit = (i: number, val: string) => {
    const b = [...benefits];
    b[i] = val;
    setBenefits(b);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!title || !price || !validFrom || !validUntil) {
      setError("Title, price, valid from, and valid until are required.");
      setSaving(false);
      return;
    }

    const res = await fetch(`/api/bar/${barSlug}/passes/${passId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        type: passType,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        maxPerUser: maxPerUser ? parseInt(maxPerUser) : null,
        benefits: benefits.filter((b) => b.trim() !== ""),
        validFrom: new Date(validFrom).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        maxQuantity: maxQuantity ? parseInt(maxQuantity) : null,
        isActive,
      }),
    });

    if (res.ok) {
      router.push(`/dashboard/${barSlug}/passes`);
    } else {
      const d = await res.json();
      setError(d.error || "Failed to update pass");
    }
    setSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    background: "var(--color-input-bg, #1a1a1a)",
    border: "1px solid var(--color-input-border, #262626)",
    borderRadius: "10px", color: "var(--color-text-primary, #fff)",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px",
    fontWeight: 600, marginBottom: "4px", display: "block",
  };

  if (loading) {
    return <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "560px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
        Edit VIP Pass
      </h1>

      <div>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required />
      </div>

      <div>
        <label style={labelStyle}>Pass Type</label>
        <select style={inputStyle} value={passType} onChange={(e) => setPassType(e.target.value)}>
          {passTypes.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Price (EUR) *</label>
          <input type="number" step="0.01" style={inputStyle} value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Original Price (EUR)</label>
          <input type="number" step="0.01" style={inputStyle} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Valid From *</label>
          <input type="datetime-local" style={inputStyle} value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Valid Until *</label>
          <input type="datetime-local" style={inputStyle} value={validUntil} onChange={(e) => setValidUntil(e.target.value)} required />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        <div>
          <label style={labelStyle}>Total Quantity</label>
          <input type="number" style={inputStyle} value={maxQuantity} onChange={(e) => setMaxQuantity(e.target.value)} placeholder="100" />
        </div>
        <div>
          <label style={labelStyle}>Max Per User</label>
          <input type="number" style={inputStyle} value={maxPerUser} onChange={(e) => setMaxPerUser(e.target.value)} placeholder="2" />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Benefits</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <input
                style={inputStyle}
                value={b}
                onChange={(e) => updateBenefit(i, e.target.value)}
                placeholder="e.g. Skip the line, free coat check"
              />
              <button type="button" onClick={() => removeBenefit(i)}
                style={{ padding: "6px", background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", cursor: "pointer", display: "flex", flexShrink: 0 }}>
                <Minus size={14} />
              </button>
            </div>
          ))}
          <button type="button" onClick={addBenefit}
            style={{ padding: "6px 12px", background: "transparent", color: "var(--color-text-secondary, #a3a3a3)", border: "1px dashed var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", alignSelf: "flex-start" }}>
            <Plus size={12} /> Add Benefit
          </button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <label style={{ ...labelStyle, marginBottom: 0 }}>Active</label>
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          style={{
            width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
            background: isActive ? "#10b981" : "#525252",
            position: "relative", transition: "background 0.2s",
          }}
        >
          <span style={{
            position: "absolute", top: "2px", left: isActive ? "22px" : "2px",
            width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
            transition: "left 0.2s",
          }} />
        </button>
      </div>

      {error && <p style={{ color: "#ef4444", fontSize: "12px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "10px" }}>
        <button type="submit" disabled={saving} style={{ flex: 1, padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button type="button" onClick={() => router.back()} style={{ padding: "12px 20px", background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
