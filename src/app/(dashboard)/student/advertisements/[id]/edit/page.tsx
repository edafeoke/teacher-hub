import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getStudentLearningNeedAds } from "@/server-actions/advertisements/learning-needs";
import { LearningNeedForm } from "@/components/advertisements/learning-need-form";
import { notFound } from "next/navigation";

export default async function EditLearningNeedAdPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding");
  }

  const result = await getStudentLearningNeedAds();
  if (!result.success || !result.advertisements) {
    notFound();
  }

  const advertisement = result.advertisements.find((ad) => ad.id === params.id);
  if (!advertisement) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <LearningNeedForm initialData={advertisement} />
    </div>
  );
}

