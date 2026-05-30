"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function BarManagerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) { setError(res.error); setLoading(false); return; }
    // Check session for role
    const sessionRes = await fetch("/api/auth/session");
    const session = await sessionRes.json();
    if (session?.user?.role === "BAR_MANAGER" || session?.user?.role === "SUPER_ADMIN") router.push("/dashboard");
    else setError("Bar manager access only. Use admin login.");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--color-bg, #0a0a0a)" }}>
      <div style={{ background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "16px", padding: "32px", maxWidth: "400px", width: "100%" }}>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "4px", textAlign: "center" }}>Hoppr Business</h1>
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>Bar Manager</p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: "100%", padding: "12px 14px", background: "var(--color-input-bg, #1a1a1a)", border: "1px solid var(--color-input-border, #262626)", borderRadius: "10px", color: "var(--color-text-primary, #fff)", fontSize: "14px", outline: "none" }} />
          <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: "100%", padding: "12px 14px", background: "var(--color-input-bg, #1a1a1a)", border: "1px solid var(--color-input-border, #262626)", borderRadius: "10px", color: "var(--color-text-primary, #fff)", fontSize: "14px", outline: "none" }} />
          {error && <p style={{ color: "#ef4444", fontSize: "12px" }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "14px", cursor: "pointer" }}>{loading ? "Signing in..." : "Sign In as Bar Manager"}</button>
        </form>
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", textAlign: "center", marginTop: "16px" }}>
          Admin? <a href="/admin/login" style={{ color: "#7c3aed", textDecoration: "none" }}>Sign in here</a>
        </p>
      </div>
    </div>
  );
}
