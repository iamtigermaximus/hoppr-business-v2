"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Buildings, Plus, Robot, ChartBar } from "@phosphor-icons/react";

export default function DashboardPage() {
  const [data, setData] = useState<any>({ bars: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/bars")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const bars = data.bars || [];
  const totalPromos = bars.reduce((sum: number, b: any) => sum + (b.promoCount || 0), 0);
  const totalPasses = bars.reduce((sum: number, b: any) => sum + (b.passCount || 0), 0);

  if (loading) {
    return (
      <div style={{ color: "var(--color-text-muted, #737373)", padding: "40px", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: "24px",
              color: "var(--color-text-primary, #fff)",
              margin: 0,
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px", marginTop: "4px" }}>
            {bars.length > 0
              ? `Managing ${bars.length} bar${bars.length > 1 ? "s" : ""}`
              : "Welcome to Hoppr Business. Claim a bar to get started."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link
            href="/dashboard/campaigns"
            style={{
              padding: "10px 18px",
              background: "#7c3aed",
              color: "#fff",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Robot size={16} /> AI Campaign
          </Link>
          <Link
            href="/dashboard/analytics"
            style={{
              padding: "10px 18px",
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              color: "var(--color-text-primary, #fff)",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ChartBar size={16} /> Analytics
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Managed Bars", value: bars.length, color: "#7c3aed" },
          { label: "Active Promotions", value: totalPromos, color: "#10b981" },
          { label: "Active Passes", value: totalPasses, color: "#f59e0b" },
          { label: "Total Views", value: "—", color: "#3b82f6" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "14px",
              padding: "18px",
            }}
          >
            <div style={{ color: stat.color, fontWeight: 700, fontSize: "28px" }}>
              {stat.value}
            </div>
            <div
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "12px",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Your Bars */}
      {bars.length > 0 && (
        <>
          <h2
            style={{
              color: "var(--color-text-primary, #fff)",
              fontWeight: 700,
              fontSize: "16px",
              marginBottom: "12px",
            }}
          >
            Your Bars
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
            {bars.map((bar: any) => (
              <Link
                key={bar.id}
                href={`/dashboard/${bar.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    background: "var(--color-card, #1a1a1a)",
                    border: "1px solid var(--color-card-border, #262626)",
                    borderRadius: "14px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "rgba(124,58,237,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Buildings size={22} color="#7c3aed" weight="fill" />
                    </div>
                    <div>
                      <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "15px" }}>
                        {bar.name}
                      </div>
                      <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", marginTop: "2px" }}>
                        {bar.address}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "18px" }}>
                        {bar.promoCount}
                      </div>
                      <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "10px" }}>Promos</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "18px" }}>
                        {bar.passCount}
                      </div>
                      <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "10px" }}>Passes</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Quick Links */}
      <h2
        style={{
          color: "var(--color-text-primary, #fff)",
          fontWeight: 700,
          fontSize: "16px",
          marginBottom: "12px",
        }}
      >
        Quick Links
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        {[
          { label: "AI Campaigns", color: "#7c3aed", href: "/dashboard/campaigns" },
          { label: "Social", color: "#e1306c", href: "/dashboard/social" },
          { label: "Auto-Pilot", color: "#3b82f6", href: "/dashboard/auto-pilot" },
          { label: "Insights", color: "#f59e0b", href: "/dashboard/insights" },
        ].map((link) => (
          <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: "18px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
                color: link.color,
                fontWeight: 600,
                fontSize: "14px",
                textAlign: "center",
                transition: "border-color 0.15s",
                cursor: "pointer",
              }}
            >
              {link.label}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
