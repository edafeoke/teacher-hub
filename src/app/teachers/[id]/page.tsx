import { getTeacherById } from "@/server-actions/teachers/get-teachers";
import { notFound } from "next/navigation";
import { TeacherProfileView } from "@/components/teachers/teacher-profile-view";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import { ImpersonationBannerWrapper } from "@/components/impersonation-banner-wrapper";
import { getSessionWithProfiles } from "@/lib/auth-helpers";

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getTeacherById(id);

  if (!result.success || !result.teacher) {
    notFound();
  }

  // Get current user session to check if logged in
  const session = await getSessionWithProfiles();
  const currentUserId = session?.user?.id || null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="mt-16">
        <ImpersonationBannerWrapper />
      </div>
      <TeacherProfileView teacher={result.teacher} currentUserId={currentUserId} />
      <FooterSection />
    </div>
  );
}

