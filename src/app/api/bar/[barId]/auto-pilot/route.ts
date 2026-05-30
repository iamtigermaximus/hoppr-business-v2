import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;

  const rules = await prisma.autoPilotRule.findMany({
    where: { barId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rules);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  const rule = await prisma.autoPilotRule.create({
    data: {
      barId,
      name: data.name,
      triggerType: data.triggerType || "TIME_BASED",
      triggerConfig: data.triggerConfig || null,
      actionType: data.actionType || "CREATE_PROMOTION",
      actionConfig: data.actionConfig || null,
      cooldownHours: data.cooldownHours || 24,
      isEnabled: true,
    },
  });

  return NextResponse.json(rule, { status: 201 });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  const rule = await prisma.autoPilotRule.findFirst({
    where: { id: data.id, barId },
  });

  if (!rule)
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  const updated = await prisma.autoPilotRule.update({
    where: { id: data.id },
    data: {
      isEnabled: data.isEnabled ?? rule.isEnabled,
      name: data.name ?? rule.name,
      triggerType: data.triggerType ?? rule.triggerType,
      triggerConfig: data.triggerConfig ?? rule.triggerConfig,
      actionType: data.actionType ?? rule.actionType,
      actionConfig: data.actionConfig ?? rule.actionConfig,
      cooldownHours: data.cooldownHours ?? rule.cooldownHours,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id)
    return NextResponse.json({ error: "Missing id param" }, { status: 400 });

  const rule = await prisma.autoPilotRule.findFirst({
    where: { id, barId },
  });

  if (!rule)
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  await prisma.autoPilotRule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
