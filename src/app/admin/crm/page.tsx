"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Funnel,
  Phone,
  Envelope,
  Calendar,
  User,
  Buildings,
  MapPin,
  Wine,
  CaretRight,
  DotsThree,
  Plus,
} from "@phosphor-icons/react";

interface CrmBar {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  leadStatus: string;
  claimStatus: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  leadAssignedTo?: string;
}

type LeadStage = "LEAD" | "CONTACTED" | "NEGOTIATING" | "VERIFYING" | "CLAIMED" | "REJECTED";

const STAGES: { key: LeadStage; label: string; color: string; icon: React.FC<{ size: number }> }[] = [
  { key: "LEAD", label: "Lead", color: "#a855f7", icon: Plus },
  { key: "CONTACTED", label: "Contacted", color: "#f59e0b", icon: Phone },
  { key: "NEGOTIATING", label: "Negotiating", color: "#3b82f6", icon: Envelope },
  { key: "VERIFYING", label: "Verifying", color: "#06b6d4", icon: Calendar },
  { key: "CLAIMED", label: "Claimed", color: "#22c55e", icon: CaretRight },
  { key: "REJECTED", label: "Rejected", color: "#ef4444", icon: DotsThree },
];

export default function CrmPage() {
  const [bars, setBars] = useState<CrmBar[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [assignedFilter, setAssignedFilter] = useState("");
  const [editingBar, setEditingBar] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    leadAssignedTo: "",
    nextFollowUpAt: "",
  });

  const loadBars = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (assignedFilter) params.set("assignedTo", assignedFilter);
      const res = await fetch(`/api/admin/crm?${params}`);
      if (res.ok) setBars(await res.json());
    } catch (e) {
      console.error("Failed to load CRM bars", e);
    } finally {
      setLoading(false);
    }
  }, [assignedFilter]);

  useEffect(() => {
    loadBars();
  }, [loadBars]);

  async function updateLeadStatus(barId: string, newStatus: LeadStage) {
    const res = await fetch("/api/admin/crm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barId, leadStatus: newStatus }),
    });
    if (res.ok) {
      setBars((prev) =>
        prev.map((b) => (b.id === barId ? { ...b, leadStatus: newStatus } : b))
      );
      if (newStatus === "CONTACTED") {
        // Also update lastContactedAt
        await fetch("/api/admin/crm", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ barId, lastContactedAt: new Date().toISOString() }),
        });
      }
    }
  }

  async function saveContactInfo(barId: string) {
    const res = await fetch("/api/admin/crm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ barId, ...contactForm }),
    });
    if (res.ok) {
      setBars((prev) =>
        prev.map((b) =>
          b.id === barId
            ? { ...b, ...contactForm, lastContactedAt: b.lastContactedAt }
            : b
        )
      );
      setEditingBar(null);

      // Log activity
      await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barId,
          activityType: "NOTE",
          note: `Updated contact info: ${contactForm.contactName || "N/A"}`,
        }),
      });
    }
  }

  function startEdit(bar: CrmBar) {
    setEditingBar(bar.id);
    setContactForm({
      contactName: bar.contactName || "",
      contactEmail: bar.contactEmail || "",
      contactPhone: bar.contactPhone || "",
      leadAssignedTo: bar.leadAssignedTo || "",
      nextFollowUpAt: bar.nextFollowUpAt
        ? new Date(bar.nextFollowUpAt).toISOString().slice(0, 16)
        : "",
    });
  }

  function onDragStart(barId: string) {
    setDragging(barId);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function onDrop(stage: LeadStage) {
    if (dragging) {
      updateLeadStatus(dragging, stage);
      setDragging(null);
    }
  }

  const barsByStage: Record<LeadStage, CrmBar[]> = {
    LEAD: [],
    CONTACTED: [],
    NEGOTIATING: [],
    VERIFYING: [],
    CLAIMED: [],
    REJECTED: [],
  };
  for (const bar of bars) {
    const stage = bar.leadStatus as LeadStage;
    if (barsByStage[stage]) barsByStage[stage].push(bar);
  }

  // Get unique assigned admins for filter
  const assignedOptions = [...new Set(bars.map((b) => b.leadAssignedTo).filter(Boolean))] as string[];

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "4px" }}>
            CRM Pipeline
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px" }}>
            Drag bars between stages to advance leads through the pipeline
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Funnel size={16} color="var(--color-text-muted, #737373)" />
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            style={{
              background: "var(--color-card, #1a1a1a)",
              color: "var(--color-text-primary, #fff)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "13px",
            }}
          >
            <option value="">All Assignees</option>
            {assignedOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>Loading pipeline...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "14px",
            overflowX: "auto",
          }}
        >
          {STAGES.map((stage) => {
            const stageBars = barsByStage[stage.key];
            return (
              <div
                key={stage.key}
                onDragOver={onDragOver}
                onDrop={() => onDrop(stage.key)}
                style={{
                  background: "var(--color-card, #1a1a1a)",
                  border: `1px solid ${dragging ? stage.color : "var(--color-card-border, #262626)"}`,
                  borderRadius: "14px",
                  padding: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minHeight: "400px",
                  maxHeight: "calc(100vh - 200px)",
                  overflowY: "auto",
                  transition: "border-color 0.2s",
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBottom: "10px",
                    borderBottom: `2px solid ${stage.color}30`,
                    marginBottom: "4px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: stage.color,
                      }}
                    />
                    <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary, #fff)" }}>
                      {stage.label}
                    </span>
                  </div>
                  <span
                    style={{
                      background: `${stage.color}20`,
                      color: stage.color,
                      borderRadius: "20px",
                      padding: "2px 10px",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {stageBars.length}
                  </span>
                </div>

                {/* Cards */}
                {stageBars.map((bar) => (
                  <div
                    key={bar.id}
                    draggable
                    onDragStart={() => onDragStart(bar.id)}
                    onClick={() => (editingBar === bar.id ? null : startEdit(bar))}
                    style={{
                      background: "var(--color-bg, #0a0a0a)",
                      border: editingBar === bar.id ? `1px solid ${stage.color}` : "1px solid var(--color-card-border, #262626)",
                      borderRadius: "10px",
                      padding: "14px",
                      cursor: "grab",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary, #fff)", marginBottom: "6px" }}>
                      {bar.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--color-text-muted, #737373)", marginBottom: "3px" }}>
                      <MapPin size={12} />
                      {bar.address?.split(",")?.[0] || bar.address}
                    </div>
                    {bar.contactName && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--color-text-secondary, #a3a3a3)", marginBottom: "3px" }}>
                        <User size={12} /> {bar.contactName}
                      </div>
                    )}
                    {bar.lastContactedAt && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", ...MUTED, marginBottom: "3px" }}>
                        <Calendar size={12} /> Last: {new Date(bar.lastContactedAt).toLocaleDateString()}
                      </div>
                    )}
                    {bar.nextFollowUpAt && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", color: "#f59e0b", marginBottom: "3px" }}>
                        <Calendar size={12} /> Follow-up: {new Date(bar.nextFollowUpAt).toLocaleDateString()}
                      </div>
                    )}
                    {bar.leadAssignedTo && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "10px", ...MUTED, marginTop: "6px" }}>
                        <User size={12} /> {bar.leadAssignedTo}
                      </div>
                    )}
                  </div>
                ))}

                {stageBars.length === 0 && (
                  <div style={{
                    color: "var(--color-text-muted, #737373)",
                    fontSize: "12px",
                    textAlign: "center",
                    padding: "20px 0",
                    fontStyle: "italic",
                  }}>
                    No bars in this stage
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Contact Modal */}
      {editingBar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
          onClick={() => setEditingBar(null)}
        >
          <div
            style={{
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "16px",
              padding: "28px",
              width: "420px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 700, fontSize: "18px", color: "var(--color-text-primary, #fff)", margin: "0 0 20px 0" }}>
              Edit Contact Info
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted, #737373)", textTransform: "uppercase" }}>
                Contact Name
                <input
                  value={contactForm.contactName}
                  onChange={(e) => setContactForm({ ...contactForm, contactName: e.target.value })}
                  style={inputStyle}
                  placeholder="Full name"
                />
              </label>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted, #737373)", textTransform: "uppercase" }}>
                Contact Email
                <input
                  value={contactForm.contactEmail}
                  onChange={(e) => setContactForm({ ...contactForm, contactEmail: e.target.value })}
                  style={inputStyle}
                  placeholder="email@example.com"
                />
              </label>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted, #737373)", textTransform: "uppercase" }}>
                Contact Phone
                <input
                  value={contactForm.contactPhone}
                  onChange={(e) => setContactForm({ ...contactForm, contactPhone: e.target.value })}
                  style={inputStyle}
                  placeholder="+1 (555) 000-0000"
                />
              </label>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted, #737373)", textTransform: "uppercase" }}>
                Assigned To
                <input
                  value={contactForm.leadAssignedTo}
                  onChange={(e) => setContactForm({ ...contactForm, leadAssignedTo: e.target.value })}
                  style={inputStyle}
                  placeholder="Admin name"
                />
              </label>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-muted, #737373)", textTransform: "uppercase" }}>
                Next Follow-Up
                <input
                  type="datetime-local"
                  value={contactForm.nextFollowUpAt}
                  onChange={(e) => setContactForm({ ...contactForm, nextFollowUpAt: e.target.value })}
                  style={inputStyle}
                />
              </label>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setEditingBar(null)}
                style={{
                  background: "none",
                  border: "1px solid var(--color-card-border, #262626)",
                  color: "var(--color-text-secondary, #a3a3a3)",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => saveContactInfo(editingBar)}
                style={{
                  background: "#7c3aed",
                  border: "none",
                  color: "#fff",
                  borderRadius: "10px",
                  padding: "8px 18px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: "6px",
  background: "var(--color-bg, #0a0a0a)",
  border: "1px solid var(--color-card-border, #262626)",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "13px",
  color: "var(--color-text-primary, #fff)",
  boxSizing: "border-box",
};

const MUTED: React.CSSProperties = {
  color: "var(--color-text-muted, #737373)",
};
