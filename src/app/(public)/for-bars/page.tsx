"use client";
import Link from "next/link";

const benefits = [
  {
    title: "Reach More Customers",
    description:
      "Get discovered by thousands of bar-goers on Hoppr. Your promotions appear directly in their feed, driving foot traffic on slow nights.",
    icon: "target",
  },
  {
    title: "Create Promotions",
    description:
      "Set up happy hours, drink specials, cover discounts, and more. Customize timing, discount values, and terms to match your business needs.",
    icon: "tag",
  },
  {
    title: "Sell VIP Passes",
    description:
      "Generate revenue before doors open. Sell VIP passes, table reservations, and event tickets directly through Hoppr.",
    icon: "ticket",
  },
  {
    title: "Analytics & Insights",
    description:
      "Track promotion performance, pass sales, and customer engagement. Make data-driven decisions to grow your bar business.",
    icon: "chart",
  },
  {
    title: "Manage Your Bar Profile",
    description:
      "Keep your bar's information up to date - hours, photos, amenities, and contact details. Customers always see the latest info.",
    icon: "building",
  },
  {
    title: "Direct Customer Communication",
    description:
      "Send push notifications to customers who follow your bar. Announce events, special offers, and last-minute deals instantly.",
    icon: "chat",
  },
];

export default function ForBarsPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        padding: "48px 24px 64px",
        maxWidth: "960px",
        margin: "0 auto",
        background: "var(--color-bg, #0a0a0a)",
      }}
    >
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontWeight: 800,
            fontSize: "36px",
            color: "var(--color-text-primary, #fff)",
            marginBottom: "12px",
          }}
        >
          Hoppr for Bars
        </h1>
        <p
          style={{
            color: "var(--color-text-muted, #737373)",
            fontSize: "16px",
            maxWidth: "560px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          Turn your bar into a destination. Hoppr Business gives you the tools to
          attract customers, boost revenue on slow nights, and build a loyal
          following.
        </p>
        <Link
          href="/claim"
          style={{
            display: "inline-block",
            padding: "14px 32px",
            background: "#7c3aed",
            color: "#fff",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "16px",
          }}
        >
          Claim Your Bar
        </Link>
      </div>

      {/* Benefits grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        {benefits.map((b) => (
          <div
            key={b.title}
            style={{
              background: "var(--color-card, #141414)",
              border: "1px solid var(--color-card-border, #262626)",
              borderRadius: "14px",
              padding: "24px",
            }}
          >
            <h3
              style={{
                fontWeight: 700,
                fontSize: "15px",
                color: "var(--color-text-primary, #fff)",
                marginBottom: "6px",
              }}
            >
              {b.title}
            </h3>
            <p
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {b.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
          borderRadius: "16px",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontWeight: 800,
            fontSize: "22px",
            color: "#fff",
            marginBottom: "8px",
          }}
        >
          Ready to get started?
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.85)",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          Claim your bar in under 2 minutes and start reaching new customers.
        </p>
        <Link
          href="/claim"
          style={{
            display: "inline-block",
            padding: "12px 28px",
            background: "#fff",
            color: "#7c3aed",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: 700,
            fontSize: "15px",
          }}
        >
          Claim Your Bar
        </Link>
      </div>
    </div>
  );
}
