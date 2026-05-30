"use client";
import { useParams } from "next/navigation";
import { AutoPilotPanel } from "@/components/automation/AutoPilotPanel";

export default function AutoPilotPage() {
  const params = useParams();
  return <AutoPilotPanel barId={(params as any).barSlug as string} />;
}
