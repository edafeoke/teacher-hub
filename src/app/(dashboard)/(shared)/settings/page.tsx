"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageEditor } from "@/components/ui/profile-image-editor";
import { updateUserImage } from "@/server-actions/user/update-image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = React.useState<{
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        } else {
          toast.error("Failed to load user data");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleImageUpdate = async (imageUrl: string) => {
    try {
      const result = await updateUserImage(imageUrl);
      if (result.success) {
        // Update local state
        setUser((prev) => (prev ? { ...prev, image: imageUrl } : null));
        // Refresh the page to update all components using the image
        window.location.reload();
      } else {
        throw new Error(result.error || "Failed to update image");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      throw error; // Re-throw to let ProfileImageEditor handle the error
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Failed to load user data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>
              Upload and edit your profile picture. You can crop, rotate, flip, and apply filters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageEditor
              currentImageUrl={user.image}
              onImageUpdate={handleImageUpdate}
            />
          </CardContent>
        </Card>

        {/* Account Information Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Your account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg font-medium mt-1">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-lg font-medium mt-1">{user.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
