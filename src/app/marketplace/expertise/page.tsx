import { getExpertiseAds } from "@/server-actions/advertisements/expertise";
import { ExpertiseAdList } from "@/components/advertisements/expertise-ad-list";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";

export default async function ExpertiseMarketplacePage() {
  const result = await getExpertiseAds({ isActive: true });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Expertise Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Browse teacher expertise advertisements to find the perfect tutor
          </p>
        </div>

        {!result.success ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{result.error || "Failed to load advertisements"}</p>
          </div>
        ) : (
          <ExpertiseAdList advertisements={result.advertisements || []} />
        )}
      </div>
      <FooterSection />
    </div>
  );
}

