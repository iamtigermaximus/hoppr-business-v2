import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barId: string }> }
) {
  const { barId } = await params;
  const posts = await prisma.socialPost.findMany({
    where: { barId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(posts);
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
  const post = await prisma.socialPost.create({
    data: {
      barId,
      platform: data.platform || "INSTAGRAM",
      content: data.content,
      imageUrl: data.imageUrl || null,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
      status: data.scheduledFor ? "SCHEDULED" : "DRAFT",
    },
  });

  return NextResponse.json(post, { status: 201 });
}
