import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { LearningNeedForm } from "@/components/advertisements/learning-need-form";

export default async function NewLearningNeedAdPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LearningNeedForm />
    </div>
  );
}

