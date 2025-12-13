"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export interface CreateBookingData {
  teacherId: string;
  studentId: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  notes?: string;
  price: number;
  contractId?: string;
  isRecurring?: boolean;
  recurringPattern?: any; // JSON
}

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
  paymentStatus: PaymentStatus;
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

export async function createBooking(
  data: CreateBookingData
): Promise<{
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

    // Verify the studentId matches the current user (students book for themselves)
    if (data.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized: Can only create bookings for yourself",
      };
    }

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

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        teacherId: data.teacherId,
        studentId: data.studentId,
        contractId: data.contractId || null,
        subject: data.subject,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        status: BookingStatus.PENDING,
        notes: data.notes || null,
        price: data.price,
        paymentStatus: PaymentStatus.PENDING,
        isRecurring: data.isRecurring || false,
        recurringPattern: data.recurringPattern || null,
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

    // If recurring, create child bookings
    if (data.isRecurring && data.recurringPattern) {
      await createRecurringBookings(booking.id, data.recurringPattern);
    }

    return {
      success: true,
      booking: booking as BookingWithUsers,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking",
    };
  }
}

async function createRecurringBookings(
  parentBookingId: string,
  pattern: { frequency: "daily" | "weekly" | "monthly"; count: number }
): Promise<void> {
  try {
    const parentBooking = await prisma.booking.findUnique({
      where: { id: parentBookingId },
    });

    if (!parentBooking) return;

    const bookings = [];
    const startTime = new Date(parentBooking.startTime);
    const endTime = new Date(parentBooking.endTime);

    for (let i = 1; i <= pattern.count; i++) {
      let nextStartTime: Date;
      let nextEndTime: Date;

      switch (pattern.frequency) {
        case "daily":
          nextStartTime = new Date(startTime);
          nextStartTime.setDate(nextStartTime.getDate() + i);
          nextEndTime = new Date(endTime);
          nextEndTime.setDate(nextEndTime.getDate() + i);
          break;
        case "weekly":
          nextStartTime = new Date(startTime);
          nextStartTime.setDate(nextStartTime.getDate() + i * 7);
          nextEndTime = new Date(endTime);
          nextEndTime.setDate(nextEndTime.getDate() + i * 7);
          break;
        case "monthly":
          nextStartTime = new Date(startTime);
          nextStartTime.setMonth(nextStartTime.getMonth() + i);
          nextEndTime = new Date(endTime);
          nextEndTime.setMonth(nextEndTime.getMonth() + i);
          break;
        default:
          continue;
      }

      bookings.push({
        teacherId: parentBooking.teacherId,
        studentId: parentBooking.studentId,
        contractId: parentBooking.contractId,
        subject: parentBooking.subject,
        startTime: nextStartTime,
        endTime: nextEndTime,
        duration: parentBooking.duration,
        status: BookingStatus.PENDING,
        notes: parentBooking.notes,
        price: parentBooking.price,
        paymentStatus: PaymentStatus.PENDING,
        isRecurring: false,
        parentBookingId: parentBookingId,
      });
    }

    await prisma.booking.createMany({
      data: bookings,
    });
  } catch (error) {
    console.error("Error creating recurring bookings:", error);
  }
}

