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

  // Group bars by claimStatus (the v2 schema uses claimStatus instead of type)
  // Note: Add a "type" field to the Bar model to enable bar-type grouping
  const barsByClaimStatus = await prisma.bar.groupBy({
    by: ["claimStatus"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  const barsByActive = await prisma.bar.groupBy({
    by: ["isActive"],
    _count: { id: true },
  });

  const formattedData = barsByClaimStatus.map((item) => ({
    type: item.claimStatus,
    count: item._count.id,
  }));

  const activeBreakdown = barsByActive.map((item) => ({
    type: item.isActive ? "ACTIVE" : "INACTIVE",
    count: item._count.id,
  }));

  return NextResponse.json({
    success: true,
    data: [...formattedData, ...activeBreakdown],
  });
}
