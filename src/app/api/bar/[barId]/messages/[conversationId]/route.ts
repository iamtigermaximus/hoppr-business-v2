import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: get messages in a conversation
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ barId: string; conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;

  const messages = await prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return NextResponse.json(messages);
}

// POST: send a new message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ barId: string; conversationId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { barId, conversationId } = await params;
  const userId = (session.user as any).id;
  const body = await req.json();

  if (!body.content || !body.content.trim()) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  // Update the conversation's lastMessageAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  const message = await prisma.conversationMessage.create({
    data: {
      conversationId,
      senderId: userId,
      content: body.content.trim(),
    },
  });

  return NextResponse.json(message, { status: 201 });
}
