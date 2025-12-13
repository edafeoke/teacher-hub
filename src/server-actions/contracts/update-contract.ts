"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { ContractStatus, PaymentStatus } from "@prisma/client";

export interface UpdateContractData {
  title?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  totalHours?: number;
  hourlyRate?: number;
  terms?: any;
  status?: ContractStatus;
  paymentStatus?: PaymentStatus;
}

export async function updateContract(
  id: string,
  data: UpdateContractData
): Promise<{
  success: boolean;
  contract?: any;
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

    // Verify contract exists and user has access
    const existing = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    // Verify user is teacher or student for this contract
    if (existing.teacherId !== userId && existing.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Calculate total amount if hours or rate changed
    let totalAmount = existing.totalAmount;
    if (data.totalHours !== undefined || data.hourlyRate !== undefined) {
      const hours = data.totalHours ?? existing.totalHours;
      const rate = data.hourlyRate ?? existing.hourlyRate;
      totalAmount = hours * rate;
    }

    const contract = await prisma.contract.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate || null }),
        ...(data.totalHours !== undefined && { totalHours: data.totalHours }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.terms !== undefined && { terms: data.terms || null }),
        ...(data.status && { status: data.status }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(totalAmount !== existing.totalAmount && { totalAmount }),
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return {
      success: true,
      contract,
    };
  } catch (error) {
    console.error("Error updating contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update contract",
    };
  }
}

export async function terminateContract(id: string): Promise<{
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

    const existing = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    if (existing.teacherId !== userId && existing.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    if (existing.status === ContractStatus.TERMINATED) {
      return {
        success: false,
        error: "Contract is already terminated",
      };
    }

    await prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.TERMINATED,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error terminating contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to terminate contract",
    };
  }
}

export async function completeContract(id: string): Promise<{
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

    const existing = await prisma.contract.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    // Only teacher can complete contract
    if (existing.teacherId !== userId) {
      return {
        success: false,
        error: "Unauthorized: Only teacher can complete contract",
      };
    }

    if (existing.status !== ContractStatus.ACTIVE) {
      return {
        success: false,
        error: "Only active contracts can be completed",
      };
    }

    await prisma.contract.update({
      where: { id },
      data: {
        status: ContractStatus.COMPLETED,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error completing contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete contract",
    };
  }
}

