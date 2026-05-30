"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle, XCircle, Clock, Tag, PaperPlaneTilt, Ticket, ShieldCheck,
  User, Calendar, CaretDown, CaretUp, Warning, Info, Bell,
} from "@phosphor-icons/react";

interface Approval {
  id: string;
  barId: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string | null;
  status: string;
  createdBy: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  destinations: string[];
  createdAt: string;
  updatedAt: string;
}

const entityIcons: Record<string, any> = {
  PROMOTION: Tag,
  SOCIAL_POST: PaperPlaneTilt,
  PASS: Ticket,
};
const entityColors: Record<string, string> = {
  PROMOTION: "#10b981",
  SOCIAL_POST: "#e1306c",
  PASS: "#f59e0b",
};
const entityLabels: Record<string, string> = {
  PROMOTION: "Promotion",
  SOCIAL_POST: "Social Post",
  PASS: "Pass",
};

export default function ApprovalsPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState<string | null>(null);
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [actioning, setActioning] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch(`/api/bar/${barSlug}/approvals?status=${filter}`);
      const data = await res.json();
      setApprovals(Array.isArray(data) ? data : []);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [barSlug, filter]);

  useEffect(() => {
    setLoading(true);
    fetchApprovals();
  }, [fetchApprovals]);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setActioning(id);
    try {
      await fetch(`/api/bar/${barSlug}/approvals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status,
          rejectionReason: status === "REJECTED" ? rejectReason || "No reason provided" : undefined,
        }),
      });
      setShowReject(null);
      setRejectReason("");
      fetchApprovals();
    } catch {
      // silent
    } finally {
      setActioning(null);
    }
  };

  // Count approvals by status
  const pendingCount = filter === "PENDING" ? approvals.length : 0; // We'll fetch all counts separately
  const [counts, setCounts] = useState({ PENDING: 0, APPROVED: 0, REJECTED: 0 });

  useEffect(() => {
    Promise.all([
      fetch(`/api/bar/${barSlug}/approvals?status=PENDING`).then(r => r.json()),
      fetch(`/api/bar/${barSlug}/approvals?status=APPROVED`).then(r => r.json()),
      fetch(`/api/bar/${barSlug}/approvals?status=REJECTED`).then(r => r.json()),
    ]).then(([p, a, r]) => {
      setCounts({
        PENDING: Array.isArray(p) ? p.length : 0,
        APPROVED: Array.isArray(a) ? a.length : 0,
        REJECTED: Array.isArray(r) ? r.length : 0,
      });
    }).catch(() => {});
  }, [barSlug, approvals]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
        <div style={{ color: "var(--color-text-muted)" }}>Loading approvals...</div>
      </div>
    );
  }

  const isCompliant = (approval: Approval) => {
    // Simple heuristic: non-empty description suggests compliance-aware submission
    return !!approval.description && approval.description.length > 20;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
            Content Approvals
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginTop: "4px" }}>
            Review and approve content submitted by your staff
          </p>
        </div>
        {counts.PENDING > 0 && (
          <span style={{ padding: "6px 14px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", borderRadius: "8px", fontWeight: 700, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Bell size={16} /> {counts.PENDING} Pending
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px", borderRadius: "9px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
              border: "none",
              background: filter === f ? "#7c3aed" : "transparent",
              color: filter === f ? "#fff" : "var(--color-text-muted, #737373)",
              display: "flex", alignItems: "center", gap: "6px",
            }}
          >
            {f === "PENDING" ? <Clock size={14} /> : f === "APPROVED" ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {f.charAt(0) + f.slice(1).toLowerCase()}
            <span style={{
              padding: "1px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
              background: filter === f ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
            }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {/* Approvals List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {approvals.length === 0 ? (
          <div style={{
            padding: "40px 20px", textAlign: "center",
            background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)",
            borderRadius: "14px",
          }}>
            <CheckCircle size={32} color="var(--color-text-muted)" style={{ marginBottom: "12px" }} />
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", margin: 0 }}>
              No {filter.toLowerCase()} items to review.
            </p>
          </div>
        ) : (
          approvals.map((approval) => {
            const Icon = entityIcons[approval.entityType] || Info;
            const iconColor = entityColors[approval.entityType] || "#7c3aed";
            const typeLabel = entityLabels[approval.entityType] || approval.entityType;
            const compliant = isCompliant(approval);

            return (
              <div
                key={approval.id}
                style={{
                  padding: "16px 20px",
                  background: "var(--color-card, #1a1a1a)",
                  border: "1px solid var(--color-card-border, #262626)",
                  borderRadius: "14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                    {/* Icon */}
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      background: `${iconColor}15`, display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={20} color={iconColor} weight="fill" />
                    </div>
                    <div style={{ flex: 1 }}>
                      {/* Title row */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "14px" }}>
                          {approval.title}
                        </span>
                        <span style={{
                          padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                          background: `${iconColor}15`, color: iconColor,
                        }}>
                          {typeLabel}
                        </span>
                        {approval.status === "PENDING" && !compliant && (
                          <span style={{
                            padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: "rgba(239,68,68,0.1)", color: "#ef4444",
                            display: "flex", alignItems: "center", gap: "3px",
                          }}>
                            <Warning size={10} /> Flagged
                          </span>
                        )}
                        {approval.status === "APPROVED" && (
                          <span style={{
                            padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: "rgba(16,185,129,0.15)", color: "#10b981",
                          }}>
                            APPROVED
                          </span>
                        )}
                        {approval.status === "REJECTED" && (
                          <span style={{
                            padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: 700,
                            background: "rgba(239,68,68,0.1)", color: "#ef4444",
                          }}>
                            REJECTED
                          </span>
                        )}
                      </div>
                      {/* Meta row */}
                      <div style={{ display: "flex", gap: "12px", marginTop: "6px", flexWrap: "wrap" }}>
                        <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <User size={11} /> {approval.createdBy}
                        </span>
                        <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <Calendar size={11} /> {new Date(approval.createdAt).toLocaleDateString()}
                        </span>
                        {approval.destinations.length > 0 && (
                          <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
                            <PaperPlaneTilt size={11} /> {approval.destinations.join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons or status */}
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0, marginLeft: "12px", flexWrap: "wrap" }}>
                    {approval.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleAction(approval.id, "APPROVED")}
                          disabled={actioning === approval.id}
                          style={{
                            padding: "6px 14px", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px",
                            fontSize: "12px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px",
                            opacity: actioning === approval.id ? 0.5 : 1,
                          }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => { setShowReject(approval.id); setRejectReason(""); }}
                          style={{
                            padding: "6px 14px", background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "8px", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "4px",
                          }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}
                    {approval.status !== "PENDING" && (
                      <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>
                        {approval.status === "APPROVED" ? "by " : "by "}
                        {approval.reviewedBy || "manager"}
                        {approval.reviewedAt ? ` on ${new Date(approval.reviewedAt).toLocaleDateString()}` : ""}
                      </span>
                    )}
                    <button
                      onClick={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
                      style={{ padding: "6px 10px", background: "transparent", border: "1px solid var(--color-card-border, #262626)", borderRadius: "8px", cursor: "pointer", color: "var(--color-text-secondary)" }}
                    >
                      {expandedId === approval.id ? <CaretUp size={14} /> : <CaretDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Reject reason dialog */}
                {showReject === approval.id && (
                  <div style={{ marginTop: "12px", padding: "12px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px" }}>
                    <textarea
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={2}
                      style={{
                        width: "100%", padding: "10px", background: "var(--color-bg, #0a0a0a)",
                        border: "1px solid var(--color-card-border, #262626)", borderRadius: "8px",
                        color: "var(--color-text-primary, #fff)", fontSize: "12px", outline: "none",
                        resize: "vertical", boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                      <button
                        onClick={() => setShowReject(null)}
                        style={{
                          padding: "6px 14px", background: "transparent", color: "var(--color-text-secondary)",
                          border: "1px solid var(--color-card-border)", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAction(approval.id, "REJECTED")}
                        disabled={actioning === approval.id}
                        style={{
                          padding: "6px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 600, cursor: "pointer",
                          opacity: actioning === approval.id ? 0.5 : 1,
                        }}
                      >
                        Confirm Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Expanded detail */}
                {expandedId === approval.id && (
                  <div style={{
                    marginTop: "14px", padding: "14px",
                    background: "var(--color-bg, #0a0a0a)",
                    border: "1px solid var(--color-card-border, #262626)",
                    borderRadius: "10px",
                  }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600 }}>Description</span>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "12px", margin: "4px 0 0", lineHeight: 1.5 }}>
                          {approval.description || "No description provided"}
                        </p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600 }}>Compliance Check</span>
                          <div style={{ marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            {compliant ? (
                              <>
                                <ShieldCheck size={14} color="#10b981" weight="fill" />
                                <span style={{ color: "#10b981", fontSize: "12px", fontWeight: 600 }}>Passed</span>
                              </>
                            ) : (
                              <>
                                <Warning size={14} color="#f59e0b" weight="fill" />
                                <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: 600 }}>Needs Review</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600 }}>Destinations</span>
                          <div style={{ marginTop: "4px", display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {approval.destinations.length === 0 ? (
                              <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>None specified</span>
                            ) : (
                              approval.destinations.map(d => (
                                <span key={d} style={{ padding: "2px 8px", background: "rgba(124,58,237,0.1)", color: "#7c3aed", borderRadius: "4px", fontSize: "10px", fontWeight: 600 }}>{d}</span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      {approval.rejectionReason && (
                        <div>
                          <span style={{ color: "var(--color-text-muted)", fontSize: "11px", fontWeight: 600 }}>Rejection Reason</span>
                          <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0", lineHeight: 1.5 }}>
                            {approval.rejectionReason}
                          </p>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "16px", paddingTop: "4px", borderTop: "1px solid var(--color-card-border, #262626)" }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Entity ID: {approval.entityId}</span>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Submitted: {new Date(approval.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
