import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserX, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/navbar";
import FooterSection from "@/components/footer";
import { ImpersonationBannerWrapper } from "@/components/impersonation-banner-wrapper";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <div className="mt-16">
        <ImpersonationBannerWrapper />
      </div>
      <div className="container mx-auto px-4 py-16 flex-1 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <UserX className="h-16 w-16 text-muted-foreground" />
              <h1 className="text-2xl font-bold">Teacher Not Found</h1>
              <p className="text-muted-foreground">
                The teacher you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/teachers">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Teachers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <FooterSection />
    </div>
  );
}

