"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { stopImpersonation } from "@/server-actions/admin/user";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, X } from "lucide-react";

interface ImpersonationBannerProps {
  impersonatedUserName: string;
  impersonatedUserEmail: string;
  adminUserName: string;
}

export function ImpersonationBanner({
  impersonatedUserName,
  impersonatedUserEmail,
  adminUserName,
}: ImpersonationBannerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStopImpersonation = async () => {
    try {
      setLoading(true);
      const result = await stopImpersonation();

      if (!result.success) {
        toast.error(result.error || "Failed to stop impersonation");
        return;
      }

      toast.success("Stopped impersonating user");
      router.push("/admin/users");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to stop impersonation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 mb-4">
      <AlertTriangle className="text-yellow-600 dark:text-yellow-500" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 w-full">
        <div className="flex-1">
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            Impersonating User
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            You are currently impersonating <strong>{impersonatedUserName}</strong> ({impersonatedUserEmail}).
            {adminUserName && (
              <> You are logged in as admin <strong>{adminUserName}</strong>.</>
            )}
          </AlertDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStopImpersonation}
          disabled={loading}
          className="shrink-0 border-yellow-600 text-yellow-900 hover:bg-yellow-100 dark:border-yellow-500 dark:text-yellow-100 dark:hover:bg-yellow-900/30"
        >
          <X className="size-4" />
          {loading ? "Stopping..." : "Stop Impersonation"}
        </Button>
      </div>
    </Alert>
  );
}

