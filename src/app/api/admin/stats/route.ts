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

  const [totalBars, unclaimedBars, claimedBars, verifiedBars, totalPromotions, totalPasses] =
    await Promise.all([
      prisma.bar.count(),
      prisma.bar.count({ where: { claimStatus: "UNCLAIMED" } }),
      prisma.bar.count({ where: { claimStatus: "CLAIMED" } }),
      prisma.bar.count({ where: { claimStatus: "VERIFIED" } }),
      prisma.promotion.count(),
      prisma.pass.count(),
    ]);

  const leadsCount = await prisma.claimRequest.count({
    where: { status: "PENDING" },
  });

  return NextResponse.json({
    totalBars,
    unclaimedBars,
    claimedBars,
    verifiedBars,
    totalPromotions,
    totalPasses,
    leadsCount,
  });
}
