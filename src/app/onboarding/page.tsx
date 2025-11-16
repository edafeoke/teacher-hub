import { getSessionWithProfiles } from "@/lib/auth-helpers";
import OnboardingPage from "./page-client";
import { redirect } from "next/navigation";

interface OnboardingPageProps {
  searchParams: Promise<{ role?: string }>;
}

export default async function OnboardingPageWrapper({
  searchParams,
}: OnboardingPageProps) {
  const session = await getSessionWithProfiles();
  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const roleParam = params.role as "teacher" | "student" | undefined;

  return (
    <OnboardingPage
      userName={session.user.name}
      userImage={session.user.image}
      hasTeacherProfile={!!session.user.teacherProfile}
      hasStudentProfile={!!session.user.studentProfile}
      defaultRole={roleParam}
    />
  );
}
