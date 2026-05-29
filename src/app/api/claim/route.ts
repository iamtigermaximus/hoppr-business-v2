import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || searchParams.get("search") || "";

  if (!q.trim()) {
    return NextResponse.json([]);
  }

  const bars = await prisma.bar.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      address: true,
      imageUrl: true,
      claimStatus: true,
    },
    orderBy: { name: "asc" },
    take: 20,
  });

  return NextResponse.json(bars);
}

export async function PATCH(req: Request) {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth");

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if ((session.user as any).role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { barId, action } = body;

    if (!barId || !action) {
      return NextResponse.json({ error: "barId and action are required" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "CLAIMED" : action === "reject" ? "UNCLAIMED" : null;
    if (!newStatus) {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
    }

    // Also update the associated ClaimRequest
    if (action === "approve" || action === "reject") {
      await prisma.claimRequest.updateMany({
        where: { barId, status: "PENDING" },
        data: {
          status: action === "approve" ? "APPROVED" : "REJECTED",
          reviewedBy: (session.user as any).id,
          reviewedAt: new Date(),
        },
      });
    }

    const updatedBar = await prisma.bar.update({
      where: { id: barId },
      data: { claimStatus: newStatus },
    });

    return NextResponse.json({ success: true, bar: updatedBar });
  } catch (error) {
    console.error("Claim update error:", error);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barId } = body;

    if (!barId) {
      return NextResponse.json({ error: "barId is required" }, { status: 400 });
    }

    const bar = await prisma.bar.findUnique({ where: { id: barId } });
    if (!bar) {
      return NextResponse.json({ error: "Bar not found" }, { status: 404 });
    }

    if (bar.claimStatus !== "UNCLAIMED") {
      return NextResponse.json(
        { error: "This bar has already been claimed or is under review" },
        { status: 409 }
      );
    }

    // Create a claim request and update bar status to PENDING
    const [, updatedBar] = await prisma.$transaction([
      prisma.claimRequest.create({
        data: {
          barId: bar.id,
          barName: bar.name,
          barAddress: bar.address,
          status: "PENDING",
        },
      }),
      prisma.bar.update({
        where: { id: barId },
        data: { claimStatus: "PENDING" },
      }),
    ]);

    return NextResponse.json({ success: true, bar: updatedBar }, { status: 200 });
  } catch (error) {
    console.error("Claim initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate claim" },
      { status: 500 }
    );
  }
}
