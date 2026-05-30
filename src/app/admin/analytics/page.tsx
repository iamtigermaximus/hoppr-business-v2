"use client";
import { useEffect, useState } from "react";
import { ChartBar, Users, Buildings, Ticket, TrendUp } from "@phosphor-icons/react";

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>({});
  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats);
  }, []);

  const metrics = [
    { label: "Total Bars", value: stats.totalBars || 0, icon: Buildings, color: "#7c3aed" },
    { label: "Total Users", value: "—", icon: Users, color: "#3b82f6" },
    { label: "Promotions", value: stats.totalPromotions || 0, icon: Ticket, color: "#10b981" },
    { label: "Passes", value: stats.totalPasses || 0, icon: TrendUp, color: "#f59e0b" },
  ];

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
        <ChartBar size={24} color="#7c3aed" weight="fill" /> Analytics
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        {metrics.map((m) => (
          <div
            key={m.label}
            style={{
              padding: "20px",
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "14px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: `${m.color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
              }}
            >
              <m.icon size={20} color={m.color} weight="fill" />
            </div>
            <div
              style={{
                color: "var(--color-text-primary, #fff)",
                fontWeight: 700,
                fontSize: "28px",
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "40px",
          background: "var(--color-card, #1a1a1a)",
          border: "1px solid var(--color-card-border, #262626)",
          borderRadius: "14px",
          textAlign: "center",
        }}
      >
        <ChartBar size={48} color="#737373" style={{ marginBottom: "12px" }} />
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>
          Advanced charts coming soon with historical data
        </p>
        <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "4px" }}>
          Recharts integration ready -- activate with real analytics data
        </p>
      </div>
    </div>
  );
}
