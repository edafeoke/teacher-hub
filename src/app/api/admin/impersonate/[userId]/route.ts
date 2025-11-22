import { impersonateUser } from "@/server-actions/admin/user";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Call the impersonateUser server action
    const result = await impersonateUser(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to impersonate user" },
        { status: 400 }
      );
    }

    // Redirect to home page with impersonated session
    // The session cookies are set by better-auth automatically
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error: any) {
    console.error("Error impersonating user:", error);
    return NextResponse.json(
      { error: error.message || "Failed to impersonate user" },
      { status: 500 }
    );
  }
}

