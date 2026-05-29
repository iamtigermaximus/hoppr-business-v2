"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClaimPage() {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--color-bg, #0a0a0a)", textAlign: "center" }}>
      <h1 style={{ fontWeight: 800, fontSize: "28px", color: "var(--color-text-primary, #fff)", marginBottom: "8px" }}>Claim Your Bar</h1>
      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px", maxWidth: "400px", marginBottom: "32px" }}>Own or manage a bar? Claim it on Hoppr to create promotions, sell VIP passes, and reach more customers.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%", maxWidth: "320px" }}>
        <Link href="/claim/search" style={{ padding: "14px 24px", background: "#7c3aed", color: "#fff", borderRadius: "12px", textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Search for your bar</Link>
        <Link href="/claim/add" style={{ padding: "14px 24px", background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px", textDecoration: "none", fontWeight: 600, fontSize: "15px" }}>Add a new bar</Link>
      </div>
      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "24px" }}>
        Already have an account? <Link href="/login" style={{ color: "#7c3aed" }}>Sign in</Link>
      </p>
    </div>
  );
}
