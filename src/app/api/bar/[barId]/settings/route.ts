import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const bar = await prisma.bar.findUnique({
    where: { id: barId },
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      phone: true,
      email: true,
      website: true,
      barType: true,
      logoUrl: true,
      coverImageUrl: true,
      imageUrl: true,
      gallery: true,
      galleryImages: true,
      hours: true,
      socialLinks: true,
      notificationPrefs: true,
      amenities: true,
      isActive: true,
    },
  });
  if (!bar) return NextResponse.json({ error: "Bar not found" }, { status: 404 });
  return NextResponse.json(bar);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const data = await req.json();

  const bar = await prisma.bar.update({
    where: { id: barId },
    data: {
      name: data.name,
      description: data.description,
      address: data.address,
      phone: data.phone,
      email: data.email,
      website: data.website,
      barType: data.barType,
      logoUrl: data.logoUrl,
      coverImageUrl: data.coverImageUrl,
      galleryImages: data.galleryImages,
      hours: data.hours,
      socialLinks: data.socialLinks,
      notificationPrefs: data.notificationPrefs,
    },
  });

  return NextResponse.json(bar);
}
