"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface LearningNeedAdData {
  title: string;
  description: string;
  subjects: string[];
  budgetRange: string;
  preferredSchedule: any; // JSON
  learningGoals?: string;
}

export interface LearningNeedAdvertisementWithStudent {
  id: string;
  studentId: string;
  title: string;
  description: string;
  subjects: string[];
  budgetRange: string;
  preferredSchedule: any;
  learningGoals: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  studentProfile: {
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

export async function createLearningNeedAd(
  data: LearningNeedAdData
): Promise<{
  success: boolean;
  advertisement?: LearningNeedAdvertisementWithStudent;
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

    // Check if user has student profile
    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      return {
        success: false,
        error: "Student profile not found",
      };
    }

    const advertisement = await prisma.learningNeedAdvertisement.create({
      data: {
        studentId: studentProfile.id,
        title: data.title,
        description: data.description,
        subjects: data.subjects,
        budgetRange: data.budgetRange,
        preferredSchedule: data.preferredSchedule,
        learningGoals: data.learningGoals || null,
        isActive: true,
      },
      include: {
        studentProfile: {
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
      advertisement: advertisement as LearningNeedAdvertisementWithStudent,
    };
  } catch (error) {
    console.error("Error creating learning need advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create learning need advertisement",
    };
  }
}

export async function updateLearningNeedAd(
  id: string,
  data: Partial<LearningNeedAdData> & { isActive?: boolean }
): Promise<{
  success: boolean;
  advertisement?: LearningNeedAdvertisementWithStudent;
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
    const existing = await prisma.learningNeedAdvertisement.findUnique({
      where: { id },
      include: {
        studentProfile: true,
      },
    });

    if (!existing || existing.studentProfile.userId !== userId) {
      return {
        success: false,
        error: "Advertisement not found or unauthorized",
      };
    }

    const advertisement = await prisma.learningNeedAdvertisement.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.subjects && { subjects: data.subjects }),
        ...(data.budgetRange && { budgetRange: data.budgetRange }),
        ...(data.preferredSchedule && { preferredSchedule: data.preferredSchedule }),
        ...(data.learningGoals !== undefined && { learningGoals: data.learningGoals || null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: {
        studentProfile: {
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
      advertisement: advertisement as LearningNeedAdvertisementWithStudent,
    };
  } catch (error) {
    console.error("Error updating learning need advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update learning need advertisement",
    };
  }
}

export async function getLearningNeedAds(filters?: {
  isActive?: boolean;
  subjects?: string[];
  budgetRange?: string;
}): Promise<{
  success: boolean;
  advertisements?: LearningNeedAdvertisementWithStudent[];
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

    if (filters?.budgetRange) {
      where.budgetRange = filters.budgetRange;
    }

    const advertisements = await prisma.learningNeedAdvertisement.findMany({
      where,
      include: {
        studentProfile: {
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
      advertisements: advertisements as LearningNeedAdvertisementWithStudent[],
    };
  } catch (error) {
    console.error("Error fetching learning need advertisements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch learning need advertisements",
    };
  }
}

export async function deleteLearningNeedAd(id: string): Promise<{
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
    const existing = await prisma.learningNeedAdvertisement.findUnique({
      where: { id },
      include: {
        studentProfile: true,
      },
    });

    if (!existing || existing.studentProfile.userId !== userId) {
      return {
        success: false,
        error: "Advertisement not found or unauthorized",
      };
    }

    await prisma.learningNeedAdvertisement.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting learning need advertisement:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete learning need advertisement",
    };
  }
}

export async function getStudentLearningNeedAds(): Promise<{
  success: boolean;
  advertisements?: LearningNeedAdvertisementWithStudent[];
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

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!studentProfile) {
      return {
        success: false,
        error: "Student profile not found",
      };
    }

    const advertisements = await prisma.learningNeedAdvertisement.findMany({
      where: {
        studentId: studentProfile.id,
      },
      include: {
        studentProfile: {
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
      advertisements: advertisements as LearningNeedAdvertisementWithStudent[],
    };
  } catch (error) {
    console.error("Error fetching student learning need advertisements:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch student learning need advertisements",
    };
  }
}

