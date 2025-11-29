import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const lastMessageId = searchParams.get("lastMessageId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Build query for new messages
    const where: any = {
      conversationId,
      senderId: { not: userId }, // Only messages from other participant
    };

    if (lastMessageId) {
      // Get the timestamp of the last message we have
      const lastMessage = await prisma.message.findUnique({
        where: { id: lastMessageId },
        select: { createdAt: true },
      });

      if (lastMessage) {
        where.createdAt = { gt: lastMessage.createdAt };
      }
    }

    // Fetch new messages
    const newMessages = await prisma.message.findMany({
      where,
      include: {
        attachments: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Mark messages as delivered
    if (newMessages.length > 0) {
      await prisma.message.updateMany({
        where: {
          id: { in: newMessages.map((m) => m.id) },
          status: "SENT",
        },
        data: {
          status: "DELIVERED",
        },
      });
    }

    return NextResponse.json({
      success: true,
      messages: newMessages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        sender: msg.sender,
        content: msg.content,
        messageType: msg.messageType,
        status: msg.status,
        timestamp: msg.createdAt,
        attachments: msg.attachments.map((att) => ({
          id: att.id,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          fileType: att.fileType,
          fileSize: att.fileSize,
          thumbnailUrl: att.thumbnailUrl,
          duration: att.duration,
        })),
      })),
    });
  } catch (error) {
    console.error("Error polling messages:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to poll messages",
      },
      { status: 500 }
    );
  }
}

