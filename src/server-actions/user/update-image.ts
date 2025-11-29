"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function updateUserImage(
  imageUrl: string
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

    // Update user image
    await prisma.user.update({
      where: { id: userId },
      data: {
        image: imageUrl,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user image",
    };
  }
}

