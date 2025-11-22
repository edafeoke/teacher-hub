"use server";

import { AdminUser } from "@/components/admin/user-table";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { checkAndLiftExpiredBans } from "@/lib/auth-helpers";

export async function getUsers(): Promise<AdminUser[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  // Check and lift expired bans before fetching users
  await checkAndLiftExpiredBans();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    banned: user.banned && (!user.banExpires || user.banExpires > new Date()),
    createdAt: user.createdAt,
  }));
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Create user without role (role is not allowed in createUser body)
    const result = await auth.api.createUser({
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      headers: await headers(),
    });

    // Set role separately if provided
    if (data.role && result && "user" in result && result.user?.id) {
      const role = (data.role as "user" | "admin") || "user";
      if (role !== "user") {
        // Only set role if it's not the default "user"
        await auth.api.setRole({
          body: {
            userId: result.user.id,
            role: role,
          },
          headers: await headers(),
        });
      }
    }

    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create user" };
  }
}

export async function updateUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Update user fields using admin API method
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;

    let result;
    if (Object.keys(updateData).length > 0) {
      // Use adminUpdateUser for admins to update other users
      // adminUpdateUser expects { userId, data: { ...fields } }
      result = await auth.api.adminUpdateUser({
        body: {
          userId,
          data: updateData,
        },
        headers: await headers(),
      });
    }

    // Set role separately if provided
    if (data.role !== undefined) {
      const role = (data.role as "user" | "admin") || "user";
      await auth.api.setRole({
        body: {
          userId,
          role: role,
        },
        headers: await headers(),
      });
    }

    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update user" };
  }
}

export async function banUser(data: {
  userId: string;
  reason: string;
  banExpiresIn?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await auth.api.banUser({
      body: {
        userId: data.userId,
        banReason: data.reason,
        banExpiresIn: data.banExpiresIn,
      },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to ban user" };
  }
}

export async function unbanUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const result = await auth.api.unbanUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to unban user" };
  }
}

export async function setUserRole(userId: string, role: string | string[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    const roleValue = typeof role === "string" 
      ? (role as "user" | "admin")
      : (role as ("user" | "admin")[]);

    const result = await auth.api.setRole({
      body: {
        userId,
        role: roleValue,
      },
      headers: await headers(),
    });

    revalidatePath("/admin/users");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to set user role" };
  }
}

export async function impersonateUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Better Auth admin plugin uses impersonateUser method
    const result = await auth.api.impersonateUser({
      body: {
        userId,
      },
      headers: await headers(),
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to impersonate user" };
  }
}

export async function stopImpersonation() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  try {
    // Better Auth admin plugin uses stopImpersonating method
    const result = await auth.api.stopImpersonating({
      headers: await headers(),
    });

    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to stop impersonation" };
  }
}
