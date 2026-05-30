"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Buildings,
  Storefront,
  CheckCircle,
  CurrencyDollar,
  TrendUp,
  Clock,
  Bell,
  Warning,
  Info,
  ArrowUp,
  ArrowDown,
  Gauge,
  Plus,
  ShieldCheck,
  CaretRight,
} from "@phosphor-icons/react";

interface AdminStats {
  totalUsers: number;
  totalBars: number;
  activeBars: number;
  claimedBars: number;
  claimRate: number;
  monthlyRevenue: number;
  avgRevenuePerBar: number;
  pendingClaims: number;
  pendingApprovals: number;
  promotionsCount: number;
  passesCount: number;
  lastMonthRevenue: number;
  revenueChange: number | null;
  platformHealth: {
    apiResponseTime: string;
    dbConnections: string;
    errorRate: string;
    uptime: string;
  };
  alerts: { type: string; message: string }[];
  topBars: {
    id: string;
    name: string;
    address: string;
    claimStatus: string;
    leadStatus: string;
  }[];
  recentActivity: {
    action: string;
    entity: string;
    createdAt: string;
  }[];
  userGrowth: Record<string, number>;
  barGrowth: Record<string, number>;
}

const CARD_STYLE: React.CSSProperties = {
  background: "var(--color-card, #1a1a1a)",
  border: "1px solid var(--color-card-border, #262626)",
  borderRadius: "14px",
  padding: "20px",
};

const MUTED: React.CSSProperties = {
  color: "var(--color-text-muted, #737373)",
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setStats(await res.json());
      } catch (e) {
        console.error("Failed to load admin stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "24px" }}>
          Platform Dashboard
        </h1>
        <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>Loading platform data...</div>
      </div>
    );
  }

  const s = stats;

  // Format currency
  const fmt = (n: number) => `$${n.toLocaleString()}`;

  // Compute bar chart heights from growth data
  const userValues = s ? Object.values(s.userGrowth) : [];
  const barValues = s ? Object.values(s.barGrowth) : [];
  const userMax = Math.max(...userValues, 1);
  const barMax = Math.max(...barValues, 1);

  const kpiCards = [
    { label: "Total Users", value: s?.totalUsers ?? 0, icon: Users, color: "#7c3aed" },
    { label: "Total Bars", value: s?.totalBars ?? 0, icon: Buildings, color: "#3b82f6" },
    { label: "Active Bars", value: s?.activeBars ?? 0, icon: Storefront, color: "#22c55e" },
    { label: "Claim Rate", value: `${s?.claimRate ?? 0}%`, icon: CheckCircle, color: "#f59e0b" },
    { label: "Monthly Revenue", value: fmt(s?.monthlyRevenue ?? 0), icon: CurrencyDollar, color: "#10b981" },
    { label: "Avg Rev / Bar", value: fmt(s?.avgRevenuePerBar ?? 0), icon: TrendUp, color: "#06b6d4" },
    { label: "Pending Claims", value: s?.pendingClaims ?? 0, icon: Clock, color: "#ef4444" },
    { label: "Pend. Approvals", value: s?.pendingApprovals ?? 0, icon: Bell, color: "#a855f7" },
  ];

  const healthIndicators = s
    ? [
        { label: "API Latency", value: s.platformHealth.apiResponseTime, ok: true },
        { label: "DB Connections", value: s.platformHealth.dbConnections, ok: true },
        { label: "Error Rate", value: s.platformHealth.errorRate, ok: true },
        { label: "Uptime", value: s.platformHealth.uptime, ok: true },
      ]
    : [];

  const revenueChange = s?.revenueChange ?? 0;
  const revenueDir = revenueChange >= 0 ? "up" : "down";

  return (
    <div style={{ paddingBottom: "40px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "4px" }}>
            Platform Dashboard
          </h1>
          <p style={{ ...MUTED, fontSize: "13px" }}>Real-time overview of Hoppr Business operations</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href="/admin/bars/create"
            style={{
              background: "#7c3aed",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Plus size={16} weight="bold" /> Add Bar
          </Link>
          <Link
            href="/admin/crm"
            style={{
              background: "var(--color-card, #1a1a1a)",
              color: "var(--color-text-primary, #fff)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "10px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <CaretRight size={16} weight="bold" /> CRM Pipeline
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {kpiCards.map((card) => (
          <div key={card.label} style={CARD_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <span style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", ...MUTED }}>
                {card.label}
              </span>
              <card.icon size={18} color={card.color} weight="fill" />
            </div>
            <div style={{ fontSize: "26px", fontWeight: 800, color: "var(--color-text-primary, #fff)" }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two-column grid: main content + sidebar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* LEFT: Revenue & Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Revenue Snapshot */}
          <div style={CARD_STYLE}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: 0 }}>
                Revenue Snapshot
              </h3>
              <span style={{ fontSize: "12px", ...MUTED }}>This month vs last month</span>
            </div>
            <div style={{ display: "flex", gap: "40px", alignItems: "flex-end", marginBottom: "12px" }}>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", ...MUTED, marginBottom: "4px" }}>
                  This Month
                </div>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "#22c55e" }}>
                  {fmt(s?.monthlyRevenue ?? 0)}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                {revenueDir === "up" ? (
                  <ArrowUp size={18} color="#22c55e" weight="bold" />
                ) : (
                  <ArrowDown size={18} color="#ef4444" weight="bold" />
                )}
                <span style={{ fontSize: "14px", fontWeight: 700, color: revenueDir === "up" ? "#22c55e" : "#ef4444" }}>
                  {Math.abs(revenueChange)}%
                </span>
                <span style={{ fontSize: "12px", ...MUTED }}>vs last month</span>
              </div>
            </div>
            {/* CSS bar comparison */}
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "80px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div
                  style={{
                    width: "80%",
                    height: "100%",
                    background: "linear-gradient(180deg, #22c55e 0%, rgba(34,197,94,0.2) 100%)",
                    borderRadius: "6px 6px 0 0",
                    minHeight: "4px",
                  }}
                />
                <span style={{ fontSize: "11px", ...MUTED }}>This Month</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div
                  style={{
                    width: "80%",
                    height: s && s.monthlyRevenue > 0 ? `${Math.max(10, (s.lastMonthRevenue / s.monthlyRevenue) * 100)}%` : "10%",
                    background: "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.2) 100%)",
                    borderRadius: "6px 6px 0 0",
                    minHeight: "4px",
                  }}
                />
                <span style={{ fontSize: "11px", ...MUTED }}>Last Month</span>
              </div>
            </div>
            <div style={{ fontSize: "12px", ...MUTED, marginTop: "10px" }}>
              Last month: {fmt(s?.lastMonthRevenue ?? 0)}
            </div>
          </div>

          {/* User Growth Chart */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 16px 0" }}>
              User Growth (12 months)
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
              {Object.entries(s?.userGrowth ?? {}).map(([month, count]) => (
                <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: "var(--color-text-secondary, #a3a3a3)" }}>{count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(4, (count / userMax) * 100)}%`,
                      background: "linear-gradient(180deg, #7c3aed 0%, rgba(124,58,237,0.3) 100%)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "4px",
                    }}
                  />
                  <span style={{ fontSize: "9px", ...MUTED }}>{month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Growth Chart */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 16px 0" }}>
              Bar Growth (12 months)
            </h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
              {Object.entries(s?.barGrowth ?? {}).map(([month, count]) => (
                <div key={month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: "10px", color: "var(--color-text-secondary, #a3a3a3)" }}>{count}</span>
                  <div
                    style={{
                      width: "100%",
                      height: `${Math.max(4, (count / barMax) * 100)}%`,
                      background: "linear-gradient(180deg, #3b82f6 0%, rgba(59,130,246,0.3) 100%)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: "4px",
                    }}
                  />
                  <span style={{ fontSize: "9px", ...MUTED }}>{month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Bars Table */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 16px 0" }}>
              Recent Bars
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                    {["Name", "Address", "Claim Status", "Lead Status"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontWeight: 600, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", ...MUTED }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s?.topBars?.map((bar) => (
                    <tr key={bar.id} style={{ borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                      <td style={{ padding: "10px 12px", color: "var(--color-text-primary, #fff)", fontWeight: 600 }}>
                        <Link href={`/dashboard/${bar.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                          {bar.name}
                        </Link>
                      </td>
                      <td style={{ padding: "10px 12px", ...MUTED, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {bar.address}
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <StatusBadge status={bar.claimStatus} />
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <StatusBadge status={bar.leadStatus} />
                      </td>
                    </tr>
                  )) ?? null}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT: Health + Alerts + Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Platform Health */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Gauge size={18} color="#22c55e" weight="fill" /> Platform Health
            </h3>
            {healthIndicators.map((h) => (
              <div key={h.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                <span style={{ fontSize: "13px", color: "var(--color-text-secondary, #a3a3a3)" }}>{h.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-text-primary, #fff)" }}>{h.value}</span>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: h.ok ? "#22c55e" : "#ef4444", display: "inline-block" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Alert Center */}
          <div style={{ ...CARD_STYLE, borderColor: "rgba(245,158,11,0.3)" }}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Warning size={18} color="#f59e0b" weight="fill" /> Alert Center
            </h3>
            {s?.alerts?.map((alert, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", padding: "8px 0", borderBottom: "1px solid var(--color-card-border, #262626)", alignItems: "flex-start" }}>
                {alert.type === "warning" ? (
                  <Warning size={14} color="#f59e0b" weight="fill" style={{ marginTop: "2px", flexShrink: 0 }} />
                ) : (
                  <Info size={14} color="#3b82f6" weight="fill" style={{ marginTop: "2px", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: "12px", color: "var(--color-text-secondary, #a3a3a3)", lineHeight: "1.4" }}>
                  {alert.message}
                </span>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 12px 0" }}>
              Quick Actions
            </h3>
            {[
              { href: "/admin/claims", label: "Review Claim Requests", icon: Clock, count: s?.pendingClaims },
              { href: "/admin/compliance", label: "Compliance Center", icon: ShieldCheck, count: undefined },
              { href: "/admin/crm", label: "CRM Pipeline", icon: TrendUp, count: undefined },
              { href: "/admin/bars/import", label: "Import Bars", icon: Plus, count: undefined },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  textDecoration: "none",
                  color: "var(--color-text-secondary, #a3a3a3)",
                  fontSize: "13px",
                  borderBottom: "1px solid var(--color-card-border, #262626)",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <link.icon size={16} color="var(--color-text-muted, #737373)" />
                  {link.label}
                </span>
                {link.count !== undefined && (
                  <span style={{
                    background: link.count > 0 ? "#ef4444" : "var(--color-card-border, #262626)",
                    color: "#fff",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}>
                    {link.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Recent Activity Feed */}
          <div style={CARD_STYLE}>
            <h3 style={{ fontWeight: 700, fontSize: "15px", color: "var(--color-text-primary, #fff)", margin: "0 0 12px 0" }}>
              Recent Activity
            </h3>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {s?.recentActivity?.map((a, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: "1px solid var(--color-card-border, #262626)", display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#7c3aed",
                    marginTop: "6px",
                    flexShrink: 0,
                  }} />
                  <div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #a3a3a3)" }}>
                      <span style={{ fontWeight: 600, color: "var(--color-text-primary, #fff)" }}>{a.action}</span>
                      {" "}on{" "}
                      <span style={{ fontWeight: 500 }}>{a.entity}</span>
                    </div>
                    <div style={{ fontSize: "10px", ...MUTED, marginTop: "2px" }}>
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
              {(!s?.recentActivity || s.recentActivity.length === 0) && (
                <div style={{ fontSize: "12px", ...MUTED, padding: "12px 0", textAlign: "center" }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    UNCLAIMED: "#f59e0b",
    CLAIMED: "#22c55e",
    VERIFIED: "#3b82f6",
    LEAD: "#a855f7",
    CONTACTED: "#f59e0b",
    NEGOTIATING: "#3b82f6",
    REJECTED: "#ef4444",
  };
  const bg = colors[status] || "var(--color-card-border, #262626)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 700,
        background: `${bg}20`,
        color: bg,
        border: `1px solid ${bg}40`,
      }}
    >
      {status}
    </span>
  );
}
