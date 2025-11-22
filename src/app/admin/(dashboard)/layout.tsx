import { getAdminSession, getImpersonationInfo } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { AdminDashboardWrapper } from "@/components/admin/admin-dashboard-wrapper";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  
  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  const impersonationInfo = await getImpersonationInfo();

  return (
    <AdminDashboardWrapper user={user} impersonationInfo={impersonationInfo}>
      {children}
    </AdminDashboardWrapper>
  );
}


