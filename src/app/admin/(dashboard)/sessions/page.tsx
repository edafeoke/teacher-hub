import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionTable, type AdminSession } from "@/components/admin/session-table";
import { SessionManagement } from "@/components/admin/session-management";

async function getSessions(): Promise<AdminSession[]> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return [];
  }

  const sessions = await prisma.session.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return sessions.map((s) => ({
    id: s.id,
    token: s.token,
    userName: s.user.name,
    userEmail: s.user.email,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    expiresAt: s.expiresAt,
  }));
}

export default async function AdminSessionsPage() {
  const sessions = await getSessions();

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sessions</CardTitle>
          <CardDescription>Manage active user sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <SessionManagement initialSessions={sessions} />
        </CardContent>
      </Card>
    </div>
  );
}
