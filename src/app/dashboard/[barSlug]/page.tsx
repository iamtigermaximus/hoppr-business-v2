"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Tag,
  Ticket,
  ChartBar,
  Robot,
  Lightning,
  PaperPlaneTilt,
  Plus,
} from "@phosphor-icons/react";

export default function BarOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const barSlug = (params as any).barSlug as string;
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch(`/api/bar/${barSlug}/promotions`)
      .then((r) => r.json())
      .then((d) => {
        setStats({ promotions: Array.isArray(d) ? d.length : 0 });
      });
  }, [barSlug]);

  const actions = [
    {
      label: "Promotions",
      icon: Tag,
      href: `/dashboard/${barSlug}/promotions`,
      color: "#10b981",
    },
    {
      label: "Passes",
      icon: Ticket,
      href: `/dashboard/${barSlug}/passes`,
      color: "#f59e0b",
    },
    {
      label: "AI Campaigns",
      icon: Robot,
      href: `/dashboard/${barSlug}/campaigns`,
      color: "#7c3aed",
    },
    {
      label: "Auto-Pilot",
      icon: Lightning,
      href: `/dashboard/${barSlug}/auto-pilot`,
      color: "#3b82f6",
    },
    {
      label: "Social",
      icon: PaperPlaneTilt,
      href: `/dashboard/${barSlug}/social`,
      color: "#e1306c",
    },
    {
      label: "Analytics",
      icon: ChartBar,
      href: `/dashboard/${barSlug}/analytics`,
      color: "#f59e0b",
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              fontWeight: 800,
              fontSize: "24px",
              color: "var(--color-text-primary, #fff)",
              margin: 0,
            }}
          >
            {barSlug
              ?.replace(/-/g, " ")
              .replace(/\b\w/g, (c: string) => c.toUpperCase())}
          </h1>
          <p
            style={{
              color: "var(--color-text-muted, #737373)",
              fontSize: "13px",
              marginTop: "4px",
            }}
          >
            Bar overview and quick actions
          </p>
        </div>
        <Link
          href={`/dashboard/${barSlug}/promotions/create`}
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
          <Plus size={16} /> New Promotion
        </Link>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        {[
          { label: "Promotions", value: stats.promotions || 0, color: "#10b981" },
          { label: "Active Passes", value: "0", color: "#f59e0b" },
          { label: "Total Views", value: "0", color: "#3b82f6" },
          { label: "Redemptions", value: "0", color: "#7c3aed" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: "16px",
              background: "var(--color-card, #1a1a1a)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "14px",
            }}
          >
            <div style={{ color: s.color, fontWeight: 700, fontSize: "28px" }}>
              {s.value}
            </div>
            <div
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2
        style={{
          color: "var(--color-text-primary, #fff)",
          fontWeight: 700,
          fontSize: "16px",
          marginBottom: "12px",
        }}
      >
        Quick Actions
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
        }}
      >
        {actions.map((a) => (
          <Link key={a.label} href={a.href} style={{ textDecoration: "none" }}>
            <div
              style={{
                padding: "20px",
                background: "var(--color-card, #1a1a1a)",
                border: "1px solid var(--color-card-border, #262626)",
                borderRadius: "14px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
                transition: "border-color 0.15s",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: `${a.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <a.icon size={22} color={a.color} weight="fill" />
              </div>
              <span
                style={{
                  color: "var(--color-text-primary, #fff)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {a.label}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
