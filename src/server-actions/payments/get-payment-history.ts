"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { PaymentStatus } from "@prisma/client";

export interface PaymentWithDetails {
  id: string;
  bookingId: string | null;
  contractId: string | null;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string | null;
  transactionId: string | null;
  paymentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  payer: {
    id: string;
    name: string;
    email: string;
  };
  payee: {
    id: string;
    name: string;
    email: string;
  };
  booking: {
    id: string;
    subject: string;
    startTime: Date;
  } | null;
  contract: {
    id: string;
    title: string;
  } | null;
}

export async function getPaymentHistory(filters?: {
  userId?: string;
  role?: "payer" | "payee";
  status?: PaymentStatus;
}): Promise<{
  success: boolean;
  payments?: PaymentWithDetails[];
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

    const userId = filters?.userId || session.user.id;
    const role = filters?.role;

    const where: any = {};

    if (role === "payer") {
      where.payerId = userId;
    } else if (role === "payee") {
      where.payeeId = userId;
    } else {
      // Get payments for both roles
      where.OR = [
        { payerId: userId },
        { payeeId: userId },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            subject: true,
            startTime: true,
          },
        },
        contract: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      payments: payments as PaymentWithDetails[],
    };
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch payment history",
    };
  }
}

