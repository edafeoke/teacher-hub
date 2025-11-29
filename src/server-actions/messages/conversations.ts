"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface ConversationWithParticipant {
  id: string;
  participant: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  lastMessage: {
    content: string | null;
    timestamp: Date;
    read: boolean;
  } | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export async function getConversations(): Promise<{
  success: boolean;
  conversations?: ConversationWithParticipant[];
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

    // Get all conversations where user is participant1 or participant2
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const otherParticipant =
          conv.participant1Id === userId
            ? conv.participant2
            : conv.participant1;

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            status: { not: "READ" },
          },
        });

        const lastMessage = conv.messages[0];
        const lastMessageContent = lastMessage
          ? lastMessage.content || `[${lastMessage.messageType}]`
          : null;

        return {
          id: conv.id,
          participant: otherParticipant,
          lastMessage: lastMessage
            ? {
                content: lastMessageContent,
                timestamp: lastMessage.createdAt,
                read: lastMessage.status === "READ",
              }
            : null,
          unreadCount,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
        };
      })
    );

    return {
      success: true,
      conversations: conversationsWithUnread,
    };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch conversations",
    };
  }
}

export async function getOrCreateConversation(
  otherUserId: string
): Promise<{
  success: boolean;
  conversationId?: string;
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

    if (userId === otherUserId) {
      return {
        success: false,
        error: "Cannot create conversation with yourself",
      };
    }

    // Check if conversation already exists (in either direction)
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: userId,
            participant2Id: otherUserId,
          },
          {
            participant1Id: otherUserId,
            participant2Id: userId,
          },
        ],
      },
    });

    if (existingConversation) {
      return {
        success: true,
        conversationId: existingConversation.id,
      };
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participant1Id: userId,
        participant2Id: otherUserId,
      },
    });

    return {
      success: true,
      conversationId: conversation.id,
    };
  } catch (error) {
    console.error("Error creating conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create conversation",
    };
  }
}

export async function getConversationById(
  conversationId: string
): Promise<{
  success: boolean;
  conversation?: {
    id: string;
    participant: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
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

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participant1: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        participant2: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    // Verify user is a participant
    if (
      conversation.participant1Id !== userId &&
      conversation.participant2Id !== userId
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const otherParticipant =
      conversation.participant1Id === userId
        ? conversation.participant2
        : conversation.participant1;

    return {
      success: true,
      conversation: {
        id: conversation.id,
        participant: otherParticipant,
      },
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch conversation",
    };
  }
}

