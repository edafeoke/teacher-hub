"use client"

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface DashboardWrapperProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  hasTeacherProfile: boolean;
  hasStudentProfile: boolean;
  children: ReactNode;
}

export function DashboardWrapper({
  user,
  hasTeacherProfile,
  hasStudentProfile,
  children,
}: DashboardWrapperProps) {
  const pathname = usePathname();
  
  // Determine role from URL pathname
  let role: "teacher" | "student" | null = null;
  if (pathname?.startsWith("/teacher")) {
    role = "teacher";
  } else if (pathname?.startsWith("/student")) {
    role = "student";
  }

  // Default to teacher if both exist, otherwise use available profile
  if (!role) {
    if (hasTeacherProfile) {
      role = "teacher";
    } else if (hasStudentProfile) {
      role = "student";
    }
  }

  if (!role) {
    return null; // Will be handled by redirect in server component
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--header-height": "3.5rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        user={user}
        role={role}
        hasTeacherProfile={hasTeacherProfile}
        hasStudentProfile={hasStudentProfile}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

