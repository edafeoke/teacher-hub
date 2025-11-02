import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await authClient.getSession();
  // TODO: Add admin role check here
  if (session?.data) {
    redirect("/admin");
  }
  return <>{children}</>;
}

