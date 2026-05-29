import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateHeadlines, generateCampaignBody } from "@/lib/openai";

export async function POST(req: Request, { params }: { params: Promise<{ barId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { barId } = await params;

  const bar = await prisma.bar.findUnique({ where: { id: barId } });
  if (!bar) return NextResponse.json({ error: "Bar not found" }, { status: 404 });

  const { objective = "TRAFFIC", promotionType = "HAPPY_HOUR" } = await req.json();

  const headlines = await generateHeadlines(bar.name, "BAR", objective);
  const sampleBody = headlines[0] ? await generateCampaignBody(headlines[0], bar.name, promotionType) : "";

  return NextResponse.json({ headlines, sampleBody, objective, promotionType });
}
