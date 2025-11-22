import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import Features from "@/components/features-1";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";
import { ImpersonationBannerWrapper } from "@/components/impersonation-banner-wrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log("session", session);
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      
      <div className="mt-16">
        <ImpersonationBannerWrapper />
      </div>
      <HeroSection />
      <StatsSection />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CallToAction />
      <FooterSection />
    </div>
  );
}
