"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface CrmStats {
  totalBars: number;
  unclaimedBars: number;
  claimedBars: number;
  verifiedBars: number;
  totalPromotions: number;
  totalPasses: number;
  leadsCount: number;
}

export default function AdminPage() {
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1
        style={{
          fontWeight: 800,
          fontSize: "24px",
          color: "var(--color-text-primary, #fff)",
          marginBottom: "8px",
        }}
      >
        Admin Dashboard
      </h1>
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
          marginBottom: "24px",
        }}
      >
        Manage bars, users, and platform settings.
      </p>

      {/* CRM Stats */}
      {loading ? (
        <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginBottom: "24px" }}>
          Loading stats...
        </div>
      ) : stats ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          {[
            { label: "Total Bars", value: stats.totalBars, color: "#7c3aed" },
            { label: "Unclaimed", value: stats.unclaimedBars, color: "#f59e0b" },
            { label: "Claimed", value: stats.claimedBars, color: "#22c55e" },
            { label: "Verified", value: stats.verifiedBars, color: "#3b82f6" },
            { label: "Leads", value: stats.leadsCount, color: "#ef4444" },
            { label: "Promotions", value: stats.totalPromotions, color: "#a855f7" },
            { label: "Passes", value: stats.totalPasses, color: "#06b6d4" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "12px",
                padding: "16px",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--color-text-muted, #737373)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { label: "Manage Bars", href: "/admin/bars", color: "#7c3aed" },
          { label: "Bar Claims", href: "/admin/claims", color: "#f59e0b" },
          { label: "Users", href: "/admin/users", color: "#3b82f6" },
          { label: "Analytics", href: "/admin/analytics", color: "#10b981" },
          { label: "Settings", href: "/admin/settings", color: "#06b6d4" },
        ].map((item) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
                padding: "24px 18px",
                cursor: "pointer",
                transition: "border-color 0.15s",
              }}
            >
              <div style={{ color: item.color, fontWeight: 700, fontSize: "16px" }}>
                {item.label}
              </div>
              <div
                style={{
                  color: "var(--color-text-muted, #737373)",
                  fontSize: "12px",
                  marginTop: "4px",
                }}
              >
                Click to manage
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
