"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { BookingRequestStatus } from "@prisma/client";

export interface CreateBookingRequestData {
  bookingId: string;
  requestedFrom: string;
  message?: string;
  expiresAt?: Date;
}

export interface BookingRequestWithDetails {
  id: string;
  bookingId: string;
  requestedBy: string;
  requestedFrom: string;
  status: BookingRequestStatus;
  message: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  booking: {
    id: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    price: number;
    teacher: {
      id: string;
      name: string;
      email: string;
    };
    student: {
      id: string;
      name: string;
      email: string;
    };
  };
  requester: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  requestee: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export async function createBookingRequest(
  data: CreateBookingRequestData
): Promise<{
  success: boolean;
  request?: BookingRequestWithDetails;
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

    // Verify booking exists
    const booking = await prisma.booking.findUnique({
      where: { id: data.bookingId },
    });

    if (!booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    // Verify user is either teacher or student
    if (booking.teacherId !== userId && booking.studentId !== userId) {
      return {
        success: false,
        error: "Unauthorized: Not a participant in this booking",
      };
    }

    // Verify requestedFrom is the other participant
    const otherParticipantId = booking.teacherId === userId ? booking.studentId : booking.teacherId;
    if (data.requestedFrom !== otherParticipantId) {
      return {
        success: false,
        error: "Invalid request: requestedFrom must be the other participant",
      };
    }

    // Check if request already exists
    const existing = await prisma.bookingRequest.findFirst({
      where: {
        bookingId: data.bookingId,
        requestedBy: userId,
        status: BookingRequestStatus.PENDING,
      },
    });

    if (existing) {
      return {
        success: false,
        error: "A pending request already exists for this booking",
      };
    }

    const request = await prisma.bookingRequest.create({
      data: {
        bookingId: data.bookingId,
        requestedBy: userId,
        requestedFrom: data.requestedFrom,
        status: BookingRequestStatus.PENDING,
        message: data.message || null,
        expiresAt: data.expiresAt || null,
      },
      include: {
        booking: {
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
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        requestee: {
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
      request: request as BookingRequestWithDetails,
    };
  } catch (error) {
    console.error("Error creating booking request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create booking request",
    };
  }
}

export async function acceptBookingRequest(id: string): Promise<{
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

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
      include: {
        booking: true,
      },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Verify user is the requestee
    if (request.requestedFrom !== userId) {
      return {
        success: false,
        error: "Unauthorized: Only the requestee can accept",
      };
    }

    if (request.status !== BookingRequestStatus.PENDING) {
      return {
        success: false,
        error: "Request is not pending",
      };
    }

    // Check if expired
    if (request.expiresAt && request.expiresAt < new Date()) {
      await prisma.bookingRequest.update({
        where: { id },
        data: { status: BookingRequestStatus.EXPIRED },
      });
      return {
        success: false,
        error: "Request has expired",
      };
    }

    // Update request status
    await prisma.bookingRequest.update({
      where: { id },
      data: { status: BookingRequestStatus.ACCEPTED },
    });

    // Update booking status to CONFIRMED
    const booking = await prisma.booking.update({
      where: { id: request.bookingId },
      data: { status: "CONFIRMED" },
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
    console.error("Error accepting booking request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to accept booking request",
    };
  }
}

export async function rejectBookingRequest(id: string): Promise<{
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

    const request = await prisma.bookingRequest.findUnique({
      where: { id },
    });

    if (!request) {
      return {
        success: false,
        error: "Request not found",
      };
    }

    // Verify user is the requestee
    if (request.requestedFrom !== userId) {
      return {
        success: false,
        error: "Unauthorized: Only the requestee can reject",
      };
    }

    await prisma.bookingRequest.update({
      where: { id },
      data: { status: BookingRequestStatus.REJECTED },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error rejecting booking request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reject booking request",
    };
  }
}

export async function getBookingRequests(filters?: {
  userId?: string;
  status?: BookingRequestStatus;
}): Promise<{
  success: boolean;
  requests?: BookingRequestWithDetails[];
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

    const where: any = {
      OR: [
        { requestedBy: userId },
        { requestedFrom: userId },
      ],
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    const requests = await prisma.bookingRequest.findMany({
      where,
      include: {
        booking: {
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
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        requestee: {
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
      requests: requests as BookingRequestWithDetails[],
    };
  } catch (error) {
    console.error("Error fetching booking requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch booking requests",
    };
  }
}

