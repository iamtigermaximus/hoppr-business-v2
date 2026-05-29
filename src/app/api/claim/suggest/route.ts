import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const suggestions = await prisma.claimRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(suggestions);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { barName, barAddress, barCity, barType } = body;

    if (!barName || !barAddress) {
      return NextResponse.json(
        { error: "Bar name and address are required" },
        { status: 400 }
      );
    }

    const claimRequest = await prisma.claimRequest.create({
      data: {
        barName: barName.trim(),
        barAddress: barAddress.trim(),
        barCity: barCity || null,
        barType: barType || null,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, claimRequest }, { status: 201 });
  } catch (error) {
    console.error("Bar suggestion error:", error);
    return NextResponse.json(
      { error: "Failed to submit suggestion" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : null;
    if (!newStatus) {
      return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
    }

    const updated = await prisma.claimRequest.update({
      where: { id },
      data: { status: newStatus, reviewedBy: (session.user as any).id, reviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, claimRequest: updated });
  } catch (error) {
    console.error("Suggestion update error:", error);
    return NextResponse.json({ error: "Failed to update suggestion" }, { status: 500 });
  }
}
