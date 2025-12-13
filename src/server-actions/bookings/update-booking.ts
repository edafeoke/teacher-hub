"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingStatus, PaymentStatus } from "@prisma/client";

export interface UpdateBookingData {
  status?: BookingStatus;
  notes?: string;
  price?: number;
  paymentStatus?: PaymentStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export async function updateBooking(
  id: string,
  data: UpdateBookingData
): Promise<{
  success: boolean;
  booking?: any;
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

    // Verify booking exists and user has access
    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Verify user is teacher or student for this booking
    if (existing.teacherId !== userId && existing.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Only teachers can change status to CONFIRMED or COMPLETED
    if (data.status && (data.status === "CONFIRMED" || data.status === "COMPLETED")) {
      if (existing.teacherId !== userId) {
        return {
          success: false,
          error: "Only teacher can confirm or complete bookings",
        };
      }
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime && { endTime: data.endTime }),
        ...(data.duration !== undefined && { duration: data.duration }),
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
      booking,
    };
  } catch (error) {
    console.error("Error updating booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update booking",
    };
  }
}

export async function cancelBooking(id: string): Promise<{
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

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (existing.teacherId !== userId && existing.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Cancel booking and any child bookings if it's a parent
    await prisma.booking.updateMany({
      where: {
        OR: [
          { id },
          { parentBookingId: id },
        ],
      },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel booking",
    };
  }
}

