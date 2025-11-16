"use client"

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, User, Plus, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileSwitcherProps {
  hasTeacherProfile: boolean;
  hasStudentProfile: boolean;
  currentRole: "teacher" | "student";
}

export function ProfileSwitcher({
  hasTeacherProfile,
  hasStudentProfile,
  currentRole,
}: ProfileSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSwitch = (role: "teacher" | "student") => {
    if (role === "teacher" && hasTeacherProfile) {
      router.push("/teacher");
    } else if (role === "student" && hasStudentProfile) {
      router.push("/student");
    }
  };

  const handleCreateProfile = (role: "teacher" | "student") => {
    router.push(`/onboarding?role=${role}`);
  };

  const currentIcon = currentRole === "teacher" ? GraduationCap : User;
  const CurrentIcon = currentIcon;
  const currentLabel = currentRole === "teacher" ? "Teacher" : "Student";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          size="sm"
        >
          <div className="flex items-center gap-2">
            <CurrentIcon className="size-4" />
            <span className="font-medium">{currentLabel}</span>
            <Badge variant="secondary" className="text-xs">
              Active
            </Badge>
          </div>
          <ChevronDown className="size-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Profile</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {currentRole === "teacher" && hasStudentProfile && (
          <DropdownMenuItem onClick={() => handleSwitch("student")}>
            <User className="mr-2 size-4" />
            <span>Switch to Student</span>
          </DropdownMenuItem>
        )}
        
        {currentRole === "student" && hasTeacherProfile && (
          <DropdownMenuItem onClick={() => handleSwitch("teacher")}>
            <GraduationCap className="mr-2 size-4" />
            <span>Switch to Teacher</span>
          </DropdownMenuItem>
        )}

        {!hasTeacherProfile && (
          <DropdownMenuItem onClick={() => handleCreateProfile("teacher")}>
            <Plus className="mr-2 size-4" />
            <span>Create Teacher Profile</span>
          </DropdownMenuItem>
        )}

        {!hasStudentProfile && (
          <DropdownMenuItem onClick={() => handleCreateProfile("student")}>
            <Plus className="mr-2 size-4" />
            <span>Create Student Profile</span>
          </DropdownMenuItem>
        )}

        {hasTeacherProfile && hasStudentProfile && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs text-muted-foreground">
              You have access to both profiles
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

