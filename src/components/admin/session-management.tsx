"use client"

import * as React from "react";
import { SessionTable, type AdminSession } from "@/components/admin/session-table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { revokeSession } from "@/server-actions/admin/session";

export function SessionManagement({ initialSessions }: { initialSessions: AdminSession[] }) {
  const [sessions, setSessions] = React.useState(initialSessions);
  const router = useRouter();

  const handleRevoke = async (session: AdminSession) => {
    try {
      const result = await revokeSession(session.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to revoke session");
      }

      toast.success("Session revoked successfully");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to revoke session");
    }
  };

  return <SessionTable data={sessions} onRevoke={handleRevoke} />;
}


