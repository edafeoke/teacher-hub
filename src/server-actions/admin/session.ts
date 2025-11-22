"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function revokeSession(sessionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await auth.api.revokeSession({
      body: {
        sessionId,
      },
      headers: await headers(),
    });

    revalidatePath("/admin/sessions");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to revoke session" };
  }
}

