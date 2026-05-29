"use client";

export default function DashboardPage() {
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
        Dashboard
      </h1>
      <p style={{ color: "var(--color-text-muted, #737373)", fontSize: "14px" }}>
        Welcome to Hoppr Business. Select a section from the sidebar to get started.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        {[
          { label: "Promotions", value: "0", color: "#10b981" },
          { label: "Active Passes", value: "0", color: "#f59e0b" },
          { label: "Total Views", value: "0", color: "#3b82f6" },
          { label: "Conversions", value: "0", color: "#7c3aed" },
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
    </div>
  );
}
