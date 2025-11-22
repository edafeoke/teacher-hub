"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { impersonateUser } from "@/server-actions/admin/user";
import type { AdminUser } from "@/components/admin/user-table";

interface ImpersonateButtonProps {
  user: AdminUser;
}

export function ImpersonateButton({ user }: ImpersonateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImpersonate = async () => {
    try {
      setLoading(true);
      const result = await impersonateUser(user.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to impersonate user");
      }

      toast.success(`Now impersonating ${user.name}`);
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to impersonate user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleImpersonate} disabled={loading}>
      {loading ? "Impersonating..." : "Impersonate"}
    </Button>
  );
}
