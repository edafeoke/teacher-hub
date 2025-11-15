"use client";

import * as React from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  defaultImage?: string;
  className?: string;
}

export function AvatarUpload({
  value,
  onChange,
  defaultImage,
  className,
}: AvatarUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, create a data URL. In production, upload to a storage service
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = value || defaultImage;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Avatar className="h-24 w-24">
        <AvatarImage src={displayImage} alt="Profile" />
        <AvatarFallback>Profile</AvatarFallback>
      </Avatar>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Photo
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <p className="text-muted-foreground text-xs text-center">
        You can upload a photo now or add it later
      </p>
    </div>
  );
}

