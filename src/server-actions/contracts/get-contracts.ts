"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { ContractStatus } from "@prisma/client";

export interface ContractWithUsers {
  id: string;
  teacherId: string;
  studentId: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  totalHours: number;
  hourlyRate: number;
  totalAmount: number;
  status: ContractStatus;
  terms: any | null;
  paymentStatus: string;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  student: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export async function getContracts(filters?: {
  userId?: string;
  role?: "teacher" | "student";
  status?: ContractStatus;
}): Promise<{
  success: boolean;
  contracts?: ContractWithUsers[];
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

    if (role === "teacher") {
      where.teacherId = userId;
    } else if (role === "student") {
      where.studentId = userId;
    } else {
      // Get contracts for both roles
      where.OR = [
        { teacherId: userId },
        { studentId: userId },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    const contracts = await prisma.contract.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      contracts: contracts as ContractWithUsers[],
    };
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch contracts",
    };
  }
}

export async function getContractById(id: string): Promise<{
  success: boolean;
  contract?: ContractWithUsers;
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

    const contract = await prisma.contract.findUnique({
      where: { id },
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
        bookings: {
          include: {
            teacher: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!contract) {
      return {
        success: false,
        error: "Contract not found",
      };
    }

    // Verify user has access to this contract
    if (contract.teacherId !== userId && contract.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return {
      success: true,
      contract: contract as ContractWithUsers,
    };
  } catch (error) {
    console.error("Error fetching contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch contract",
    };
  }
}

