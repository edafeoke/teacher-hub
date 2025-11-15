import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import OnboardingPage from "./page-client";
import { redirect } from "next/navigation";

export default async function OnboardingPageWrapper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
console.log("session", session);
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <OnboardingPage
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}

