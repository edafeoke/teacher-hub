"use client";

import * as React from "react";
import { ExpertiseAdCard } from "./expertise-ad-card";
import type { ExpertiseAdvertisementWithTeacher } from "@/server-actions/advertisements/expertise";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteExpertiseAd } from "@/server-actions/advertisements/expertise";
import { toast } from "sonner";

interface ExpertiseAdListProps {
  advertisements: ExpertiseAdvertisementWithTeacher[];
}

export function ExpertiseAdList({ advertisements }: ExpertiseAdListProps) {
  const [ads, setAds] = React.useState(advertisements);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) {
      return;
    }

    const result = await deleteExpertiseAd(id);
    if (result.success) {
      setAds(ads.filter((ad) => ad.id !== id));
      toast.success("Advertisement deleted successfully");
    } else {
      toast.error(result.error || "Failed to delete advertisement");
    }
  };

  if (ads.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No advertisements yet</p>
        <Button asChild>
          <Link href="/teacher/advertisements/new">Create your first advertisement</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ads.map((ad) => (
        <div key={ad.id} className="relative">
          <ExpertiseAdCard advertisement={ad} />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <Link href={`/teacher/advertisements/${ad.id}/edit`}>
                <Edit className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDelete(ad.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

