import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getStudentLearningNeedAds } from "@/server-actions/advertisements/learning-needs";
import { LearningNeedAdList } from "@/components/advertisements/learning-need-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function StudentAdvertisementsPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.studentProfile) {
    redirect("/onboarding");
  }

  const result = await getStudentLearningNeedAds();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Learning Need Advertisements</h1>
          <p className="text-muted-foreground mt-2">
            Manage your learning need advertisements to find the perfect teacher
          </p>
        </div>
        <Button asChild>
          <Link href="/student/advertisements/new">
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
        <LearningNeedAdList advertisements={result.advertisements || []} />
      )}
    </div>
  );
}

