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

  const [
    totalBars,
    claimedBars,
    unclaimedBars,
    verifiedBars,
    totalBarManagers,
    totalPromotions,
    totalPasses,
    activeBars,
    inactiveBars,
    totalUsers,
    pendingClaims,
  ] = await Promise.all([
    prisma.bar.count(),
    prisma.bar.count({ where: { claimStatus: "CLAIMED" } }),
    prisma.bar.count({ where: { claimStatus: "UNCLAIMED" } }),
    prisma.bar.count({ where: { claimStatus: "VERIFIED" } }),
    prisma.barManager.count(),
    prisma.promotion.count(),
    prisma.pass.count(),
    prisma.bar.count({ where: { isActive: true } }),
    prisma.bar.count({ where: { isActive: false } }),
    prisma.user.count({ where: { role: { in: ["BAR_MANAGER", "SUPER_ADMIN"] } } }),
    prisma.claimRequest.count({ where: { status: "PENDING" } }),
  ]);

  // Completion score: bars with description, imageUrl, and phone
  const [barsWithDescription, barsWithImage, barsWithPhone] = await Promise.all([
    prisma.bar.count({ where: { description: { not: null } } }),
    prisma.bar.count({ where: { imageUrl: { not: null } } }),
    prisma.bar.count({ where: { phone: { not: null } } }),
  ]);

  const dataCompletenessScore = totalBars > 0
    ? Math.round(((barsWithDescription + barsWithImage + barsWithPhone) / (totalBars * 3)) * 100)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalBars,
      activeBars,
      inactiveBars,
      claimedBars,
      unclaimedBars,
      verifiedBars,
      totalBarManagers,
      totalUsers,
      totalPromotions,
      totalPasses,
      pendingClaims,
      barsWithDescription,
      barsWithImage,
      barsWithPhone,
      dataCompletenessScore,
    },
  });
}
