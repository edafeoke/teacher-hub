import { getLearningNeedAds } from "@/server-actions/advertisements/learning-needs";
import { LearningNeedAdList } from "@/components/advertisements/learning-need-list";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

export default async function LearningNeedsMarketplacePage() {
  const result = await getLearningNeedAds({ isActive: true });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Learning Needs Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse student learning need advertisements
          </p>
        </div>

        {!result.success ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{result.error || "Failed to load advertisements"}</p>
          </div>
        ) : (
          <LearningNeedAdList advertisements={result.advertisements || []} />
        )}
      </div>
      <FooterSection />
    </div>
  );
}

