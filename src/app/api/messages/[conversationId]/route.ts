import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@/server-actions/messages/messages";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const result = await getMessages(conversationId, page, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch messages" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        messages: result.messages || [],
        hasMore: result.hasMore || false,
      },
      {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

