"use client";

import * as React from "react";
import { Download, File, FileText, Image, Video, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface FileMessageProps {
  attachments: FileAttachment[];
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  if (fileType.startsWith("audio/")) return Music;
  if (fileType === "application/pdf" || fileType.startsWith("application/vnd") || fileType.startsWith("text/")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileMessage({ attachments }: FileMessageProps) {
  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.fileType);
        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-2 bg-background/20 rounded-lg"
          >
            <Icon className="h-8 w-8 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{attachment.fileName}</p>
              <p className="text-xs opacity-80">{formatFileSize(attachment.fileSize)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
              className="flex-shrink-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

