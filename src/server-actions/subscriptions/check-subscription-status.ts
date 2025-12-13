"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { SubscriptionStatus, SubscriptionPlanType } from "@prisma/client";

export async function checkSubscriptionStatus(): Promise<{
  success: boolean;
  hasActiveSubscription?: boolean;
  planType?: SubscriptionPlanType;
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

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!subscription) {
      return {
        success: true,
        hasActiveSubscription: false,
      };
    }

    // Check if subscription has expired
    const now = new Date();
    if (subscription.endDate && subscription.endDate < now) {
      // Update status to expired
      await prisma.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

      return {
        success: true,
        hasActiveSubscription: false,
      };
    }

    return {
      success: true,
      hasActiveSubscription: true,
      planType: subscription.planType,
    };
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check subscription status",
    };
  }
}

