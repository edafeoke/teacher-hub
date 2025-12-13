import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getTeacherExpertiseAds } from "@/server-actions/advertisements/expertise";
import { ExpertiseAdForm } from "@/components/advertisements/expertise-ad-form";
import { notFound } from "next/navigation";

export default async function EditExpertiseAdPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding");
  }

  const result = await getTeacherExpertiseAds();
  if (!result.success || !result.advertisements) {
    notFound();
  }

  const advertisement = result.advertisements.find((ad) => ad.id === params.id);
  if (!advertisement) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ExpertiseAdForm initialData={advertisement} />
    </div>
  );
}

