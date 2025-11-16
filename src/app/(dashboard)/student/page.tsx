import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SessionCard } from "@/components/dashboard/session-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Calendar,
  CheckCircle,
  TrendingUp,
  Search,
  BookOpen,
  Clock,
} from "lucide-react";
import { addDays } from "date-fns";

// Placeholder data - to be replaced when session/booking models are added
const getUpcomingSessions = () => {
  const now = new Date();
  return [
    {
      id: "1",
      teacherName: "Dr. James Wilson",
      teacherImage: null,
      date: addDays(now, 1),
      time: "10:00 AM",
      subject: "Mathematics",
      status: "upcoming" as const,
    },
    {
      id: "2",
      teacherName: "Prof. Maria Garcia",
      teacherImage: null,
      date: addDays(now, 2),
      time: "2:00 PM",
      subject: "Physics",
      status: "upcoming" as const,
    },
    {
      id: "3",
      teacherName: "Dr. Robert Lee",
      teacherImage: null,
      date: addDays(now, 4),
      time: "11:00 AM",
      subject: "Chemistry",
      status: "upcoming" as const,
    },
  ];
};

const getRecommendedTeachers = () => {
  return [
    {
      id: "1",
      name: "Dr. James Wilson",
      image: null,
      subjects: ["Mathematics", "Calculus"],
      rating: 4.9,
      hourlyRate: 50,
      experience: "10+ years",
    },
    {
      id: "2",
      name: "Prof. Maria Garcia",
      image: null,
      subjects: ["Physics", "Mechanics"],
      rating: 4.8,
      hourlyRate: 45,
      experience: "8+ years",
    },
    {
      id: "3",
      name: "Dr. Robert Lee",
      image: null,
      subjects: ["Chemistry", "Organic Chemistry"],
      rating: 4.7,
      hourlyRate: 55,
      experience: "12+ years",
    },
  ];
};

export default async function StudentDashboard() {
  const session = await getSessionWithProfiles();
  
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding");
  }

  // Placeholder stats - to be replaced with actual data from database
  const stats = {
    activeTeachers: 3,
    upcomingSessions: 5,
    sessionsCompleted: 42,
    learningProgress: "75%",
  };

  const upcomingSessions = getUpcomingSessions();
  const recommendedTeachers = getRecommendedTeachers();

  const quickActions = [
    {
      label: "Find Teachers",
      href: "/student/teachers",
      icon: Search,
      variant: "default" as const,
    },
    {
      label: "Book Session",
      href: "/student/schedule",
      icon: BookOpen,
      variant: "outline" as const,
    },
    {
      label: "View Schedule",
      href: "/student/schedule",
      icon: Calendar,
      variant: "outline" as const,
    },
  ];

  return (
    <div className="px-4 lg:px-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {session.user.name}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          icon={GraduationCap}
          value={stats.activeTeachers}
          label="Active Teachers"
          description="Teachers you're learning with"
        />
        <StatsCard
          icon={Calendar}
          value={stats.upcomingSessions}
          label="Upcoming Sessions"
          description="Sessions scheduled this week"
        />
        <StatsCard
          icon={CheckCircle}
          value={stats.sessionsCompleted}
          label="Sessions Completed"
          description="Total completed sessions"
        />
        <StatsCard
          icon={TrendingUp}
          value={stats.learningProgress}
          label="Learning Progress"
          description="Your overall progress"
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
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <SessionCard
                      key={session.id}
                      name={session.teacherName}
                      image={session.teacherImage}
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

        {/* Quick Actions & Recommended Teachers */}
        <div className="space-y-6">
          <QuickActions actions={quickActions} />

          {/* Recommended Teachers */}
          <Card>
            <CardHeader>
              <CardTitle>Recommended Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedTeachers.length > 0 ? (
                  recommendedTeachers.map((teacher) => {
                    const initials = teacher.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);
                    return (
                      <div
                        key={teacher.id}
                        className="pb-4 border-b last:border-0 last:pb-0 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="size-10">
                            <AvatarImage
                              src={teacher.image || undefined}
                              alt={teacher.name}
                            />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="font-medium truncate">
                                {teacher.name}
                              </p>
                              <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="size-3 text-yellow-500" />
                                <span className="font-medium">
                                  {teacher.rating}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {teacher.subjects.slice(0, 2).map((subject) => (
                                <Badge
                                  key={subject}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {subject}
                                </Badge>
                              ))}
                            </div>
                            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                              <span>{teacher.experience}</span>
                              <span className="font-medium">
                                ${teacher.hourlyRate}/hr
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No recommendations available
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
