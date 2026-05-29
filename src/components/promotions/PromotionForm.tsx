"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const discountTypes = [
  "HAPPY_HOUR",
  "STUDENT_DISCOUNT",
  "LADIES_NIGHT",
  "THEME_NIGHT",
  "DRINK_SPECIAL",
  "COVER_DISCOUNT",
  "VIP_OFFER",
];

export function PromotionForm({
  barSlug,
  initial,
}: {
  barSlug: string;
  initial?: any;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(
    initial?.description || ""
  );
  const [discountType, setDiscountType] = useState(
    initial?.discountType || "HAPPY_HOUR"
  );
  const [startDate, setStartDate] = useState(
    initial?.startDate
      ? new Date(initial.startDate).toISOString().slice(0, 16)
      : ""
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate
      ? new Date(initial.endDate).toISOString().slice(0, 16)
      : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const url = isEdit
      ? `/api/bar/${barSlug}/promotions/${initial.id}`
      : `/api/bar/${barSlug}/promotions`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        discountType,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      }),
    });
    if (res.ok) {
      router.push(`/dashboard/${barSlug}/promotions`);
    } else {
      const d = await res.json();
      setError(d.error || "Failed");
    }
    setSaving(false);
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

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        maxWidth: "560px",
      }}
    >
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          margin: 0,
        }}
      >
        {isEdit ? "Edit Promotion" : "Create Promotion"}
      </h1>
      <div>
        <label style={labelStyle}>Title *</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={60}
          required
        />
      </div>
      <div>
        <label style={labelStyle}>Discount Type</label>
        <select
          style={inputStyle}
          value={discountType}
          onChange={(e) => setDiscountType(e.target.value)}
        >
          {discountTypes.map((t) => (
            <option key={t} value={t}>
              {t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "14px",
        }}
      >
        <div>
          <label style={labelStyle}>Start *</label>
          <input
            type="datetime-local"
            style={inputStyle}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>End *</label>
          <input
            type="datetime-local"
            style={inputStyle}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
      </div>
      {error && (
        <p style={{ color: "#ef4444", fontSize: "12px" }}>{error}</p>
      )}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          type="submit"
          disabled={saving}
          style={{
            flex: 1,
            padding: "12px",
            background: "#7c3aed",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          {saving
            ? "Saving..."
            : isEdit
            ? "Save Changes"
            : "Create Promotion"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            padding: "12px 20px",
            background: "transparent",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-card-border, #262626)",
            borderRadius: "10px",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
