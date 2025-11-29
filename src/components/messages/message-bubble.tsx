"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { TextMessage } from "./text-message";
import { AudioMessage } from "./audio-message";
import { VideoMessage } from "./video-message";
import { FileMessage } from "./file-message";
import { ImageMessage } from "./image-message";
import { EmojiMessage } from "./emoji-message";
import { MessageStatusIndicator } from "./message-status";

type MessageType = "TEXT" | "AUDIO" | "VIDEO" | "FILE" | "IMAGE" | "EMOJI";
type MessageStatus = "SENT" | "DELIVERED" | "READ";

interface MessageAttachment {
  id: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  duration: number | null;
}

interface MessageBubbleProps {
  id: string;
  content: string | null;
  messageType: MessageType;
  status: MessageStatus;
  timestamp: Date;
  attachments: MessageAttachment[];
  isOwnMessage: boolean;
}

export function MessageBubble({
  content,
  messageType,
  status,
  timestamp,
  attachments,
  isOwnMessage,
}: MessageBubbleProps) {
  const renderMessage = () => {
    switch (messageType) {
      case "TEXT":
        return <TextMessage content={content || ""} />;
      case "AUDIO":
        return (
          <AudioMessage
            fileUrl={attachments[0]?.fileUrl || ""}
            duration={attachments[0]?.duration || 0}
          />
        );
      case "VIDEO":
        return (
          <VideoMessage
            fileUrl={attachments[0]?.fileUrl || ""}
            thumbnailUrl={attachments[0]?.thumbnailUrl}
            duration={attachments[0]?.duration}
          />
        );
      case "IMAGE":
        return (
          <ImageMessage
            fileUrl={attachments[0]?.fileUrl || ""}
            thumbnailUrl={attachments[0]?.thumbnailUrl}
          />
        );
      case "FILE":
        return (
          <FileMessage
            attachments={attachments}
          />
        );
      case "EMOJI":
        return <EmojiMessage content={content || ""} />;
      default:
        return <TextMessage content={content || ""} />;
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${isOwnMessage ? "items-end" : "items-start"} w-full`}>
      <Card
        className={`px-4 py-2 max-w-[70%] ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-muted rounded-2xl rounded-tl-sm"
        }`}
      >
        {renderMessage()}
      </Card>
      <div className={`flex items-center gap-1 text-xs text-muted-foreground px-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        <span>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {isOwnMessage && <MessageStatusIndicator status={status} />}
      </div>
    </div>
  );
}

