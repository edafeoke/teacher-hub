import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats-section";
import Features from "@/components/features-1";
import HowItWorks from "@/components/how-it-works";
import Testimonials from "@/components/testimonials";
import CallToAction from "@/components/call-to-action";
import FooterSection from "@/components/footer";

export default async function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
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
