import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const claimStatus = req.nextUrl.searchParams.get("claimStatus");

  const where: any = {};
  if (claimStatus && claimStatus !== "all") {
    where.claimStatus = claimStatus;
  }

  const bars = await prisma.bar.findMany({
    where,
    select: {
      id: true,
      name: true,
      address: true,
      latitude: true,
      longitude: true,
      phone: true,
      email: true,
      website: true,
      imageUrl: true,
      isActive: true,
      claimStatus: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(bars);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await req.json();

  const bar = await prisma.bar.create({
    data: {
      name: data.name,
      description: data.description || null,
      address: data.address || "",
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      phone: data.phone || null,
      email: data.email || null,
      website: data.website || null,
      imageUrl: data.imageUrl || null,
      isActive: data.isActive ?? true,
    },
  });

  return NextResponse.json(bar, { status: 201 });
}
