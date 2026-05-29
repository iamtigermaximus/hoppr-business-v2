"use client";
import { useParams } from "next/navigation";
import { SocialPublisher } from "@/components/social/SocialPublisher";

export default function SocialPage() {
  const params = useParams();
  const barSlug = (params as any).barSlug as string;
  return <SocialPublisher barId={barSlug} />;
}
