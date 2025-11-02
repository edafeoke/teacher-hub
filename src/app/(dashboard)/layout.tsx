import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authClient.getSession();
  console.log(session);
  if (!session?.data) {
    redirect("/login");
  }
  return <>{children}</>;
}



