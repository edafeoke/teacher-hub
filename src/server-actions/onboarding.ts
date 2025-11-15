"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type {
  TeacherOnboardingData,
  StudentOnboardingData,
} from "@/lib/validations/onboarding";

export async function createTeacherProfile(data: TeacherOnboardingData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Check if profile already exists
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      throw new Error("Teacher profile already exists");
    }

    // Create teacher profile
    const profile = await prisma.teacherProfile.create({
      data: {
        userId: session.user.id,
        gender: data.basicInfo.gender || null,
        dateOfBirth: data.basicInfo.dateOfBirth || null,
        bio: data.basicInfo.bio || null,
        city: data.basicInfo.city || null,
        country: data.basicInfo.country || null,
        subjectsTaught: data.professionalDetails.subjectsTaught,
        levels: data.professionalDetails.levels,
        yearsOfExperience: data.professionalDetails.yearsOfExperience || null,
        qualifications: data.professionalDetails.qualifications || null,
        teachingStyle: data.professionalDetails.teachingStyle || null,
        hourlyRate: data.professionalDetails.hourlyRate || null,
        demoClassAvailable: data.professionalDetails.demoClassAvailable,
        availability: data.availability.availability || null,
        languagesSpoken: data.availability.languagesSpoken,
        phoneNumber: data.availability.phoneNumber || null,
        verificationStatus: "pending",
      } as any,
    });

    return { success: true, profile };
  } catch (error) {
    console.error("Error creating teacher profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create teacher profile",
    };
  }
}

export async function createStudentProfile(data: StudentOnboardingData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    // Check if profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      throw new Error("Student profile already exists");
    }

    // Create student profile
    const profile = await prisma.studentProfile.create({
      data: {
        userId: session.user.id,
        gender: data.basicInfo.gender || null,
        dateOfBirth: data.basicInfo.dateOfBirth || null,
        city: data.basicInfo.city || null,
        country: data.basicInfo.country || null,
        subjectsOfInterest: data.learningDetails.subjectsOfInterest,
        learningLevel: data.learningDetails.learningLevel || null,
        learningGoals: data.learningDetails.learningGoals || null,
        preferredMode: data.learningDetails.preferredMode || null,
        budgetRange: data.learningDetails.budgetRange || null,
        availability: data.availability.availability || null,
        languagesSpoken: data.availability.languagesSpoken,
        phoneNumber: data.availability.phoneNumber || null,
      } as any,
    });

    return { success: true, profile };
  } catch (error) {
    console.error("Error creating student profile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create student profile",
    };
  }
}

