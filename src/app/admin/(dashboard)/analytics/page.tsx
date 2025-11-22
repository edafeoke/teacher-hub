import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

async function getAnalytics() {
  const totalUsers = await prisma.user.count();
  const totalTeachers = await prisma.user.count({
    where: {
      teacherProfile: {
        isNot: null,
      },
    },
  });
  const totalStudents = await prisma.user.count({
    where: {
      studentProfile: {
        isNot: null,
      },
    },
  });
  const bannedUsers = await prisma.user.count({
    where: {
      banned: true,
    },
  });
  const activeSessions = await prisma.session.count({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  return {
    totalUsers,
    totalTeachers,
    totalStudents,
    bannedUsers,
    activeSessions,
  };
}

export default async function AdminAnalyticsPage() {
  const stats = await getAnalytics();

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>Platform statistics and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-muted-foreground text-sm">Total Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <div className="text-muted-foreground text-sm">Teachers</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <div className="text-muted-foreground text-sm">Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.bannedUsers}</div>
              <div className="text-muted-foreground text-sm">Banned Users</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <div className="text-muted-foreground text-sm">Active Sessions</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
