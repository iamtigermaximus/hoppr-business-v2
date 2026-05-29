"use client";
import { useState } from "react";
import { Sparkle, Copy, Check } from "@phosphor-icons/react";

const objectives = [
  { value: "TRAFFIC", label: "Get More Customers", icon: "\u{1F6B6}" },
  { value: "SALES", label: "Boost Sales", icon: "\u{1F4B0}" },
  { value: "AWARENESS", label: "Brand Awareness", icon: "\u{1F4E2}" },
  { value: "ENGAGEMENT", label: "Social Engagement", icon: "\u{1F4AC}" },
];

export function CampaignCreator({ barId, barSlug }: { barId: string; barSlug: string }) {
  const [step, setStep] = useState(0);
  const [objective, setObjective] = useState("TRAFFIC");
  const [promotionType, setPromotionType] = useState("HAPPY_HOUR");
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [sampleBody, setSampleBody] = useState("");
  const [selected, setSelected] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await fetch(`/api/bar/${barId}/campaigns/generate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ objective, promotionType }),
    });
    const data = await res.json();
    setHeadlines(data.headlines || []);
    setSampleBody(data.sampleBody || "");
    setGenerating(false);
    setStep(1);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Sparkle size={24} color="#7c3aed" weight="fill" /> AI Campaign Creator
      </h1>

      {step === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Campaign Objective</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {objectives.map(o => (
                <button key={o.value} onClick={() => setObjective(o.value)} style={{
                  padding: "14px", borderRadius: "12px", border: objective === o.value ? "1px solid #7c3aed" : "1px solid var(--color-card-border, #262626)",
                  background: objective === o.value ? "rgba(124,58,237,0.1)" : "var(--color-card, #1a1a1a)",
                  color: objective === o.value ? "#7c3aed" : "var(--color-text-primary, #fff)",
                  textAlign: "left", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                }}>
                  <span style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>{o.icon}</span> {o.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>Promotion Type</div>
            <select value={promotionType} onChange={e => setPromotionType(e.target.value)} style={{
              width: "100%", padding: "12px 14px", borderRadius: "10px",
              background: "var(--color-input-bg, #1a1a1a)", border: "1px solid var(--color-input-border, #262626)",
              color: "var(--color-text-primary, #fff)", fontSize: "14px", outline: "none",
            }}>
              {["HAPPY_HOUR","STUDENT_DISCOUNT","LADIES_NIGHT","THEME_NIGHT","DRINK_SPECIAL","COVER_DISCOUNT","VIP_OFFER"].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={generating} style={{
            padding: "14px 24px", background: "linear-gradient(135deg, #7c3aed, #5b21b6)", color: "#fff",
            border: "none", borderRadius: "12px", fontWeight: 700, fontSize: "15px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            <Sparkle size={18} /> {generating ? "Generating..." : "Generate AI Headlines"}
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", fontWeight: 600, marginBottom: "12px" }}>Select a headline ({headlines.length} generated)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
            {headlines.map((h, i) => (
              <div key={i} onClick={() => setSelected(h)} style={{
                padding: "14px 18px", borderRadius: "12px",
                border: selected === h ? "1px solid #7c3aed" : "1px solid var(--color-card-border, #262626)",
                background: selected === h ? "rgba(124,58,237,0.1)" : "var(--color-card, #1a1a1a)",
                cursor: "pointer", transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-text-primary, #fff)", fontSize: "14px", fontWeight: 600 }}>{h}</span>
                  <button onClick={(e) => { e.stopPropagation(); copyToClipboard(h, `h${i}`); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                    {copied === `h${i}` ? <Check size={16} color="#10b981" /> : <Copy size={16} color="#737373" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {sampleBody && (
            <div style={{ padding: "16px", borderRadius: "12px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "11px", fontWeight: 600 }}>Suggested body copy</span>
                <button onClick={() => copyToClipboard(sampleBody, "body")} style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {copied === "body" ? <Check size={14} color="#10b981" /> : <Copy size={14} color="#737373" />}
                </button>
              </div>
              <p style={{ color: "var(--color-text-primary, #fff)", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{sampleBody}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setStep(0)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid var(--color-card-border, #262626)", background: "transparent", color: "var(--color-text-secondary)", fontWeight: 600, cursor: "pointer" }}>
              Back
            </button>
            {selected && (
              <button onClick={() => window.location.href = `/dashboard/${barSlug}/promotions/create?title=${encodeURIComponent(selected)}&body=${encodeURIComponent(sampleBody)}`} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "#7c3aed", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                Use This → Create Promotion
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
