// import { auth } from "@/lib/auth";
// import { headers } from "next/headers";
// import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserManagement } from "@/components/admin/user-management";
import { getUsers } from "@/server-actions/admin/user";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage users, roles, and access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <UserManagement initialUsers={users} />
        </CardContent>
      </Card>
    </div>
  );
}
