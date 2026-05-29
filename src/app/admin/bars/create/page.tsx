"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateBarPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      address: form.address,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      description: form.description || null,
      latitude: form.latitude ? parseFloat(form.latitude) : 0,
      longitude: form.longitude ? parseFloat(form.longitude) : 0,
    };

    const res = await fetch("/api/admin/bars", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/admin/bars");
    } else {
      const d = await res.json();
      setError(d.error || "Failed to create bar");
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
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary, #a3a3a3)",
    fontSize: "12px",
    fontWeight: 600,
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div style={{ maxWidth: "560px" }}>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "20px",
        }}
      >
        Add Bar
      </h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
      >
        <div>
          <label style={labelStyle}>Name *</label>
          <input
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Address</label>
          <input
            style={inputStyle}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Latitude</label>
            <input
              style={inputStyle}
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              placeholder="60.1699"
            />
          </div>
          <div>
            <label style={labelStyle}>Longitude</label>
            <input
              style={inputStyle}
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              placeholder="24.9384"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input
              style={inputStyle}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              style={inputStyle}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Website</label>
          <input
            style={inputStyle}
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://"
          />
        </div>

        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {error && <p style={{ color: "#ef4444", fontSize: "12px" }}>{error}</p>}

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
            {saving ? "Creating..." : "Create Bar"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: "12px 20px",
              background: "transparent",
              color: "var(--color-text-secondary, #a3a3a3)",
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
    </div>
  );
}
