"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Attachment {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  duration?: number;
}

interface AttachmentPreviewProps {
  attachments: Attachment[];
  onRemove: (index: number) => void;
}

export function AttachmentPreview({
  attachments,
  onRemove,
}: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t bg-muted/30">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className="relative group flex items-center gap-2 p-2 bg-background rounded-lg border"
        >
          {attachment.fileType.startsWith("image/") && attachment.thumbnailUrl ? (
            <img
              src={attachment.thumbnailUrl}
              alt={attachment.fileName}
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
              <span className="text-xs">📎</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{attachment.fileName}</p>
            <p className="text-xs text-muted-foreground">
              {(attachment.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(index)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

