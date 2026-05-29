"use client";
import Link from "next/link";
import { formatEventTime } from "@/lib/utils";

export function PromotionList({
  promotions,
  barSlug,
}: {
  promotions: any[];
  barSlug: string;
}) {
  if (!promotions.length) {
    return (
      <p
        style={{
          color: "var(--color-text-muted, #737373)",
          fontSize: "14px",
        }}
      >
        No promotions yet. Create your first one!
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {promotions.map((p: any) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 18px",
            background: "var(--color-card, #1a1a1a)",
            border: "1px solid var(--color-card-border, #262626)",
            borderRadius: "12px",
          }}
        >
          <div
            style={{ display: "flex", gap: "12px", alignItems: "center" }}
          >
            {p.imageUrl && (
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  overflow: "hidden",
                  background: "#262626",
                }}
              >
                <img
                  src={p.imageUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            )}
            <div>
              <div
                style={{
                  color: "var(--color-text-primary, #fff)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                {p.title}
              </div>
              <div
                style={{
                  color: "var(--color-text-muted, #737373)",
                  fontSize: "11px",
                }}
              >
                {p.discountType?.replace(/_/g, " ")} &middot;{" "}
                {formatEventTime(new Date(p.startDate))} –{" "}
                {formatEventTime(new Date(p.endDate))}
              </div>
            </div>
          </div>
          <div
            style={{ display: "flex", gap: "6px", alignItems: "center" }}
          >
            {p.isActive ? (
              <span
                style={{
                  background: "rgba(16,185,129,0.15)",
                  color: "#10b981",
                  fontSize: "10px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                Active
              </span>
            ) : (
              <span
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#ef4444",
                  fontSize: "10px",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontWeight: 600,
                }}
              >
                Inactive
              </span>
            )}
            <Link
              href={`/dashboard/${barSlug}/promotions/${p.id}/edit`}
              style={{
                color: "var(--color-text-muted, #737373)",
                fontSize: "12px",
              }}
            >
              Edit &rarr;
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
