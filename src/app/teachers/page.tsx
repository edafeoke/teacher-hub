import { getTeachers } from "@/server-actions/teachers/get-teachers";
import { TeachersClient } from "@/components/teachers/teachers-client";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import { ImpersonationBannerWrapper } from "@/components/impersonation-banner-wrapper";

export default async function TeachersPage() {
  const result = await getTeachers();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="mt-16">
        <ImpersonationBannerWrapper />
      </div>
      {!result.success || !result.teachers ? (
        <div className="container mx-auto px-4 py-8 flex-1">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Teachers</h1>
            <p className="text-muted-foreground">
              {result.error || "Failed to load teachers. Please try again later."}
            </p>
          </div>
        </div>
      ) : (
        <TeachersClient initialTeachers={result.teachers} />
      )}
      <FooterSection />
    </div>
  );
}

