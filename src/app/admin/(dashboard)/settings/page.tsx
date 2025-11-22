import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function AdminSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="px-4 lg:px-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
          <CardDescription>Configure admin plugin settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Access Control</h3>
            <p className="text-muted-foreground text-sm">
              Access control is configured with custom roles and permissions.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Admin User IDs</h3>
            <p className="text-muted-foreground text-sm">
              Users with these IDs have admin access regardless of role.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Current Admin</h3>
            <p className="text-muted-foreground text-sm">
              {session?.user?.email || "Not logged in"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
