"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

// Common emojis organized by category
const EMOJI_CATEGORIES = {
  "Smileys & People": [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
    "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚",
    "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩",
    "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣",
    "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬",
  ],
  "Gestures": [
    "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟",
    "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👎",
    "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
  ],
  "Objects": [
    "💎", "🔔", "📱", "💻", "⌚", "📷", "📹", "🎥", "📺", "📻",
    "🎙", "🎚", "🎛", "⏱", "⏲", "⏰", "🕰", "⌛", "⏳", "📡",
  ],
  "Symbols": [
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
    "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "☮️",
    "✝️", "☪️", "🕉", "☸️", "✡️", "🔯", "🕎", "☯️", "☦️", "🛐",
  ],
  "Food": [
    "🍎", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑",
    "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒",
  ],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  children?: React.ReactNode;
}

export function EmojiPicker({ onEmojiSelect, children }: EmojiPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    // Keep popover open for multiple selections
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" type="button">
            <Smile className="h-5 w-5" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-2">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="mb-4">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                {category}
              </h4>
              <div className="grid grid-cols-10 gap-1">
                {emojis.map((emoji, index) => (
                  <button
                    key={`${category}-${index}`}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-xl hover:bg-muted rounded p-1 transition-colors"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

