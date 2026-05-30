"use client";
import Link from "next/link";

export default function LoginChoicePage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--color-bg, #0a0a0a)", gap: "16px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "28px", color: "var(--color-text-primary, #fff)", marginBottom: "8px" }}>Hoppr Business</h1>
      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px", marginBottom: "24px" }}>Choose your login</p>
      <Link href="/admin/login" style={{ padding: "16px 32px", background: "#7c3aed", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 600, fontSize: "16px", width: "100%", maxWidth: "300px", textAlign: "center" }}>Admin Login</Link>
      <Link href="/bar/login" style={{ padding: "16px 32px", background: "transparent", color: "var(--color-text-secondary, #737373)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px", textDecoration: "none", fontWeight: 600, fontSize: "16px", width: "100%", maxWidth: "300px", textAlign: "center" }}>Bar Manager Login</Link>
    </div>
  );
}
