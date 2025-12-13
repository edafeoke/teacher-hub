"use client";

import * as React from "react";
import { Download, File, FileText, Image, Video, Music, FileSpreadsheet, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface FileAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string | null;
}

interface FileMessageProps {
  attachments: FileAttachment[];
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith("image/")) return Image;
  if (fileType.startsWith("video/")) return Video;
  if (fileType.startsWith("audio/")) return Music;
  if (fileType === "application/pdf") return FileText;
  if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
  if (fileType.includes("presentation") || fileType.includes("powerpoint")) return Presentation;
  if (fileType.startsWith("application/vnd") || fileType.startsWith("text/")) return FileText;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

export function FileMessage({ attachments }: FileMessageProps) {
  const handleDownload = (fileUrl: string, fileName: string) => {
    // Open in new tab for better download handling
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (fileUrl: string, fileType: string) => {
    // Open previewable files in new tab
    if (
      fileType === "application/pdf" ||
      fileType.startsWith("image/") ||
      fileType.startsWith("text/")
    ) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  const canPreview = (fileType: string): boolean => {
    return (
      fileType === "application/pdf" ||
      fileType.startsWith("image/") ||
      fileType.startsWith("text/")
    );
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => {
        const Icon = getFileIcon(attachment.fileType);
        const extension = getFileExtension(attachment.fileName);
        const previewable = canPreview(attachment.fileType);

        return (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-3 bg-background/20 rounded-lg hover:bg-background/30 transition-colors"
          >
            <div className="flex-shrink-0">
              {attachment.thumbnailUrl && attachment.fileType.startsWith("image/") ? (
                <img
                  src={attachment.thumbnailUrl}
                  alt={attachment.fileName}
                  className="h-12 w-12 object-cover rounded"
                />
              ) : (
                <div className="relative">
                  <Icon className="h-10 w-10 text-muted-foreground" />
                  {extension && (
                    <span className="absolute -bottom-1 -right-1 text-[8px] font-semibold text-muted-foreground bg-background px-1 rounded">
                      {extension}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" title={attachment.fileName}>
                {attachment.fileName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.fileSize)}
                {extension && ` • ${extension}`}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {previewable && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePreview(attachment.fileUrl, attachment.fileType)}
                  className="h-8 w-8"
                  title="Preview"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(attachment.fileUrl, attachment.fileName)}
                className="h-8 w-8"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

