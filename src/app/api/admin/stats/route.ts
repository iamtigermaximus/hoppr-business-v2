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

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalUsers,
    totalBars,
    activeBars,
    claimedBars,
    totalBarsCount,
    pendingClaims,
    pendingApprovals,
    promotionsCount,
    passesCount,
    monthlyRevenueRows,
    lastMonthRevenueRows,
    topBars,
    recentActivity,
    userGrowth,
    barGrowth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.bar.count(),
    prisma.bar.count({ where: { isActive: true } }),
    prisma.bar.count({ where: { claimStatus: { in: ["CLAIMED", "VERIFIED"] } } }),
    prisma.bar.count(),
    prisma.claimRequest.count({ where: { status: "PENDING" } }),
    prisma.contentApproval.count({ where: { status: "PENDING" } }),
    prisma.promotion.count(),
    prisma.pass.count(),
    prisma.barAnalytics.aggregate({
      _sum: { totalRevenue: true },
      where: { date: { gte: startOfMonth } },
    }),
    prisma.barAnalytics.aggregate({
      _sum: { totalRevenue: true },
      where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } },
    }),
    prisma.bar.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        claimStatus: true,
        leadStatus: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.user.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      orderBy: { createdAt: "asc" },
      where: { createdAt: { gte: new Date(now.getFullYear() - 1, 0, 1) } },
    }),
    prisma.bar.groupBy({
      by: ["createdAt"],
      _count: { id: true },
      orderBy: { createdAt: "asc" },
      where: { createdAt: { gte: new Date(now.getFullYear() - 1, 0, 1) } },
    }),
  ]);

  const monthlyRevenue = monthlyRevenueRows._sum.totalRevenue ?? 0;
  const lastMonthRevenue = lastMonthRevenueRows._sum.totalRevenue ?? 0;
  const claimRate =
    totalBarsCount > 0 ? Math.round((claimedBars / totalBarsCount) * 100) : 0;
  const avgRevenuePerBar = activeBars > 0 ? Math.round(monthlyRevenue / activeBars) : 0;

  // Aggregate user growth by month
  const userGrowthByMonth: Record<string, number> = {};
  for (const row of userGrowth) {
    const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, "0")}`;
    userGrowthByMonth[key] = (userGrowthByMonth[key] || 0) + row._count.id;
  }

  // Aggregate bar growth by month
  const barGrowthByMonth: Record<string, number> = {};
  for (const row of barGrowth) {
    const key = `${row.createdAt.getFullYear()}-${String(row.createdAt.getMonth() + 1).padStart(2, "0")}`;
    barGrowthByMonth[key] = (barGrowthByMonth[key] || 0) + row._count.id;
  }

  return NextResponse.json({
    // KPI cards
    totalUsers,
    totalBars,
    activeBars,
    claimedBars,
    claimRate,
    monthlyRevenue,
    avgRevenuePerBar,
    pendingClaims,
    pendingApprovals,
    promotionsCount,
    passesCount,

    // Revenue comparison
    lastMonthRevenue,
    revenueChange: lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null,

    // Platform health (mock for now)
    platformHealth: {
      apiResponseTime: "142ms",
      dbConnections: "8/20",
      errorRate: "0.12%",
      uptime: "99.97%",
    },

    // Alerts
    alerts: [
      ...(pendingClaims > 0
        ? [{ type: "info", message: `${pendingClaims} pending bar claim request(s) awaiting review` }]
        : []),
      ...(pendingApprovals > 0
        ? [{ type: "warning", message: `${pendingApprovals} content approval(s) pending` }]
        : []),
      { type: "info", message: "System maintenance scheduled for Sunday 2:00 AM UTC" },
    ],

    // Top bars (simplified for dashboard)
    topBars: topBars.map((b) => ({
      id: b.id,
      name: b.name,
      address: b.address,
      claimStatus: b.claimStatus,
      leadStatus: b.leadStatus,
    })),

    // Recent activity
    recentActivity: recentActivity.map((a) => ({
      action: a.action,
      entity: a.entity,
      createdAt: a.createdAt.toISOString(),
    })),

    // Chart data
    userGrowth: userGrowthByMonth,
    barGrowth: barGrowthByMonth,
  });
}
