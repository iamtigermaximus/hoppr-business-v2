import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const promotions = await prisma.promotion.findMany({
    where: { barId },
    orderBy: { startDate: "desc" },
    take: 20,
  });
  return NextResponse.json(promotions);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { barId } = await params;

  const data = await req.json();
  const promotion = await prisma.promotion.create({
    data: {
      title: data.title,
      description: data.description || null,
      barId,
      discountType: data.discountType || "HAPPY_HOUR",
      discountValue: data.discountValue || null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      imageUrl: data.imageUrl || null,
      termsAndConditions: data.termsAndConditions || null,
      isActive: true,
    },
  });

  return NextResponse.json(promotion, { status: 201 });
}
