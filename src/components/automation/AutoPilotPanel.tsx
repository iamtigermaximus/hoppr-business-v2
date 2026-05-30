"use client";
import { useState, useEffect } from "react";
import { Robot, Plus, Clock, Lightning, ToggleRight, ToggleLeft, Trash } from "@phosphor-icons/react";

const triggerTypes = [
  { value: "TIME_BASED", label: "Time-based", description: "Triggers on specific days/times" },
  { value: "LOW_BOOKINGS", label: "Low Bookings", description: "When fewer people are booking" },
  { value: "LOW_FOOT_TRAFFIC", label: "Low Traffic", description: "During slow hours" },
];

const actionTypes = [
  { value: "CREATE_PROMOTION", label: "Create Promotion", description: "Auto-generate a happy hour or discount" },
  { value: "POST_SOCIAL", label: "Post to Social", description: "Post a pre-written message" },
];

export function AutoPilotPanel({ barId }: { barId: string }) {
  const [rules, setRules] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("TIME_BASED");
  const [actionType, setActionType] = useState("CREATE_PROMOTION");
  const [saving, setSaving] = useState(false);

  const fetchRules = () => {
    fetch(`/api/bar/${barId}/auto-pilot`).then(r => r.json()).then(d => setRules(Array.isArray(d) ? d : []));
  };
  useEffect(() => { fetchRules(); }, [barId]);

  const toggleRule = async (id: string, enabled: boolean) => {
    await fetch(`/api/bar/${barId}/auto-pilot`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isEnabled: !enabled }) });
    fetchRules();
  };

  const deleteRule = async (id: string) => {
    await fetch(`/api/bar/${barId}/auto-pilot?id=${id}`, { method: "DELETE" });
    fetchRules();
  };

  const handleCreate = async () => {
    setSaving(true);
    await fetch(`/api/bar/${barId}/auto-pilot`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, triggerType, actionType }) });
    setName(""); setShowCreate(false); setSaving(false); fetchRules();
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <Robot size={24} color="#7c3aed" weight="fill" /> Auto-Pilot
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginTop: "4px" }}>Automate promotions and social posts based on rules</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={{ padding: "10px 18px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={16} /> New Rule
        </button>
      </div>

      {showCreate && (
        <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid #7c3aed44", borderRadius: "14px", marginBottom: "20px" }}>
          <input placeholder="Rule name" value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "var(--color-input-bg)", border: "1px solid var(--color-input-border)", color: "var(--color-text-primary)", fontSize: "14px", outline: "none", marginBottom: "12px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>Trigger</div>
              <select value={triggerType} onChange={e => setTriggerType(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "var(--color-input-bg)", border: "1px solid var(--color-input-border)", color: "var(--color-text-primary)", fontSize: "13px", outline: "none" }}>
                {triggerTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <div style={{ color: "var(--color-text-secondary)", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>Action</div>
              <select value={actionType} onChange={e => setActionType(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", background: "var(--color-input-bg)", border: "1px solid var(--color-input-border)", color: "var(--color-text-primary)", fontSize: "13px", outline: "none" }}>
                {actionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleCreate} disabled={saving || !name} style={{ padding: "10px 20px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>{saving ? "Creating..." : "Create Rule"}</button>
            <button onClick={() => setShowCreate(false)} style={{ padding: "10px 20px", background: "transparent", color: "var(--color-text-secondary)", border: "1px solid var(--color-card-border)", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {rules.length === 0 && !showCreate && (
        <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-text-muted, #737373)" }}>
          <Robot size={48} color="#737373" style={{ marginBottom: "12px" }} />
          <p style={{ fontSize: "14px" }}>No auto-pilot rules yet.</p>
          <p style={{ fontSize: "12px", marginTop: "4px" }}>Create a rule to automate your marketing.</p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {rules.map((rule: any) => (
          <div key={rule.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: rule.isEnabled ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lightning size={20} color={rule.isEnabled ? "#10b981" : "#ef4444"} weight="fill" />
              </div>
              <div>
                <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "14px" }}>{rule.name}</div>
                <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>
                  {rule.triggerType?.replace(/_/g, " ")} → {rule.actionType?.replace(/_/g, " ")}
                  {rule.lastTriggeredAt && ` · Last: ${new Date(rule.lastTriggeredAt).toLocaleDateString()}`}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button onClick={() => toggleRule(rule.id, rule.isEnabled)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                {rule.isEnabled ? <ToggleRight size={28} color="#10b981" weight="fill" /> : <ToggleLeft size={28} color="#737373" />}
              </button>
              <button onClick={() => deleteRule(rule.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}>
                <Trash size={16} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
