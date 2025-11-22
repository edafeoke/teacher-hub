"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function revokeSession(sessionToken: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await auth.api.revokeSession({
      body: {
        token: sessionToken,
      },
      headers: await headers(),
    });

    revalidatePath("/admin/sessions");
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to revoke session";
    return { success: false, error: errorMessage };
  }
}

