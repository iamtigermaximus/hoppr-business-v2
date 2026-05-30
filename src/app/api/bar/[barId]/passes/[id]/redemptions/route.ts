import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  const { id } = await params;

  const redemptions = await prisma.passRedemption.findMany({
    where: { passId: id },
    orderBy: { redeemedAt: "desc" },
    take: 200,
  });

  return NextResponse.json(redemptions);
}
