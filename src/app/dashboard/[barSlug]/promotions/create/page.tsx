"use client";
import { useParams } from "next/navigation";
import { PromotionForm } from "@/components/promotions/PromotionForm";

export default function CreatePromotionPage() {
  const params = useParams();
  return <PromotionForm barSlug={(params as any).barSlug} />;
}
