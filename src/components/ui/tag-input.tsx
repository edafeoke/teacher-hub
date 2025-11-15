"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Add tags...",
  className,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      if (maxTags && tags.length >= maxTags) {
        return;
      }
      onTagsChange([...tags, tag]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="w-full"
      />
      {maxTags && (
        <p className="text-muted-foreground text-xs">
          {tags.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
}

