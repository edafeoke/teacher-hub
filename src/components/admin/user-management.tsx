"use client"

import * as React from "react";
import { UserTable, type AdminUser } from "@/components/admin/user-table";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { BanUserDialog } from "@/components/admin/ban-user-dialog";
import { useRouter } from "next/navigation";
import { getUsers } from "@/server-actions/admin/user";
import { Toaster, toast } from "sonner";

export function UserManagement({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = React.useState(initialUsers);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);
  const [banOpen, setBanOpen] = React.useState(false);
  const router = useRouter();

  // Sync users state when initialUsers changes (after router.refresh)
  React.useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const refreshUsers = async () => {
    // Refetch users data and update state
    const updatedUsers = await getUsers();
    setUsers(updatedUsers);
    // Also refresh the router to ensure server state is updated
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateUserDialog onUserCreated={refreshUsers} />
      </div>
      <UserTable
        data={users}
        onEditUser={(user) => {
          setSelectedUser(user);
          setEditOpen(true);
        }}
        onBanUser={(user) => {
          setSelectedUser(user);
          setBanOpen(true);
        }}
        onImpersonate={(user) => {
          // Open impersonation in a new tab
          const impersonateUrl = `/api/admin/impersonate/${user.id}`;
          const newWindow = window.open(impersonateUrl, "_blank");
          
          if (!newWindow) {
            toast.error("Please allow popups to impersonate users");
            return;
          }

          toast.success(`Opening impersonation for ${user.name} in new tab...`);
          
          // Check if the new window was closed or navigated
          const checkWindow = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(checkWindow);
            } else {
              try {
                // Try to access the window location to check if it's loaded
                if (newWindow.location.href) {
                  clearInterval(checkWindow);
                }
              } catch (e) {
                // Cross-origin error is expected, window is still loading
              }
            }
          }, 100);
        }}
      />
      <EditUserDialog
        user={selectedUser}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUserUpdated={refreshUsers}
      />
      <BanUserDialog
        user={selectedUser}
        open={banOpen}
        onOpenChange={setBanOpen}
        onBanChanged={refreshUsers}
      />
      <Toaster richColors />
    </div>
  );
}


