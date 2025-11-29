"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { MessageType, MessageStatus } from "@prisma/client";

export interface MessageWithAttachments {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  status: MessageStatus;
  timestamp: Date;
  attachments: {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl: string | null;
    duration: number | null;
  }[];
}

export interface SendMessageData {
  conversationId: string;
  content?: string;
  messageType: MessageType;
  attachments?: {
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    thumbnailUrl?: string;
    duration?: number;
  }[];
}

export async function sendMessage(
  data: SendMessageData
): Promise<{
  success: boolean;
  message?: MessageWithAttachments;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Verify user is a participant in the conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
    });

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content || null,
        messageType: data.messageType,
        status: MessageStatus.SENT,
        attachments: {
          create: data.attachments || [],
        },
      },
      include: {
        attachments: true,
      },
    });

    // Update conversation's lastMessageAt
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Mark as delivered for the other participant
    // (In a real app, this would be done when the other user's client receives it)
    await prisma.message.update({
      where: { id: message.id },
      data: {
        status: MessageStatus.DELIVERED,
      },
    });

    return {
      success: true,
      message: {
        id: message.id,
        conversationId: message.conversationId,
        senderId: message.senderId,
        content: message.content,
        messageType: message.messageType,
        status: MessageStatus.DELIVERED,
        timestamp: message.createdAt,
        attachments: message.attachments.map((att) => ({
          id: att.id,
          fileUrl: att.fileUrl,
          fileName: att.fileName,
          fileType: att.fileType,
          fileSize: att.fileSize,
          thumbnailUrl: att.thumbnailUrl,
          duration: att.duration,
        })),
      },
    };
  } catch (error) {
    console.error("Error sending message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function getMessages(
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{
  success: boolean;
  messages?: MessageWithAttachments[];
  hasMore?: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const skip = (page - 1) * limit;

    const [messages, totalCount] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: {
          attachments: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.message.count({
        where: { conversationId },
      }),
    ]);

    // Reverse to show oldest first
    const reversedMessages = messages.reverse();

    return {
      success: true,
      messages: reversedMessages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
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
      hasMore: skip + messages.length < totalCount,
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch messages",
    };
  }
}

export async function markMessagesAsRead(
  conversationId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Verify user is a participant
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Mark all messages from other participant as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: "READ" },
      },
      data: {
        status: MessageStatus.READ,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark messages as read",
    };
  }
}

export async function deleteMessage(
  messageId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = session.user.id;

    // Verify user is the sender
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return {
        success: false,
        error: "Message not found",
      };
    }

    if (message.senderId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Delete message (cascade will delete attachments)
    await prisma.message.delete({
      where: { id: messageId },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting message:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

