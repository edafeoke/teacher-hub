import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithProfiles();
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding?role=teacher");
  }

  return <>{children}</>;
}

