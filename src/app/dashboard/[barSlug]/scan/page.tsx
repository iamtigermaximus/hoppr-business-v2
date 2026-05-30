"use client";
import { useState } from "react";
import { QrCode, Camera, Keyboard, CheckCircle, XCircle } from "@phosphor-icons/react";

export default function ScanPage() {
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const handleManualSubmit = async () => {
    if (!code.trim()) return;
    // Simulate redemption for MVP
    const success = Math.random() > 0.3;
    setResult({ success, message: success ? "Pass redeemed! Entry granted." : "Invalid or expired pass." });
    if (success) setRecentScans(prev => [{ time: new Date().toLocaleTimeString(), code: code.slice(0, 12) + "...", status: "Valid" }, ...prev].slice(0, 10));
    setCode("");
  };

  return (
    <div style={{ maxWidth: "500px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <QrCode size={24} color="#7c3aed" weight="fill" /> QR Scanner
      </h1>

      {/* Mode toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        {[{ m: "camera", label: "Camera", icon: Camera }, { m: "manual", label: "Manual Entry", icon: Keyboard }].map(m => (
          <button key={m.m} onClick={() => { setMode(m.m as any); setResult(null); }} style={{
            flex: 1, padding: "12px", borderRadius: "10px", border: mode === m.m ? "1px solid #7c3aed" : "1px solid var(--color-card-border, #262626)",
            background: mode === m.m ? "rgba(124,58,237,0.1)" : "var(--color-card, #1a1a1a)",
            color: mode === m.m ? "#7c3aed" : "var(--color-text-secondary)", cursor: "pointer", fontSize: "13px", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
          }}><m.icon size={16} /> {m.label}</button>
        ))}
      </div>

      {mode === "camera" ? (
        <div style={{ padding: "40px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px", textAlign: "center" }}>
          <div style={{ width: "200px", height: "200px", margin: "0 auto 16px", border: "2px dashed var(--color-card-border, #262626)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Camera size={48} color="var(--color-text-muted, #737373)" />
          </div>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px" }}>Camera feed placeholder</p>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", marginTop: "4px" }}>Browser camera API available for production</p>
        </div>
      ) : (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter QR code or pass ID" onKeyDown={e => e.key === "Enter" && handleManualSubmit()}
            style={{ flex: 1, padding: "12px 14px", borderRadius: "10px", background: "var(--color-input-bg)", border: "1px solid var(--color-input-border)", color: "var(--color-text-primary)", fontSize: "14px", outline: "none" }} />
          <button onClick={handleManualSubmit} style={{ padding: "12px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, cursor: "pointer" }}>Redeem</button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ padding: "16px", borderRadius: "12px", background: result.success ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${result.success ? "#10b98144" : "#ef444444"}`, marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          {result.success ? <CheckCircle size={24} color="#10b981" weight="fill" /> : <XCircle size={24} color="#ef4444" weight="fill" />}
          <div>
            <div style={{ color: result.success ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: "14px" }}>{result.message}</div>
          </div>
        </div>
      )}

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
          <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "12px" }}>Recent Redemptions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {recentScans.map((scan, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                <span style={{ color: "var(--color-text-primary, #fff)", fontSize: "12px", fontFamily: "monospace" }}>{scan.code}</span>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ color: "#10b981", fontSize: "11px" }}>{scan.status}</span>
                  <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>{scan.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
