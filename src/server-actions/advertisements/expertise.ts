"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { checkSubscriptionStatus } from "@/server-actions/subscriptions/check-subscription-status";

export interface ExpertiseAdData {
  title: string;
  description: string;
  subjects: string[];
  hourlyRate: number;
  availableTimeSlots: any; // JSON
  specialOffers?: any; // JSON
}

export interface ExpertiseAdvertisementWithTeacher {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  subjects: string[];
  hourlyRate: number;
  availableTimeSlots: any;
  specialOffers: any | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  teacherProfile: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export async function createExpertiseAd(
  data: ExpertiseAdData
): Promise<{
  success: boolean;
  advertisement?: ExpertiseAdvertisementWithTeacher;
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

    // Check if user has teacher profile
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: "Teacher profile not found",
      };
    }

    // Check subscription status - only subscribed teachers can create ads
    const subscriptionCheck = await checkSubscriptionStatus();
    if (!subscriptionCheck.success || !subscriptionCheck.hasActiveSubscription) {
      return {
        success: false,
        error: "Active subscription required to create expertise advertisements",
      };
    }

    const advertisement = await prisma.expertiseAdvertisement.create({
      data: {
        teacherId: teacherProfile.id,
        title: data.title,
        description: data.description,
        subjects: data.subjects,
        hourlyRate: data.hourlyRate,
        availableTimeSlots: data.availableTimeSlots,
        specialOffers: data.specialOffers || null,
        isActive: true,
      },
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      advertisement: advertisement as ExpertiseAdvertisementWithTeacher,
    };
  } catch (error) {
    console.error("Error creating expertise advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create expertise advertisement",
    };
  }
}

export async function updateExpertiseAd(
  id: string,
  data: Partial<ExpertiseAdData> & { isActive?: boolean }
): Promise<{
  success: boolean;
  advertisement?: ExpertiseAdvertisementWithTeacher;
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

    // Verify ownership
    const existing = await prisma.expertiseAdvertisement.findUnique({
      where: { id },
      include: {
        teacherProfile: true,
      },
    });

    if (!existing || existing.teacherProfile.userId !== userId) {
      return {
        success: false,
        error: "Advertisement not found or unauthorized",
      };
    }

    const advertisement = await prisma.expertiseAdvertisement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.subjects && { subjects: data.subjects }),
        ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
        ...(data.availableTimeSlots && { availableTimeSlots: data.availableTimeSlots }),
        ...(data.specialOffers !== undefined && { specialOffers: data.specialOffers }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      advertisement: advertisement as ExpertiseAdvertisementWithTeacher,
    };
  } catch (error) {
    console.error("Error updating expertise advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update expertise advertisement",
    };
  }
}

export async function getExpertiseAds(filters?: {
  isActive?: boolean;
  subjects?: string[];
  minRate?: number;
  maxRate?: number;
}): Promise<{
  success: boolean;
  advertisements?: ExpertiseAdvertisementWithTeacher[];
  error?: string;
}> {
  try {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      where.isActive = true; // Default to active only
    }

    if (filters?.subjects && filters.subjects.length > 0) {
      where.subjects = {
        hasSome: filters.subjects,
      };
    }

    if (filters?.minRate !== undefined || filters?.maxRate !== undefined) {
      where.hourlyRate = {};
      if (filters.minRate !== undefined) {
        where.hourlyRate.gte = filters.minRate;
      }
      if (filters.maxRate !== undefined) {
        where.hourlyRate.lte = filters.maxRate;
      }
    }

    const advertisements = await prisma.expertiseAdvertisement.findMany({
      where,
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      advertisements: advertisements as ExpertiseAdvertisementWithTeacher[],
    };
  } catch (error) {
    console.error("Error fetching expertise advertisements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch expertise advertisements",
    };
  }
}

export async function deleteExpertiseAd(id: string): Promise<{
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

    // Verify ownership
    const existing = await prisma.expertiseAdvertisement.findUnique({
      where: { id },
      include: {
        teacherProfile: true,
      },
    });

    if (!existing || existing.teacherProfile.userId !== userId) {
      return {
        success: false,
        error: "Advertisement not found or unauthorized",
      };
    }

    await prisma.expertiseAdvertisement.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting expertise advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete expertise advertisement",
    };
  }
}

export async function getTeacherExpertiseAds(): Promise<{
  success: boolean;
  advertisements?: ExpertiseAdvertisementWithTeacher[];
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

    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      return {
        success: false,
        error: "Teacher profile not found",
      };
    }

    const advertisements = await prisma.expertiseAdvertisement.findMany({
      where: {
        teacherId: teacherProfile.id,
      },
      include: {
        teacherProfile: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      advertisements: advertisements as ExpertiseAdvertisementWithTeacher[],
    };
  } catch (error) {
    console.error("Error fetching teacher expertise advertisements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch teacher expertise advertisements",
    };
  }
}

