import { getImpersonationInfo } from "@/lib/auth-helpers";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

export async function ImpersonationBannerWrapper() {
  const impersonationInfo = await getImpersonationInfo();

  if (!impersonationInfo) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 pt-4">
      <ImpersonationBanner
        impersonatedUserName={impersonationInfo.impersonatedUser.name}
        impersonatedUserEmail={impersonationInfo.impersonatedUser.email}
        adminUserName={impersonationInfo.adminUser.name}
      />
    </div>
  );
}

