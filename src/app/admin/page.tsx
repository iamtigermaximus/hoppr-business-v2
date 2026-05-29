"use client";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "8px",
        }}
      >
        Admin Dashboard
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Manage bars, users, and platform settings.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { label: "Manage Bars", href: "/admin/bars", color: "#7c3aed" },
          { label: "Users", href: "/admin/users", color: "#3b82f6" },
          { label: "Analytics", href: "/admin/analytics", color: "#10b981" },
          { label: "Settings", href: "/admin/settings", color: "#f59e0b" },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
                padding: "24px 18px",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ color: item.color, fontWeight: 700, fontSize: "16px" }}>
                {item.label}
              </div>
              <div
                style={{
                  color: "var(--color-text-muted, #737373)",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Click to manage
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
