"use client"

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { banUser, unbanUser } from "@/server-actions/admin/user";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminUser } from "@/components/admin/user-table";

const banUserSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  duration: z.string().optional(),
});

interface BanUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBanChanged: () => void | Promise<void>;
}

export function BanUserDialog({ user, open, onOpenChange, onBanChanged }: BanUserDialogProps) {
  const [loading, setLoading] = React.useState(false);

  const form = useForm<z.infer<typeof banUserSchema>>({
    resolver: zodResolver(banUserSchema),
    defaultValues: {
      reason: "",
      duration: "",
    },
  });

  async function handleBan() {
    if (!user) return;
    const values = form.getValues();
    try {
      setLoading(true);
      const result = await banUser({
        userId: user.id,
        reason: values.reason,
        banExpiresIn: values.duration ? Number(values.duration) * 24 * 60 * 60 : undefined,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to ban user");
      }

      toast.success("User banned successfully");
      onOpenChange(false);
      onBanChanged();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to ban user");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnban() {
    if (!user) return;
    try {
      setLoading(true);
      const result = await unbanUser(user.id);

      if (!result.success) {
        throw new Error(result.error || "Failed to unban user");
      }

      toast.success("User unbanned successfully");
      onOpenChange(false);
      onBanChanged();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to unban user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user?.banned ? "Unban user" : "Ban user"}</DialogTitle>
          <DialogDescription>
            {user?.banned
              ? "Remove restrictions from this account"
              : "Restrict this user from accessing the platform"}
          </DialogDescription>
        </DialogHeader>
        {!user?.banned && (
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" {...form.register("reason")} />
              {form.formState.errors.reason && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (days)</Label>
              <Input id="duration" type="number" min={0} {...form.register("duration")} />
            </div>
          </form>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {user?.banned ? (
            <Button onClick={handleUnban} disabled={loading}>
              {loading ? "Processing..." : "Unban"}
            </Button>
          ) : (
            <Button onClick={handleBan} disabled={loading}>
              {loading ? "Processing..." : "Ban user"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
