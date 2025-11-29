"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageMessageProps {
  fileUrl: string;
  thumbnailUrl?: string | null;
}

export function ImageMessage({ fileUrl, thumbnailUrl }: ImageMessageProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <>
      <div
        className="max-w-sm rounded-lg overflow-hidden cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <img
          src={thumbnailUrl || fileUrl}
          alt="Message image"
          className="w-full h-auto object-cover"
          onError={() => setImageError(true)}
        />
        {imageError && (
          <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Failed to load image
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center">
            <img
              src={fileUrl}
              alt="Full size image"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

