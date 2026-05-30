import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user as any;

  // Get bars via BarManager join table
  const managerRecords = await prisma.barManager.findMany({
    where: { userId: user.id },
    include: {
      bar: true,
    },
  });

  const bars = managerRecords.map((m) => m.bar);

  // For each bar, fetch promotion count
  const barStats = await Promise.all(
    bars.map(async (bar) => {
      const [promoCount, passCount] = await Promise.all([
        prisma.promotion.count({ where: { barId: bar.id } }),
        prisma.pass.count({ where: { barId: bar.id } }),
      ]);
      return {
        ...bar,
        promoCount,
        passCount,
      };
    })
  );

  return NextResponse.json({ bars: barStats });
}
