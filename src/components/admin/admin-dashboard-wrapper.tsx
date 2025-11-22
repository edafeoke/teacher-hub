"use client"

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";

interface AdminDashboardWrapperProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  children: ReactNode;
  impersonationInfo?: {
    impersonatedUser: { id: string; name: string; email: string };
    adminUser: { id: string; name: string; email: string };
  } | null;
}

export function AdminDashboardWrapper({
  user,
  children,
  impersonationInfo,
}: AdminDashboardWrapperProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AdminSidebar user={user} variant="inset" />
      <SidebarInset>
        <AdminHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {impersonationInfo && (
                <ImpersonationBanner
                  impersonatedUserName={impersonationInfo.impersonatedUser.name}
                  impersonatedUserEmail={impersonationInfo.impersonatedUser.email}
                  adminUserName={impersonationInfo.adminUser.name}
                />
              )}
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


