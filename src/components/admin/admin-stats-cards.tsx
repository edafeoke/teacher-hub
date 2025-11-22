"use client"

import { Users, Shield, UserX, Activity } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

interface AdminStatsCardsProps {
  totalUsers: number;
  activeSessions: number;
  bannedUsers: number;
  totalAdmins: number;
}

export function AdminStatsCards({
  totalUsers,
  activeSessions,
  bannedUsers,
  totalAdmins,
}: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <StatsCard
        icon={Users}
        value={totalUsers}
        label="Total Users"
        description="Registered users"
      />
      <StatsCard
        icon={Shield}
        value={activeSessions}
        label="Active Sessions"
        description="Currently logged in"
      />
      <StatsCard
        icon={UserX}
        value={bannedUsers}
        label="Banned Users"
        description="Suspended accounts"
      />
      <StatsCard
        icon={Activity}
        value={totalAdmins}
        label="Administrators"
        description="Admin users"
      />
    </div>
  );
}


