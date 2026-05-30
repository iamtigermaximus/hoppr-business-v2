import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const passes = await prisma.pass.findMany({
    where: { barId },
    include: { redemptions: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(passes);
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

  if (!data.title || data.price == null || !data.validFrom || !data.validUntil) {
    return NextResponse.json(
      { error: "title, price, validFrom, and validUntil are required" },
      { status: 400 }
    );
  }

  const pass = await prisma.pass.create({
    data: {
      title: data.title,
      description: data.description || null,
      barId,
      imageUrl: data.imageUrl || null,
      price: data.price,
      type: data.type || "SKIP_LINE",
      originalPrice: data.originalPrice || null,
      maxPerUser: data.maxPerUser || null,
      benefits: data.benefits || [],
      validFrom: new Date(data.validFrom),
      validUntil: new Date(data.validUntil),
      maxQuantity: data.maxQuantity || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });

  return NextResponse.json(pass, { status: 201 });
}
