"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminBarsPage() {
  const [bars, setBars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/bars")
      .then((r) => r.json())
      .then((data) => {
        setBars(data);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
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
          Bars
        </h1>
        <Link
          href="/admin/bars/create"
          style={{
            padding: "10px 18px",
            background: "#7c3aed",
            color: "#fff",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "13px",
          }}
        >
          + Add Bar
        </Link>
      </div>

      {loading ? (
        <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>
      ) : bars.length === 0 ? (
        <p style={{ color: "var(--color-text-muted, #737373)" }}>No bars yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {bars.map((bar: any) => (
            <div
              key={bar.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "12px",
              }}
            >
              <div>
                <div
                  style={{
                    color: "var(--color-text-primary, #fff)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  {bar.name}
                </div>
                <div
                  style={{
                    color: "var(--color-text-muted, #737373)",
                    fontSize: "11px",
                  }}
                >
                  {bar.address || "No address"} &middot;{" "}
                  {bar.isActive ? "Active" : "Inactive"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "4px" }}>
                {bar.isActive && (
                  <span
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      color: "#10b981",
                      fontSize: "10px",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontWeight: 600,
                    }}
                  >
                    Active
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
