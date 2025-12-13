"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { SubscriptionPlanType, SubscriptionStatus } from "@prisma/client";

export async function createSubscription(
  planType: SubscriptionPlanType
): Promise<{
  success: boolean;
  subscription?: {
    id: string;
    planType: SubscriptionPlanType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date | null;
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

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (existingSubscription) {
      return {
        success: false,
        error: "User already has an active subscription",
      };
    }

    // Calculate end date (30 days from now for now, can be customized)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planType,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate,
      },
    });

    return {
      success: true,
      subscription: {
        id: subscription.id,
        planType: subscription.planType,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      },
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create subscription",
    };
  }
}

