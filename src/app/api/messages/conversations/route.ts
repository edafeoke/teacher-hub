import { NextResponse } from "next/server";
import { getConversations } from "@/server-actions/messages/conversations";

export async function GET() {
  try {
    const result = await getConversations();
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    return NextResponse.json(result.conversations || [], {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

