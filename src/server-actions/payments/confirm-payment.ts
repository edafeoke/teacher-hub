"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { PaymentStatus } from "@prisma/client";

export async function confirmPayment(
  paymentId: string
): Promise<{
  success: boolean;
  payment?: any;
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

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return {
        success: false,
        error: "Payment not found",
      };
    }

    // Verify user is payer or payee
    if (payment.payerId !== session.user.id && payment.payeeId !== session.user.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        paymentDate: new Date(),
      },
      include: {
        booking: true,
        contract: true,
      },
    });

    // Update booking or contract payment status
    if (updatedPayment.bookingId) {
      await prisma.booking.update({
        where: { id: updatedPayment.bookingId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
        },
      });
    }

    if (updatedPayment.contractId) {
      await prisma.contract.update({
        where: { id: updatedPayment.contractId },
        data: {
          paymentStatus: PaymentStatus.COMPLETED,
        },
      });
    }

    return {
      success: true,
      payment: updatedPayment,
    };
  } catch (error) {
    console.error("Error confirming payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to confirm payment",
    };
  }
}

