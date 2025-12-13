import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getTeacherExpertiseAds } from "@/server-actions/advertisements/expertise";
import { ExpertiseAdList } from "@/components/advertisements/expertise-ad-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function TeacherAdvertisementsPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding");
  }

  const result = await getTeacherExpertiseAds();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Expertise Advertisements</h1>
          <p className="text-muted-foreground mt-2">
            Manage your expertise advertisements to attract students
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/advertisements/new">
            <Plus className="mr-2 h-4 w-4" />
            Create New Advertisement
          </Link>
        </Button>
      </div>

      {!result.success ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{result.error || "Failed to load advertisements"}</p>
        </div>
      ) : (
        <ExpertiseAdList advertisements={result.advertisements || []} />
      )}
    </div>
  );
}

