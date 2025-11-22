import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { AdminStatsCards } from "@/components/admin/admin-stats-cards";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserGrowthChart } from "@/components/admin/user-growth-chart";
import { checkAndLiftExpiredBans } from "@/lib/auth-helpers";

async function getAdminStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  // Check and lift expired bans before calculating stats
  await checkAndLiftExpiredBans();

  // Get total users count
  const totalUsers = await prisma.user.count();

  // Get active sessions count
  const activeSessions = await prisma.session.count({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  // Get banned users count - using raw query as fallback
  // Note: Run `pnpm prisma generate` if you see type errors
  const allUsers = await prisma.user.findMany();
  const bannedUsers = allUsers.filter((u: any) => u.banned === true).length;
  const totalAdmins = allUsers.filter((u: any) => u.role === "admin").length;

  // Get user growth data for chart (last 90 days to support all time ranges)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: ninetyDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Group users by day
  const userGrowthByDay = new Map<string, number>();
  
  // Initialize all days in the last 90 days with 0
  for (let i = 0; i < 90; i++) {
    const date = new Date(ninetyDaysAgo);
    date.setDate(date.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];
    userGrowthByDay.set(dateKey, 0);
  }

  // Count users per day
  users.forEach((user) => {
    const dateKey = user.createdAt.toISOString().split("T")[0];
    const currentCount = userGrowthByDay.get(dateKey) || 0;
    userGrowthByDay.set(dateKey, currentCount + 1);
  });

  // Convert to array format for chart
  const userGrowth = Array.from(userGrowthByDay.entries())
    .map(([date, count]) => ({
      date,
      users: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalUsers,
    activeSessions,
    bannedUsers,
    totalAdmins,
    userGrowth,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  if (!stats) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need to be an admin to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <AdminStatsCards
        totalUsers={stats.totalUsers}
        activeSessions={stats.activeSessions}
        bannedUsers={stats.bannedUsers}
        totalAdmins={stats.totalAdmins}
      />
      <div className="px-4 lg:px-6">
        <Card>
          <UserGrowthChart data={stats.userGrowth} />
        </Card>
      </div>
    </>
  );
}

