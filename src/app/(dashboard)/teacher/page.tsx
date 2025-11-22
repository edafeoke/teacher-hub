import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SessionCard } from "@/components/dashboard/session-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Calendar,
  DollarSign,
  Star,
  BookOpen,
  Plus,
  User,
} from "lucide-react";
import { addDays } from "date-fns";
import prisma from "@/lib/prisma";

// Placeholder data - to be replaced when session/booking models are added
const getUpcomingSessions = () => {
  const now = new Date();
  return [
    {
      id: "1",
      studentName: "Sarah Johnson",
      studentImage: null,
      date: addDays(now, 1),
      time: "10:00 AM",
      subject: "Mathematics",
      status: "upcoming" as const,
    },
    {
      id: "2",
      studentName: "Michael Chen",
      studentImage: null,
      date: addDays(now, 2),
      time: "2:00 PM",
      subject: "Physics",
      status: "upcoming" as const,
    },
    {
      id: "3",
      studentName: "Emily Davis",
      studentImage: null,
      date: addDays(now, 3),
      time: "11:00 AM",
      subject: "Chemistry",
      status: "upcoming" as const,
    },
  ];
};

const getRecentStudents = () => {
  return [
    {
      id: "1",
      name: "Sarah Johnson",
      image: null,
      subject: "Mathematics",
      joinedDate: addDays(new Date(), -5),
    },
    {
      id: "2",
      name: "Michael Chen",
      image: null,
      subject: "Physics",
      joinedDate: addDays(new Date(), -3),
    },
    {
      id: "3",
      name: "Emily Davis",
      image: null,
      subject: "Chemistry",
      joinedDate: addDays(new Date(), -1),
    },
  ];
};

export default async function TeacherDashboard() {
  const session = await getSessionWithProfiles();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding");
  }

  const teacherId = session.user.teacherProfile.id;
  const userId = session.user.id;

  // Calculate actual stats from database
  // Note: These will be 0 until booking/session/review models are added
  // For now, we can count total students with student profiles as a placeholder
  const totalStudentsWithProfiles = await prisma.studentProfile.count();
  
  // Since there are no booking/session models yet, these will be 0
  const totalStudents = 0; // Will be calculated from bookings when model exists
  const upcomingSessionsCount = 0; // Will be calculated from bookings when model exists
  const earnings = "$0"; // Will be calculated from payments when model exists
  const averageRating = 0; // Will be calculated from reviews when model exists

  const stats = {
    totalStudents,
    upcomingSessions: upcomingSessionsCount,
    earnings,
    averageRating: averageRating > 0 ? averageRating.toFixed(1) : "N/A",
  };

  const upcomingSessionsList = getUpcomingSessions();
  const recentStudents = getRecentStudents();

  const quickActions = [
    {
      label: "View All Students",
      href: "/teacher/students",
      icon: Users,
      variant: "outline" as const,
    },
    {
      label: "Schedule Session",
      href: "/teacher/sessions",
      icon: Plus,
      variant: "default" as const,
    },
    {
      label: "View Profile",
      href: "/teacher/profile",
      icon: User,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-8">
    <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={Users}
          value={stats.totalStudents}
          label="Total Students"
          description="Active students in your classes"
        />
        <StatsCard
          icon={Calendar}
          value={stats.upcomingSessions}
          label="Upcoming Sessions"
          description="Sessions scheduled this week"
        />
        <StatsCard
          icon={DollarSign}
          value={stats.earnings}
          label="Total Earnings"
          description="Earnings this month"
        />
        <StatsCard
          icon={Star}
          value={stats.averageRating}
          label="Average Rating"
          description="Based on student reviews"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSessionsList.length > 0 ? (
                  upcomingSessionsList.map((session) => (
                    <SessionCard
                      key={session.id}
                      name={session.studentName}
                      image={session.studentImage}
                      date={session.date}
                      time={session.time}
                      status={session.status}
                      subject={session.subject}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No upcoming sessions
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Students */}
        <div className="space-y-6">
          <QuickActions actions={quickActions} />

          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.length > 0 ? (
                  recentStudents.map((student) => {
                    const initials = student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={student.id}
                        className="flex items-center gap-3 pb-4 border-b last:border-0 last:pb-0"
                      >
                        <Avatar className="size-10">
                          <AvatarImage
                            src={student.image || undefined}
                            alt={student.name}
                          />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                          <p className="text-muted-foreground text-sm truncate">
                            {student.subject}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recent students
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
