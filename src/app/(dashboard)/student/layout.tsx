import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithProfiles();
  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding?role=student");
  }

  return <>{children}</>;
}

