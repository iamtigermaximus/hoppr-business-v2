"use client";
import { useEffect, useState } from "react";
import { ShieldCheck, CheckCircle, XCircle, Warning, Prohibit, Clock } from "@phosphor-icons/react";

export default function AdminCompliancePage() {
  const [tab, setTab] = useState<"rules" | "queue">("rules");
  const [data, setData] = useState<any>({ rules: [], queue: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/compliance")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const handleUpdate = async (id: string, status: string, rejectionReason?: string) => {
    await fetch("/api/admin/compliance", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, rejectionReason }),
    });
    setData((prev: any) => ({
      ...prev,
      queue: prev.queue.map((item: any) =>
        item.id === id
          ? {
              ...item,
              complianceStatus: status,
              reviewedAt: new Date().toISOString(),
              rejectionReason: rejectionReason || null,
            }
          : item
      ),
    }));
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "BLOCK":
        return "#ef4444";
      case "FLAG":
        return "#f59e0b";
      case "WARN":
        return "#3b82f6";
      default:
        return "#737373";
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle size={16} color="#10b981" weight="fill" />;
      case "REJECTED":
        return <XCircle size={16} color="#ef4444" weight="fill" />;
      default:
        return <Clock size={16} color="#f59e0b" weight="fill" />;
    }
  };

  if (loading) {
    return (
      <div style={{ color: "var(--color-text-muted, #737373)", padding: "40px", textAlign: "center" }}>
        Loading compliance data...
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <ShieldCheck size={24} color="#7c3aed" weight="fill" /> Compliance
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
        {(["rules", "queue"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 24px",
              background: "transparent",
              border: "none",
              borderBottom: tab === t ? "2px solid #7c3aed" : "2px solid transparent",
              color: tab === t ? "#7c3aed" : "var(--color-text-muted, #737373)",
              fontWeight: tab === t ? 600 : 400,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {t === "rules" ? "Rules" : "Moderation Queue"}
          </button>
        ))}
      </div>

      {/* Rules Tab */}
      {tab === "rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginBottom: "8px" }}>
            {data.rules?.length || 0} active compliance rules
          </p>
          {data.rules?.map((rule: any) => (
            <div
              key={rule.id}
              style={{
                padding: "18px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "15px" }}>
                      {rule.ruleName}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background: `${severityColor(rule.severity)}15`,
                        color: severityColor(rule.severity),
                      }}
                    >
                      {rule.severity}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 500,
                        background: "rgba(124,58,237,0.1)",
                        color: "#7c3aed",
                      }}
                    >
                      {rule.ruleCategory}
                    </span>
                  </div>
                  {rule.description && (
                    <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "4px" }}>
                      {rule.description}
                    </p>
                  )}
                </div>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "8px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: rule.isActive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    color: rule.isActive ? "#10b981" : "#ef4444",
                  }}
                >
                  {rule.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {rule.detectionKeywords?.map((kw: string) => (
                  <span
                    key={kw}
                    style={{
                      padding: "3px 10px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      background: "rgba(124,58,237,0.08)",
                      color: "#a78bfa",
                      fontFamily: "monospace",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {(!data.rules || data.rules.length === 0) && (
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", textAlign: "center", padding: "40px" }}>
              No compliance rules configured
            </p>
          )}
        </div>
      )}

      {/* Queue Tab */}
      {tab === "queue" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginBottom: "8px" }}>
            {data.queue?.length || 0} items in moderation queue
          </p>
          {data.queue?.map((item: any) => (
            <div
              key={item.id}
              style={{
                padding: "18px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "15px" }}>
                      {item.title}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background:
                          item.complianceStatus === "APPROVED"
                            ? "rgba(16,185,129,0.1)"
                            : item.complianceStatus === "REJECTED"
                            ? "rgba(239,68,68,0.1)"
                            : "rgba(245,158,11,0.1)",
                        color:
                          item.complianceStatus === "APPROVED"
                            ? "#10b981"
                            : item.complianceStatus === "REJECTED"
                            ? "#ef4444"
                            : "#f59e0b",
                      }}
                    >
                      {statusIcon(item.complianceStatus)} {item.complianceStatus?.replace(/_/g, " ")}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 500,
                        background: "rgba(124,58,237,0.08)",
                        color: "#a78bfa",
                      }}
                    >
                      {item.entityType}
                    </span>
                  </div>
                  {item.description && (
                    <p style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", marginTop: "4px" }}>
                      {item.description}
                    </p>
                  )}
                  {item.barName && (
                    <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", marginTop: "4px" }}>
                      Bar: {item.barName}
                    </p>
                  )}
                  {item.aiFlags && (
                    <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {Object.entries(JSON.parse(JSON.stringify(item.aiFlags))).map(([k, v]: any) => (
                        <span
                          key={k}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontSize: "10px",
                            background: "rgba(239,68,68,0.08)",
                            color: "#f87171",
                          }}
                        >
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.rejectionReason && (
                    <p style={{ color: "#ef4444", fontSize: "11px", marginTop: "6px" }}>
                      Rejection reason: {item.rejectionReason}
                    </p>
                  )}
                </div>
                {item.complianceStatus === "PENDING_REVIEW" && (
                  <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                    <button
                      onClick={() => handleUpdate(item.id, "APPROVED")}
                      style={{
                        padding: "8px 14px",
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.3)",
                        borderRadius: "8px",
                        color: "#10b981",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle size={14} weight="fill" /> Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Rejection reason (optional):");
                        handleUpdate(item.id, "REJECTED", reason || undefined);
                      }}
                      style={{
                        padding: "8px 14px",
                        background: "rgba(239,68,68,0.1)",
                        border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px",
                        color: "#ef4444",
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <XCircle size={14} weight="fill" /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(!data.queue || data.queue.length === 0) && (
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", textAlign: "center", padding: "40px" }}>
              Moderation queue is empty
            </p>
          )}
        </div>
      )}
    </div>
  );
}
