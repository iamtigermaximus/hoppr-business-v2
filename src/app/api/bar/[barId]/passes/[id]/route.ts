import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  const { barId, id } = await params;
  const pass = await prisma.pass.findFirst({
    where: { id, barId },
    include: { redemptions: true },
  });
  if (!pass) return NextResponse.json({ error: "Pass not found" }, { status: 404 });
  return NextResponse.json(pass);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId, id } = await params;
  const data = await req.json();

  const existing = await prisma.pass.findFirst({ where: { id, barId } });
  if (!existing) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

  const pass = await prisma.pass.update({
    where: { id },
    data: {
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl,
      price: data.price !== undefined ? data.price : existing.price,
      type: data.type !== undefined ? data.type : existing.type,
      originalPrice: data.originalPrice !== undefined ? data.originalPrice : existing.originalPrice,
      maxPerUser: data.maxPerUser !== undefined ? data.maxPerUser : existing.maxPerUser,
      benefits: data.benefits !== undefined ? data.benefits : existing.benefits,
      validFrom: data.validFrom ? new Date(data.validFrom) : existing.validFrom,
      validUntil: data.validUntil ? new Date(data.validUntil) : existing.validUntil,
      maxQuantity: data.maxQuantity !== undefined ? data.maxQuantity : existing.maxQuantity,
      isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
    },
    include: { redemptions: true },
  });

  return NextResponse.json(pass);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ barId: string; id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId, id } = await params;

  const existing = await prisma.pass.findFirst({ where: { id, barId } });
  if (!existing) return NextResponse.json({ error: "Pass not found" }, { status: 404 });

  await prisma.pass.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
