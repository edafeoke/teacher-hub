"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

export interface CreatePaymentIntentData {
  bookingId?: string;
  contractId?: string;
  amount: number;
  currency?: string;
  description?: string;
}

export async function createPaymentIntent(
  data: CreatePaymentIntentData
): Promise<{
  success: boolean;
  clientSecret?: string;
  paymentId?: string;
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

    // Verify booking or contract exists and user has access
    let payeeId: string | null = null;
    let payerId = userId;

    if (data.bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: data.bookingId },
      });

      if (!booking) {
        return {
          success: false,
          error: "Booking not found",
        };
      }

      if (booking.studentId !== userId && booking.teacherId !== userId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      // Student pays teacher
      payeeId = booking.teacherId;
      payerId = booking.studentId;
    } else if (data.contractId) {
      const contract = await prisma.contract.findUnique({
        where: { id: data.contractId },
      });

      if (!contract) {
        return {
          success: false,
          error: "Contract not found",
        };
      }

      if (contract.studentId !== userId && contract.teacherId !== userId) {
        return {
          success: false,
          error: "Unauthorized",
        };
      }

      // Student pays teacher
      payeeId = contract.teacherId;
      payerId = contract.studentId;
    } else {
      return {
        success: false,
        error: "Either bookingId or contractId must be provided",
      };
    }

    if (!payeeId) {
      return {
        success: false,
        error: "Payee not found",
      };
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: data.bookingId || null,
        contractId: data.contractId || null,
        payerId,
        payeeId,
        amount: data.amount,
        currency: data.currency || "USD",
        status: PaymentStatus.PENDING,
      },
    });

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100), // Convert to cents
      currency: data.currency || "usd",
      description: data.description || `Payment for ${data.bookingId ? "booking" : "contract"}`,
      metadata: {
        paymentId: payment.id,
        bookingId: data.bookingId || "",
        contractId: data.contractId || "",
        payerId,
        payeeId,
      },
    });

    // Update payment with transaction ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId: paymentIntent.id,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret || undefined,
      paymentId: payment.id,
    };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment intent",
    };
  }
}

