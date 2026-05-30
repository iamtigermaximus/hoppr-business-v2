import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const assignedTo = searchParams.get("assignedTo");

  const where: any = {};
  if (assignedTo) {
    where.leadAssignedTo = assignedTo;
  }

  const bars = await prisma.bar.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      email: true,
      leadStatus: true,
      claimStatus: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      lastContactedAt: true,
      nextFollowUpAt: true,
      leadAssignedTo: true,
    },
    orderBy: [{ nextFollowUpAt: { sort: "asc", nulls: "last" } }, { name: "asc" }],
  });

  return NextResponse.json(bars);
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { barId, ...updates } = body;

  if (!barId || typeof barId !== "string") {
    return NextResponse.json({ error: "barId is required" }, { status: 400 });
  }

  // Whitelist allowed fields
  const allowedFields = [
    "leadStatus",
    "contactName",
    "contactEmail",
    "contactPhone",
    "lastContactedAt",
    "nextFollowUpAt",
    "leadAssignedTo",
  ];

  const data: Record<string, any> = {};
  for (const key of allowedFields) {
    if (key in updates) {
      if (["lastContactedAt", "nextFollowUpAt"].includes(key) && updates[key]) {
        data[key] = new Date(updates[key]);
      } else {
        data[key] = updates[key];
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const bar = await prisma.bar.update({
    where: { id: barId },
    data,
    select: {
      id: true,
      name: true,
      leadStatus: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      lastContactedAt: true,
      nextFollowUpAt: true,
      leadAssignedTo: true,
    },
  });

  // Log the update
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: "CRM_UPDATE",
      entity: "Bar",
      entityId: barId,
      changes: updates,
    },
  });

  return NextResponse.json(bar);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { barId, activityType, note } = body;

  if (!barId || !activityType) {
    return NextResponse.json({ error: "barId and activityType are required" }, { status: 400 });
  }

  // Log the sales activity
  const log = await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: `CRM_${activityType}`,
      entity: "Bar",
      entityId: barId,
      changes: { note, activityType },
    },
  });

  // If it's a contact activity, update lastContactedAt
  if (["CALL", "EMAIL", "MEETING"].includes(activityType)) {
    await prisma.bar.update({
      where: { id: barId },
      data: { lastContactedAt: new Date() },
    });
  }

  return NextResponse.json({ success: true, logId: log.id });
}
