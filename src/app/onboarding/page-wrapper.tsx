import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import OnboardingPage from "./page";

export default async function OnboardingPageWrapper() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return (
    <OnboardingPage
      userName={session.user.name}
      userImage={session.user.image}
    />
  );
}

