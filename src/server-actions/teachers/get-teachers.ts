"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface TeacherWithUser {
  id: string;
  userId: string;
  bio: string | null;
  city: string | null;
  country: string | null;
  hourlyRate: number | null;
  yearsOfExperience: number | null;
  subjectsTaught: string[];
  levels: string[];
  languagesSpoken: string[];
  qualifications: string | null;
  teachingStyle: string | null;
  verificationStatus: string | null;
  demoClassAvailable: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export async function getTeachers(): Promise<{
  success: boolean;
  teachers?: TeacherWithUser[];
  error?: string;
}> {
  try {
    // Get current session to exclude current user's teacher profile
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const currentUserId = session?.user?.id;

    // Fetch all verified teachers (or pending/verified)
    // For now, we'll show all teachers regardless of verification status
    // You can filter by verificationStatus === "verified" if needed
    const teachers = await prisma.teacherProfile.findMany({
      where: {
        // Exclude current user's teacher profile if they have one
        ...(currentUserId ? { userId: { not: currentUserId } } : {}),
        // Only show teachers with complete profiles
        // You can add: verificationStatus: { in: ["verified", "pending"] }
      },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, teachers: teachers as TeacherWithUser[] };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch teachers",
    };
  }
}

export async function getTeacherById(id: string): Promise<{
  success: boolean;
  teacher?: TeacherWithUser;
  error?: string;
}> {
  try {
    const teacher = await prisma.teacherProfile.findUnique({
      where: { id },
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
    });

    if (!teacher) {
      return {
        success: false,
        error: "Teacher not found",
      };
    }

    return { success: true, teacher: teacher as TeacherWithUser };
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch teacher",
    };
  }
}

