"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag, Ticket, ChartBar, Robot, Lightning, PaperPlaneTilt, Plus,
  Eye, CursorClick, CurrencyDollar, CheckCircle, Warning,
  Clock, Users, ShieldCheck, Bell, Sparkle, ArrowUp, ArrowDown,
  CaretRight, QrCode, Gear, ChatCircle
} from "@phosphor-icons/react";

export default function BarDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const barSlug = (params as any).barSlug as string;
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/bar/${barSlug}/promotions`).then(r => r.json()),
      fetch("/api/admin/stats").then(r => r.json()),
    ]).then(([promos, adminStats]) => {
      setStats({
        promotions: Array.isArray(promos) ? promos.length : 0,
        ...adminStats
      });
      setLoading(false);
    });
  }, [barSlug]);

  // KPI Cards
  const kpiCards = [
    { label: "Impressions (7d)", value: "1,240", change: "+12%", up: true, icon: Eye, color: "#3b82f6" },
    { label: "Clicks (7d)", value: "186", change: "+8%", up: true, icon: CursorClick, color: "#7c3aed" },
    { label: "Active Promos", value: stats.promotions || 0, change: null, icon: Tag, color: "#10b981" },
    { label: "Revenue", value: "€340", change: "+15%", up: true, icon: CurrencyDollar, color: "#f59e0b" },
    { label: "Passes Sold", value: "28", change: "-3%", up: false, icon: Ticket, color: "#e1306c" },
    { label: "Avg CTR", value: "4.8%", change: "+0.5%", up: true, icon: ChartBar, color: "#06b6d4" },
  ];

  // Quick Actions
  const quickActions = [
    { label: "New Promotion", icon: Plus, href: `/dashboard/${barSlug}/promotions/create`, color: "#10b981", primary: true },
    { label: "AI Campaign", icon: Robot, href: `/dashboard/${barSlug}/campaigns`, color: "#7c3aed" },
    { label: "Social Post", icon: PaperPlaneTilt, href: `/dashboard/${barSlug}/social`, color: "#e1306c" },
    { label: "Scan QR", icon: QrCode, href: `/dashboard/${barSlug}/scan`, color: "#f59e0b" },
    { label: "Manage Staff", icon: Users, href: `/dashboard/${barSlug}/staff`, color: "#3b82f6" },
    { label: "Settings", icon: Gear, href: `/dashboard/${barSlug}/settings`, color: "#737373" },
  ];

  // Recent Activity (mock for now - will be DB-driven)
  const activities = [
    { type: "promotion_created", text: "Promotion 'Happy Hour' created by you", time: "10 min ago", icon: Tag, color: "#10b981" },
    { type: "approval", text: "Staff 'Emma' submitted 'Weekend Special' for approval", time: "1 hour ago", icon: Bell, color: "#f59e0b" },
    { type: "pass_sold", text: "3 VIP passes sold today", time: "3 hours ago", icon: Ticket, color: "#e1306c" },
    { type: "auto_pilot", text: "Auto-pilot created 'Thursday Deals'", time: "5 hours ago", icon: Lightning, color: "#7c3aed" },
  ];

  // AI Insights
  const insights = [
    { text: "Friday 4-6 PM drives 2.5x more engagement. Schedule your next promo then.", icon: Sparkle, color: "#7c3aed" },
    { text: "Happy Hour promotions have 60% higher CTR than other types.", icon: ChartBar, color: "#10b981" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", margin: 0, textTransform: "capitalize" }}>
            {barSlug?.replace(/-/g, " ")}
          </h1>
          <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginTop: "4px" }}>Dashboard overview</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href={`/dashboard/${barSlug}/promotions/create`} style={{ padding: "10px 18px", background: "#7c3aed", color: "#fff", borderRadius: "10px", textDecoration: "none", fontWeight: 600, fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={16} /> New Promotion
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "28px" }}>
        {kpiCards.map(kpi => (
          <div key={kpi.label} style={{ padding: "18px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px", cursor: "pointer", transition: "border-color 0.15s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={18} color={kpi.color} weight="fill" />
              </div>
              {kpi.change && (
                <span style={{ display: "flex", alignItems: "center", gap: "2px", color: kpi.up ? "#10b981" : "#ef4444", fontSize: "11px", fontWeight: 600 }}>
                  {kpi.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {kpi.change}
                </span>
              )}
            </div>
            <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "24px", marginTop: "12px" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px", marginTop: "4px" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Quick Actions */}
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "14px" }}>Quick Actions</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {quickActions.map(a => (
                <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    padding: "14px 10px", borderRadius: "12px", textAlign: "center",
                    background: a.primary ? `${a.color}15` : "transparent",
                    border: a.primary ? `1px solid ${a.color}33` : "1px solid var(--color-card-border, #262626)",
                    transition: "all 0.15s", cursor: "pointer",
                  }}>
                    <a.icon size={22} color={a.color} weight="fill" style={{ marginBottom: "6px" }} />
                    <div style={{ color: "var(--color-text-primary, #fff)", fontSize: "11px", fontWeight: 600 }}>{a.label}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Bell size={16} color="#f59e0b" /> Pending Approvals
              </h3>
              <span style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "11px", padding: "3px 8px", borderRadius: "4px", fontWeight: 600 }}>2</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { title: "Weekend Special", by: "Emma", time: "1h ago", type: "promo" },
                { title: "Ladies Night Post", by: "Emma", time: "3h ago", type: "social" },
              ].map(item => (
                <div key={item.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--color-card-border, #262626)" }}>
                  <div>
                    <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 600, fontSize: "13px" }}>{item.title}</div>
                    <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>by {item.by} · {item.time}</div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button style={{ padding: "5px 12px", background: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Approve</button>
                    <button style={{ padding: "5px 12px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkle size={16} color="#7c3aed" weight="fill" /> AI Insights
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {insights.map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <insight.icon size={18} color={insight.color} weight="fill" style={{ marginTop: "2px" }} />
                  <p style={{ color: "var(--color-text-secondary, #a3a3a3)", fontSize: "12px", lineHeight: 1.5, margin: 0 }}>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Recent Activity */}
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} color="#3b82f6" /> Recent Activity
            </h3>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {activities.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", padding: "10px 0", borderBottom: i < activities.length - 1 ? "1px solid var(--color-card-border, #262626)" : "none" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${a.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <a.icon size={14} color={a.color} weight="fill" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "var(--color-text-primary, #fff)", fontSize: "12px", lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "10px", marginTop: "2px" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Score */}
          <div style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px" }}>
            <h3 style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={16} color="#10b981" /> Compliance Score
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", border: "4px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#10b981", fontWeight: 800, fontSize: "22px" }}>92</span>
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Green: 24 in last 30d</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Yellow: 2 in last 30d</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
                  <span style={{ color: "var(--color-text-muted, #737373)", fontSize: "11px" }}>Red: 0 in last 30d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
