"use client"

import * as React from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  User,
  Settings,
  MessageSquare,
  Bell,
  GraduationCap,
  Megaphone,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import { ProfileSwitcher } from "@/components/dashboard/profile-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  hasTeacherProfile: boolean;
  hasStudentProfile: boolean;
}

export function AppSidebar({
  user,
  hasTeacherProfile,
  hasStudentProfile,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname();
  
  // Determine current role from pathname
  let role: "teacher" | "student" = "teacher";
  if (pathname?.startsWith("/student")) {
    role = "student";
  } else if (pathname?.startsWith("/teacher")) {
    role = "teacher";
  } else {
    // Default to teacher if both exist, otherwise use available profile
    if (hasTeacherProfile) {
      role = "teacher";
    } else if (hasStudentProfile) {
      role = "student";
    }
  }

  const teacherNavItems = [
    {
      title: "Dashboard",
      url: "/teacher",
      icon: LayoutDashboard,
    },
    {
      title: "Students",
      url: "/teacher/students",
      icon: Users,
    },
    {
      title: "Sessions",
      url: "/teacher/sessions",
      icon: Calendar,
    },
    {
      title: "Advertisements",
      url: "/teacher/advertisements",
      icon: Megaphone,
    },
    {
      title: "Contracts",
      url: "/teacher/contracts",
      icon: FileText,
    },
    {
      title: "Profile",
      url: "/teacher/profile",
      icon: User,
    },
  ];

  const studentNavItems = [
    {
      title: "Dashboard",
      url: "/student",
      icon: LayoutDashboard,
    },
    {
      title: "Teachers",
      url: "/student/teachers",
      icon: GraduationCap,
    },
    {
      title: "Schedule",
      url: "/student/schedule",
      icon: Calendar,
    },
    {
      title: "Advertisements",
      url: "/student/advertisements",
      icon: Megaphone,
    },
    {
      title: "Contracts",
      url: "/student/contracts",
      icon: FileText,
    },
    {
      title: "Profile",
      url: "/student/profile",
      icon: User,
    },
  ];

  const sharedNavItems = [
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      url: role === "teacher" ? "/teacher/settings" : "/student/settings",
      icon: Settings,
    },
  ];

  const navItems = role === "teacher" ? teacherNavItems : studentNavItems;

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={role === "teacher" ? "/teacher" : "/student"}>
                <Logo className="!h-6" uniColor />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Profile Switcher */}
        <div className="px-2 pb-2">
          <ProfileSwitcher
            hasTeacherProfile={hasTeacherProfile}
            hasStudentProfile={hasStudentProfile}
            currentRole={role}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        <NavMain items={sharedNavItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} role={role} />
      </SidebarFooter>
    </Sidebar>
  );
}
