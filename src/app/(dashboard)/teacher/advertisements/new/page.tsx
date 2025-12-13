import { getSessionWithProfiles } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { ExpertiseAdForm } from "@/components/advertisements/expertise-ad-form";
import { checkSubscriptionStatus } from "@/server-actions/subscriptions/check-subscription-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NewExpertiseAdPage() {
  const session = await getSessionWithProfiles();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.teacherProfile) {
    redirect("/onboarding");
  }

  // Check subscription status
  const subscriptionCheck = await checkSubscriptionStatus();
  if (!subscriptionCheck.success || !subscriptionCheck.hasActiveSubscription) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Required</CardTitle>
            <CardDescription>
              You need an active subscription to create expertise advertisements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/teacher/subscription">Subscribe Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ExpertiseAdForm />
    </div>
  );
}

