"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PromotionForm } from "@/components/promotions/PromotionForm";

export default function EditPromotionPage() {
  const params = useParams();
  const [promo, setPromo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bar/${(params as any).barSlug}/promotions`)
      .then((r) => r.json())
      .then((data) => {
        const found = Array.isArray(data)
          ? data.find((p: any) => p.id === (params as any).id)
          : null;
        setPromo(found);
        setLoading(false);
      });
  }, [params]);

  if (loading)
    return (
      <p style={{ color: "var(--color-text-muted, #737373)" }}>
        Loading...
      </p>
    );
  if (!promo)
    return <p style={{ color: "#ef4444" }}>Promotion not found</p>;
  return (
    <PromotionForm
      barSlug={(params as any).barSlug}
      initial={promo}
    />
  );
}
