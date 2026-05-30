import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List staff for a bar
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const staff = await prisma.barStaff.findMany({
    where: { barId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(staff);
}

// POST: Invite staff (create BarStaff record with STAFF role)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  if (!data.email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Find user by email
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
  }

  // Check if already staff
  const existing = await prisma.barStaff.findUnique({
    where: { barId_userId: { barId, userId: user.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "User is already a staff member" }, { status: 409 });
  }

  const staff = await prisma.barStaff.create({
    data: {
      barId,
      userId: user.id,
      role: data.role || "STAFF",
      permissions: data.permissions || [],
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json(staff, { status: 201 });
}

// DELETE: Remove staff by userId query param
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  await prisma.barStaff.deleteMany({
    where: { barId, userId },
  });

  return NextResponse.json({ success: true });
}
