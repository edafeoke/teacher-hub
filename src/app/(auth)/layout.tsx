import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkAndLiftExpiredBans } from "@/lib/auth-helpers";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check and lift expired bans before checking session
  await checkAndLiftExpiredBans();
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (session?.user) {
    redirect("/");
  }
  return <>{children}</>;
}

