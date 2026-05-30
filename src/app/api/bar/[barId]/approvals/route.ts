import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List approvals for a bar (status filter via query param)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "PENDING";

  const approvals = await prisma.contentApproval.findMany({
    where: { barId, status },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(approvals);
}

// POST: Create approval request (staff submits content)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  if (!data.title || !data.entityType || !data.entityId) {
    return NextResponse.json(
      { error: "title, entityType, and entityId are required" },
      { status: 400 }
    );
  }

  const approval = await prisma.contentApproval.create({
    data: {
      barId,
      entityType: data.entityType,
      entityId: data.entityId,
      title: data.title,
      description: data.description || null,
      createdBy: (session.user as any).id,
      destinations: data.destinations || [],
      status: "PENDING",
    },
  });

  return NextResponse.json(approval, { status: 201 });
}

// PUT: Approve or reject (manager action)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  if (!data.id || !data.status) {
    return NextResponse.json(
      { error: "id and status are required" },
      { status: 400 }
    );
  }

  if (!["APPROVED", "REJECTED"].includes(data.status)) {
    return NextResponse.json(
      { error: "status must be APPROVED or REJECTED" },
      { status: 400 }
    );
  }

  const approval = await prisma.contentApproval.update({
    where: { id: data.id },
    data: {
      status: data.status,
      reviewedBy: (session.user as any).id,
      reviewedAt: new Date(),
      rejectionReason: data.status === "REJECTED" ? (data.rejectionReason || null) : null,
    },
  });

  return NextResponse.json(approval);
}
