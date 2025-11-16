import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export interface SessionWithProfiles {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    teacherProfile?: {
      id: string;
      userId: string;
      gender?: string | null;
      dateOfBirth?: Date | null;
      bio?: string | null;
      city?: string | null;
      country?: string | null;
      subjectsTaught: string[];
      levels: string[];
      yearsOfExperience?: number | null;
      qualifications?: string | null;
      teachingStyle?: string | null;
      hourlyRate?: number | null;
      demoClassAvailable: boolean;
      availability?: any;
      languagesSpoken: string[];
      phoneNumber?: string | null;
      verificationStatus?: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    studentProfile?: {
      id: string;
      userId: string;
      gender?: string | null;
      dateOfBirth?: Date | null;
      city?: string | null;
      country?: string | null;
      subjectsOfInterest: string[];
      learningLevel?: string | null;
      learningGoals?: string | null;
      preferredMode?: string | null;
      budgetRange?: string | null;
      availability?: any;
      languagesSpoken: string[];
      phoneNumber?: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  };
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    userId: string;
  };
}

/**
 * Get session with teacher and student profiles included in the user object
 */
export async function getSessionWithProfiles(): Promise<SessionWithProfiles | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Fetch user with profiles
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teacherProfile: true,
      studentProfile: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...session,
    user: {
      ...session.user,
      teacherProfile: user.teacherProfile,
      studentProfile: user.studentProfile,
    },
  } as SessionWithProfiles;
}

