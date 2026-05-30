import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: list conversations for this bar
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;

  const conversations = await prisma.conversation.findMany({
    where: { barId },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
    take: 50,
  });

  return NextResponse.json(conversations);
}

// POST: create new conversation with initial message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json();

  if (!body.content || !body.content.trim()) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const conversation = await prisma.conversation.create({
    data: {
      barId,
      participants: [userId],
      lastMessageAt: new Date(),
      messages: {
        create: {
          senderId: userId,
          content: body.content.trim(),
        },
      },
    },
    include: { messages: true },
  });

  return NextResponse.json(conversation, { status: 201 });
}
