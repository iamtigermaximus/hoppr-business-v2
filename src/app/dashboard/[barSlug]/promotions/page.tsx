"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PromotionList } from "@/components/promotions/PromotionList";

export default function PromotionsPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bar/${barSlug}/promotions`)
      .then((r) => r.json())
      .then((d) => {
        setPromotions(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, [barSlug]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1
          style={{
            fontWeight: 800,
            fontSize: "24px",
            color: "var(--color-text-primary, #fff)",
            margin: 0,
          }}
        >
          Promotions
        </h1>
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
          }}
        >
          + New Promotion
        </Link>
      </div>
      {loading ? (
        <p style={{ color: "var(--color-text-muted, #737373)" }}>
          Loading...
        </p>
      ) : (
        <PromotionList promotions={promotions} barSlug={barSlug} />
      )}
    </div>
  );
}
