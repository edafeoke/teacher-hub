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
      const result = await revokeSession(session.token);

      if (!result.success) {
        throw new Error(result.error || "Failed to revoke session");
      }

      toast.success("Session revoked successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to revoke session";
      toast.error(errorMessage);
    }
  };

  return <SessionTable data={sessions} onRevoke={handleRevoke} />;
}


