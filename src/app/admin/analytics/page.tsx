"use client";
import { useEffect, useState } from "react";
import { ChartBar, Users, Buildings, Ticket, TrendUp, CheckCircle, Clock, Warning } from "@phosphor-icons/react";

interface AnalyticsSummary {
  totalBars: number;
  activeBars: number;
  inactiveBars: number;
  claimedBars: number;
  unclaimedBars: number;
  verifiedBars: number;
  totalBarManagers: number;
  totalUsers: number;
  totalPromotions: number;
  totalPasses: number;
  pendingClaims: number;
  barsWithDescription: number;
  barsWithImage: number;
  barsWithPhone: number;
  dataCompletenessScore: number;
}

interface BarTypeData {
  type: string;
  count: number;
}

export default function AdminAnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [barTypes, setBarTypes] = useState<BarTypeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumRes, typeRes] = await Promise.all([
          fetch("/api/admin/analytics/summary"),
          fetch("/api/admin/analytics/bar-types"),
        ]);
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.data);
        }
        if (typeRes.ok) {
          const typeData = await typeRes.json();
          setBarTypes(typeData.data || []);
        }
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <ChartBar size={24} color="#7c3aed" weight="fill" /> Analytics
        </h1>
        <p style={{ color: "var(--color-text-muted, #737373)" }}>Loading...</p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <ChartBar size={24} color="#7c3aed" weight="fill" /> Analytics
        </h1>
        <p style={{ color: "var(--color-text-muted, #737373)" }}>Failed to load analytics data.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Total Bars", value: summary.totalBars, icon: Buildings, color: "#7c3aed" },
    { label: "Active Bars", value: summary.activeBars, icon: CheckCircle, color: "#10b981" },
    { label: "Total Users", value: summary.totalUsers, icon: Users, color: "#3b82f6" },
    { label: "Promotions", value: summary.totalPromotions, icon: Ticket, color: "#f59e0b" },
    { label: "Passes", value: summary.totalPasses, icon: TrendUp, color: "#06b6d4" },
    { label: "Pending Claims", value: summary.pendingClaims, icon: Clock, color: "#ef4444" },
  ];

  const maxBarCount = Math.max(...barTypes.map((b) => b.count), 1);

  return (
    <div>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <ChartBar size={24} color="#7c3aed" weight="fill" /> Analytics
      </h1>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${m.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <m.icon size={20} color={m.color} weight="fill" />
            </div>
            <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "28px" }}>{m.value}</div>
            <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "4px" }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "24px" }}>
        {/* Bar Claim Status Distribution */}
        <div style={{ padding: "24px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary, #fff)", marginBottom: "20px" }}>Bar Claim Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Verified", value: summary.verifiedBars, total: summary.totalBars, color: "#3b82f6" },
              { label: "Claimed", value: summary.claimedBars, total: summary.totalBars, color: "#10b981" },
              { label: "Unclaimed", value: summary.unclaimedBars, total: summary.totalBars, color: "#f59e0b" },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "12px", color: "var(--color-text-muted, #737373)" }}>
                    <span>{item.label}</span>
                    <span>{item.value} ({pct}%)</span>
                  </div>
                  <div style={{ height: "8px", background: "var(--color-input-bg, #1a1a1a)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: item.color, borderRadius: "4px", transition: "width 0.3s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Type / Status Distribution (CSS Bar Chart) */}
        <div style={{ padding: "24px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary, #fff)", marginBottom: "20px" }}>Bar Distribution</h3>
          {barTypes.length === 0 ? (
            <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px" }}>No distribution data available.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {barTypes.map((item) => {
                const pct = maxBarCount > 0 ? Math.round((item.count / maxBarCount) * 100) : 0;
                const color = item.type === "UNCLAIMED" ? "#f59e0b" : item.type === "CLAIMED" ? "#10b981" : item.type === "VERIFIED" ? "#3b82f6" : item.type === "ACTIVE" ? "#06b6d4" : "#737373";
                return (
                  <div key={item.type} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ width: "80px", fontSize: "11px", color: "var(--color-text-muted, #737373)", textAlign: "right", flexShrink: 0 }}>{item.type}</span>
                    <div style={{ flex: 1, height: "20px", background: "var(--color-input-bg, #1a1a1a)", borderRadius: "4px", overflow: "hidden", position: "relative" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px", transition: "width 0.3s ease" }}>
                        <span style={{ fontSize: "10px", fontWeight: 600, color: "#fff" }}>{item.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Data Completeness */}
        <div style={{ padding: "24px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
          <h3 style={{ fontWeight: 700, fontSize: "16px", color: "var(--color-text-primary, #fff)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Warning size={18} color="#f59e0b" weight="fill" />
            Data Completeness
          </h3>
          <div style={{ fontSize: "36px", fontWeight: 800, color: summary.dataCompletenessScore >= 70 ? "#10b981" : summary.dataCompletenessScore >= 40 ? "#f59e0b" : "#ef4444", marginBottom: "16px" }}>
            {summary.dataCompletenessScore}%
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "With Description", value: summary.barsWithDescription, total: summary.totalBars },
              { label: "With Image", value: summary.barsWithImage, total: summary.totalBars },
              { label: "With Phone", value: summary.barsWithPhone, total: summary.totalBars },
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-muted, #737373)", marginBottom: "4px" }}>
                    <span>{item.label}</span>
                    <span>{item.value} / {item.total} ({pct}%)</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--color-input-bg, #1a1a1a)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "#7c3aed", borderRadius: "3px" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
