"use client";
import { Lightbulb, TrendUp, Clock, Users } from "@phosphor-icons/react";

const demoInsights = [
  { type: "BEST_TIME", title: "Best time to post", description: "Friday 4-6 PM shows 2.5x more engagement than other times.", icon: Clock, color: "#3b82f6" },
  { type: "BEST_OFFER", title: "Top performing offer", description: "Happy Hour promotions drive 60% more clicks than other types.", icon: TrendUp, color: "#10b981" },
  { type: "AUDIENCE", title: "Audience insight", description: "Your audience is most active on Instagram between 7-9 PM.", icon: Users, color: "#f59e0b" },
  { type: "PRICE", title: "Pricing sweet spot", description: "Passes priced at 8-12 have the highest conversion rate at 15%.", icon: Lightbulb, color: "#7c3aed" },
];

export function InsightsPanel() {
  return (
    <div style={{ maxWidth: "700px" }}>
      <h1 style={{ fontWeight: 800, fontSize: "24px", color: "var(--color-text-primary, #fff)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Lightbulb size={24} color="#f59e0b" weight="fill" /> AI Insights
      </h1>
      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "13px", marginBottom: "20px" }}>Data-driven recommendations based on your performance</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {demoInsights.map((insight, i) => (
          <div key={i} style={{ padding: "20px", background: "var(--color-card, #1a1a1a)", border: "1px solid var(--color-card-border, #262626)", borderRadius: "14px", cursor: "pointer", transition: "border-color 0.15s" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${insight.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px" }}>
              <insight.icon size={20} color={insight.color} weight="fill" />
            </div>
            <div style={{ color: "var(--color-text-primary, #fff)", fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{insight.title}</div>
            <div style={{ color: "var(--color-text-muted, #737373)", fontSize: "12px", lineHeight: 1.5 }}>{insight.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
