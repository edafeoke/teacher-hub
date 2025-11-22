"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { updateTeacherProfileSchema, type UpdateTeacherProfileData } from "@/lib/validations/teacher-profile";

export async function updateTeacherProfile(data: UpdateTeacherProfileData) {
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

    // Validate the data
    const validatedData = updateTeacherProfileSchema.parse(data);

    // Check if profile exists
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      return {
        success: false,
        error: "Teacher profile not found",
      };
    }

    // Update teacher profile
    const profile = await prisma.teacherProfile.update({
      where: { userId: session.user.id },
      data: {
        ...validatedData,
        // Convert empty strings to null for optional fields
        bio: validatedData.bio === "" ? null : validatedData.bio,
        city: validatedData.city === "" ? null : validatedData.city,
        country: validatedData.country === "" ? null : validatedData.country,
        phoneNumber: validatedData.phoneNumber === "" ? null : validatedData.phoneNumber,
        qualifications: validatedData.qualifications === "" ? null : validatedData.qualifications,
        teachingStyle: validatedData.teachingStyle === "" ? null : validatedData.teachingStyle,
        introVideoUrl: validatedData.introVideoUrl === "" || validatedData.introVideoUrl === null ? null : validatedData.introVideoUrl,
      },
    });

    return { success: true, profile };
  } catch (error) {
    console.error("Error updating teacher profile:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return {
        success: false,
        error: "Validation error",
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update teacher profile",
    };
  }
}

export async function getTeacherProfile() {
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

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
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

    if (!profile) {
      return {
        success: false,
        error: "Teacher profile not found",
      };
    }

    return { success: true, profile };
  } catch (error) {
    console.error("Error fetching teacher profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch teacher profile",
    };
  }
}

