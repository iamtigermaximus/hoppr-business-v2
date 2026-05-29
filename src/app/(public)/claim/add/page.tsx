"use client";
import { useState } from "react";
import Link from "next/link";

export default function ClaimAddPage() {
  const [form, setForm] = useState({ name: "", address: "", city: "", type: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/claim/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barName: form.name.trim(),
          barAddress: form.address.trim(),
          barCity: form.city.trim() || null,
          barType: form.type || null,
        }),
      });
      if (res.ok) {
        setMessage({ text: "Thanks! Our team will review your bar suggestion and add it to Hoppr.", type: "success" });
        setForm({ name: "", address: "", city: "", type: "" });
      } else {
        const err = await res.json();
        setMessage({ text: err.error || "Something went wrong.", type: "error" });
      }
    } catch {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "48px 24px 64px",
        maxWidth: "480px",
        margin: "0 auto",
        background: "var(--color-bg, #0a0a0a)",
      }}
    >
      <Link
        href="/claim"
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "13px",
          textDecoration: "none",
          marginBottom: "24px",
          display: "inline-block",
        }}
      >
        &larr; Back
      </Link>

      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "8px",
        }}
      >
        Add a New Bar
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Don&apos;t see your bar? Suggest it here and our team will add it to Hoppr.
      </p>

      {message && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            fontSize: "13px",
            background: message.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: message.type === "success" ? "#22c55e" : "#ef4444",
            border: `1px solid ${message.type === "success" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label
            style={{
              display: "block",
              color: "var(--color-text-secondary, #a3a3a3)",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Bar Name *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. The Tipsy Badger"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--color-card-border, #262626)",
              background: "var(--color-card, #141414)",
              color: "var(--color-text-primary, #fff)",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div>
          <label
            style={{
              display: "block",
              color: "var(--color-text-secondary, #a3a3a3)",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Address *
          </label>
          <input
            type="text"
            required
            placeholder="Street address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid var(--color-card-border, #262626)",
              background: "var(--color-card, #141414)",
              color: "var(--color-text-primary, #fff)",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <label
              style={{
                display: "block",
                color: "var(--color-text-secondary, #a3a3a3)",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              City
            </label>
            <input
              type="text"
              placeholder="e.g. Helsinki"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-card-border, #262626)",
                background: "var(--color-card, #141414)",
                color: "var(--color-text-primary, #fff)",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                color: "var(--color-text-secondary, #a3a3a3)",
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid var(--color-card-border, #262626)",
                background: "var(--color-card, #141414)",
                color: "var(--color-text-primary, #fff)",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            >
              <option value="">Select type</option>
              <option value="BAR">Bar</option>
              <option value="PUB">Pub</option>
              <option value="NIGHTCLUB">Nightclub</option>
              <option value="COCKTAIL_BAR">Cocktail Bar</option>
              <option value="SPORTS_BAR">Sports Bar</option>
              <option value="BREWERY">Brewery</option>
              <option value="WINE_BAR">Wine Bar</option>
              <option value="LOUNGE">Lounge</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "14px 24px",
            borderRadius: "12px",
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            fontWeight: 700,
            fontSize: "15px",
            cursor: submitting ? "not-allowed" : "pointer",
            opacity: submitting ? 0.6 : 1,
            marginTop: "4px",
          }}
        >
          {submitting ? "Submitting..." : "Submit Bar Suggestion"}
        </button>
      </form>
    </div>
  );
}
