"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingStatus } from "@prisma/client";

export interface BookingWithUsers {
  id: string;
  teacherId: string;
  studentId: string;
  contractId: string | null;
  subject: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: BookingStatus;
  notes: string | null;
  price: number;
  paymentStatus: string;
  isRecurring: boolean;
  recurringPattern: any | null;
  parentBookingId: string | null;
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

export async function getBookings(filters?: {
  userId?: string;
  role?: "teacher" | "student";
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  success: boolean;
  bookings?: BookingWithUsers[];
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
      // Get bookings for both roles
      where.OR = [
        { teacherId: userId },
        { studentId: userId },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.startTime.lte = filters.endDate;
      }
    }

    const bookings = await prisma.booking.findMany({
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
        startTime: "asc",
      },
    });

    return {
      success: true,
      bookings: bookings as BookingWithUsers[],
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch bookings",
    };
  }
}

export async function getBookingById(id: string): Promise<{
  success: boolean;
  booking?: BookingWithUsers;
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

    const booking = await prisma.booking.findUnique({
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
      },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Verify user has access to this booking
    if (booking.teacherId !== userId && booking.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    return {
      success: true,
      booking: booking as BookingWithUsers,
    };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch booking",
    };
  }
}

