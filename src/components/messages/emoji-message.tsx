"use client";

interface EmojiMessageProps {
  content: string;
}

export function EmojiMessage({ content }: EmojiMessageProps) {
  return (
    <div className="text-6xl text-center py-2">
      {content}
    </div>
  );
}

