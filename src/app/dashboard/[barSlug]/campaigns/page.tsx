"use client";
import { useParams } from "next/navigation";
import { CampaignCreator } from "@/components/campaigns/CampaignCreator";

export default function CampaignsPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;

  return <CampaignCreator barId={barSlug} barSlug={barSlug} />;
}
