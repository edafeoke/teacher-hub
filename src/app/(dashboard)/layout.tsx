import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { DashboardWrapper } from "@/components/dashboard/dashboard-wrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithProfiles();
  if (!session?.user) {
    redirect("/login");
  }

  const hasTeacherProfile = !!session.user.teacherProfile;
  const hasStudentProfile = !!session.user.studentProfile;

  // If no profiles, redirect to onboarding
  if (!hasTeacherProfile && !hasStudentProfile) {
    redirect("/onboarding");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return (
    <DashboardWrapper
      user={user}
      hasTeacherProfile={hasTeacherProfile}
      hasStudentProfile={hasStudentProfile}
    >
      {children}
    </DashboardWrapper>
  );
}
