import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

/**
 * Automatically unban users whose ban has expired
 * This should be called before checking user ban status
 */
export async function checkAndLiftExpiredBans() {
  const now = new Date();
  
  // Find all users with expired bans
  const expiredBans = await prisma.user.findMany({
    where: {
      banned: true,
      banExpires: {
        not: null,
        lte: now,
      },
    },
    select: {
      id: true,
    },
  });

  // Unban all users with expired bans
  if (expiredBans.length > 0) {
    await prisma.user.updateMany({
      where: {
        id: {
          in: expiredBans.map((u) => u.id),
        },
      },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
    });
  }
}

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
  // Check and lift expired bans before getting session
  await checkAndLiftExpiredBans();
  
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

/**
 * Check if the current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return false;
  }

  // Check if user is in adminUserIds or has admin role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user) {
    return false;
  }

  // Check if user has admin role
  if (user.role === "admin") {
    return true;
  }

  // Check if user is in adminUserIds (handled by Better Auth)
  // This is a fallback check
  return false;
}

/**
 * Get admin session with user data
 */
export async function getAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    return null;
  }

  return session;
}

/**
 * Check if the current session is impersonating another user
 */
export async function isImpersonating(): Promise<boolean> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return false;
  }

  // Check if session has impersonatedBy field
  const dbSession = await prisma.session.findUnique({
    where: { id: session.session.id },
    select: { impersonatedBy: true },
  });

  return !!dbSession?.impersonatedBy;
}

/**
 * Get impersonation info including admin user who is impersonating
 */
export async function getImpersonationInfo(): Promise<{
  impersonatedUser: { id: string; name: string; email: string };
  adminUser: { id: string; name: string; email: string };
} | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.session) {
    return null;
  }

  // Get session from database to check impersonatedBy
  const dbSession = await prisma.session.findUnique({
    where: { id: session.session.id },
    select: { impersonatedBy: true, userId: true },
  });

  if (!dbSession?.impersonatedBy) {
    return null;
  }

  // Get the impersonated user (current session user)
  const impersonatedUser = await prisma.user.findUnique({
    where: { id: dbSession.userId },
    select: { id: true, name: true, email: true },
  });

  // Get the admin user who is impersonating
  const adminUser = await prisma.user.findUnique({
    where: { id: dbSession.impersonatedBy },
    select: { id: true, name: true, email: true },
  });

  if (!impersonatedUser || !adminUser) {
    return null;
  }

  return {
    impersonatedUser: {
      id: impersonatedUser.id,
      name: impersonatedUser.name,
      email: impersonatedUser.email,
    },
    adminUser: {
      id: adminUser.id,
      name: adminUser.name,
      email: adminUser.email,
    },
  };
}

