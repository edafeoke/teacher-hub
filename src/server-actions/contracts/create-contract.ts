"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { ContractStatus, PaymentStatus } from "@prisma/client";

export interface CreateContractData {
  teacherId: string;
  studentId: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  totalHours: number;
  hourlyRate: number;
  terms?: any; // JSON
}

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
  paymentStatus: PaymentStatus;
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

export async function createContract(
  data: CreateContractData
): Promise<{
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

    // Verify teacher exists
    const teacher = await prisma.user.findUnique({
      where: { id: data.teacherId },
      include: {
        teacherProfile: true,
      },
    });

    if (!teacher || !teacher.teacherProfile) {
      return {
        success: false,
        error: "Teacher not found",
      };
    }

    // Calculate total amount
    const totalAmount = data.totalHours * data.hourlyRate;

    const contract = await prisma.contract.create({
      data: {
        teacherId: data.teacherId,
        studentId: data.studentId,
        title: data.title,
        description: data.description || null,
        startDate: data.startDate,
        endDate: data.endDate || null,
        totalHours: data.totalHours,
        hourlyRate: data.hourlyRate,
        totalAmount,
        status: ContractStatus.DRAFT,
        terms: data.terms || null,
        paymentStatus: PaymentStatus.PENDING,
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
      contract: contract as ContractWithUsers,
    };
  } catch (error) {
    console.error("Error creating contract:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create contract",
    };
  }
}

