"use client";
import { useState, useEffect } from "react";
import { MagnifyingGlass, Funnel, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

const ACTION_TYPES = [
  "CRM_UPDATE", "CRM_CALL", "CRM_EMAIL", "CRM_MEETING",
  "USER_CREATE", "USER_UPDATE", "USER_DELETE",
  "BAR_CREATE", "BAR_UPDATE", "BAR_DELETE",
  "PROMOTION_CREATE", "PROMOTION_UPDATE", "PROMOTION_DELETE",
  "PASS_CREATE", "PASS_UPDATE", "PASS_DELETE",
  "CLAIM_REVIEW", "COMPLIANCE_REVIEW",
];

const ENTITY_TYPES = ["Bar", "User", "Promotion", "Pass", "ClaimRequest", "ContentModeration"];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const pageSize = 25;

  // Filters
  const [searchUser, setSearchUser] = useState("");
  const [searchEntity, setSearchEntity] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      if (searchUser) params.set("userId", searchUser);
      if (searchEntity) params.set("entityId", searchEntity);
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity", entityFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div style={{ maxWidth: "1200px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px" }}>
        Audit Log
      </h1>

      {/* Filters */}
      <div style={{
        padding: "16px", background: "var(--color-card, #1a1a1a)",
        border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Funnel size={16} color="#7c3aed" />
          <span style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "13px" }}>Filters</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <input
            placeholder="Search by user ID"
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            style={filterInputStyle}
          />
          <input
            placeholder="Search by entity ID"
            value={searchEntity}
            onChange={e => setSearchEntity(e.target.value)}
            style={filterInputStyle}
          />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={filterSelectStyle}>
            <option value="">All Actions</option>
            {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} style={filterSelectStyle}>
            <option value="">All Entities</option>
            {ENTITY_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={filterInputStyle}
            title="From date"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={filterInputStyle}
            title="To date"
          />
          <button onClick={handleFilter} style={{
            padding: "8px 16px", background: "#7c3aed", color: "#fff",
            border: "none", borderRadius: "8px", cursor: "pointer",
            fontWeight: 600, fontSize: "12px", display: "flex", alignItems: "center", gap: "6px",
          }}>
            <MagnifyingGlass size={14} /> Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: "var(--color-card, #1a1a1a)",
        border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px",
        overflowX: "auto",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-card-border, #262626)" }}>
              <th style={thStyle}>Timestamp</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Action</th>
              <th style={thStyle}>Entity Type</th>
              <th style={thStyle}>Entity ID</th>
              <th style={thStyle}>Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted, #737373)" }}>
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted, #737373)" }}>
                  No audit log entries found.
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                  <td style={tdStyle}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--color-text-secondary, #a3a3a3)" }}>
                      {log.userId ? log.userId.slice(0, 12) + "..." : "system"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                      background: actionBgColor(log.action), color: actionTextColor(log.action),
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={tdStyle}>{log.entity}</td>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: "monospace", fontSize: "11px" }}>
                      {log.entityId ? log.entityId.slice(0, 12) + "..." : "-"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      maxWidth: "200px", display: "inline-block", overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                      color: "var(--color-text-muted, #737373)",
                    }}>
                      {log.changes ? JSON.stringify(log.changes) : "-"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", padding: "0 4px" }}>
          <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px" }}>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={paginationBtnStyle(page <= 1)}
            >
              <CaretLeft size={14} /> Prev
            </button>
            <span style={{
              padding: "6px 12px", color: "var(--color-text-primary, #fff)",
              fontSize: "12px", display: "flex", alignItems: "center",
            }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={paginationBtnStyle(page >= totalPages)}
            >
              Next <CaretRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function actionBgColor(action: string): string {
  if (action.startsWith("CRM")) return "rgba(124,58,237,0.15)";
  if (action.includes("CREATE")) return "rgba(16,185,129,0.15)";
  if (action.includes("UPDATE")) return "rgba(59,130,246,0.15)";
  if (action.includes("DELETE")) return "rgba(239,68,68,0.15)";
  if (action.includes("REVIEW")) return "rgba(251,191,36,0.15)";
  return "rgba(115,115,115,0.15)";
}

function actionTextColor(action: string): string {
  if (action.startsWith("CRM")) return "#a78bfa";
  if (action.includes("CREATE")) return "#34d399";
  if (action.includes("UPDATE")) return "#60a5fa";
  if (action.includes("DELETE")) return "#f87171";
  if (action.includes("REVIEW")) return "#fbbf24";
  return "#a3a3a3";
}

const filterInputStyle: React.CSSProperties = {
  padding: "8px 10px", borderRadius: "8px", background: "var(--color-bg, #0a0a0a)",
  border: "1px solid var(--color-card-border, #262626)", color: "var(--color-text-primary, #fff)",
  fontSize: "12px", outline: "none", minWidth: "150px",
};

const filterSelectStyle: React.CSSProperties = {
  padding: "8px 10px", borderRadius: "8px", background: "var(--color-bg, #0a0a0a)",
  border: "1px solid var(--color-card-border, #262626)", color: "var(--color-text-primary, #fff)",
  fontSize: "12px", outline: "none", minWidth: "150px",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px", textAlign: "left", color: "var(--color-text-secondary, #a3a3a3)",
  fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px", color: "var(--color-text-primary, #fff)",
  fontSize: "12px", whiteSpace: "nowrap",
};

function paginationBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: 600,
    background: disabled ? "transparent" : "rgba(124,58,237,0.1)",
    border: disabled ? "1px solid transparent" : "1px solid #7c3aed44",
    color: disabled ? "var(--color-text-muted, #737373)" : "#7c3aed",
    cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "4px",
  };
}
