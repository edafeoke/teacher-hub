"use client";

import * as React from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VideoMessageProps {
  fileUrl: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
}

export function VideoMessage({
  fileUrl,
  thumbnailUrl,
  duration,
}: VideoMessageProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showThumbnail, setShowThumbnail] = React.useState(true);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <div
        className="relative aspect-video rounded-lg overflow-hidden bg-black cursor-pointer group"
        onClick={() => setIsOpen(true)}
      >
        {showThumbnail && thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt="Video thumbnail"
            className="w-full h-full object-cover"
            onError={() => setShowThumbnail(false)}
          />
        ) : (
          <video
            src={fileUrl}
            className="w-full h-full object-cover"
            preload="metadata"
            onLoadedMetadata={(e) => {
              const video = e.currentTarget;
              video.currentTime = 1; // Seek to 1 second for thumbnail
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="h-6 w-6 text-black fill-black" />
          </div>
        </div>
        {duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Video</DialogTitle>
          </DialogHeader>
          <video
            src={fileUrl}
            controls
            autoPlay
            className="w-full rounded-lg"
          >
            Your browser does not support the video tag.
          </video>
        </DialogContent>
      </Dialog>
    </>
  );
}

