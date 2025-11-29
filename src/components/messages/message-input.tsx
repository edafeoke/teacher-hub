"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { EmojiPicker } from "./emoji-picker";
import { AudioRecorder } from "./audio-recorder";
import { VideoRecorder } from "./video-recorder";
import { AttachmentPreview } from "./attachment-preview";
import { toast } from "sonner";

// MessageType enum values
type MessageType = "TEXT" | "AUDIO" | "VIDEO" | "FILE" | "IMAGE" | "EMOJI";

interface Attachment {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl?: string;
  duration?: number;
}

interface MessageInputProps {
  onSend: (
    content: string,
    messageType: MessageType,
    attachments?: Attachment[]
  ) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    setIsSending(true);
    try {
      let messageType: MessageType = "TEXT";
      
      if (attachments.length > 0) {
        const firstAttachment = attachments[0];
        if (firstAttachment.fileType.startsWith("audio/")) {
          messageType = "AUDIO";
        } else if (firstAttachment.fileType.startsWith("video/")) {
          messageType = "VIDEO";
        } else if (firstAttachment.fileType.startsWith("image/")) {
          messageType = "IMAGE";
        } else {
          messageType = "FILE";
        }
      } else if (message.trim().match(/^[\p{Emoji}]$/u)) {
        // Single emoji
        messageType = "EMOJI";
      }

      await onSend(message.trim(), messageType, attachments.length > 0 ? attachments : undefined);
      setMessage("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file size
      const maxSize = file.type.startsWith("audio/")
        ? 10 * 1024 * 1024
        : file.type.startsWith("video/")
        ? 50 * 1024 * 1024
        : file.type.startsWith("image/")
        ? 5 * 1024 * 1024
        : 25 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/messages/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();

        newAttachments.push({
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          thumbnailUrl: file.type.startsWith("image/") ? data.fileUrl : undefined,
        });
      } catch (error) {
        console.error("Error uploading file:", error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAudioComplete = async (audioBlob: Blob, duration: number) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setAttachments((prev) => [
        ...prev,
        {
          fileUrl: data.fileUrl,
          fileName: "audio.webm",
          fileType: data.fileType,
          fileSize: data.fileSize,
          duration,
        },
      ]);
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Failed to upload audio");
    }
  };

  const handleVideoComplete = async (videoBlob: Blob, duration: number) => {
    try {
      const formData = new FormData();
      formData.append("file", videoBlob, "video.webm");

      const response = await fetch("/api/messages/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      setAttachments((prev) => [
        ...prev,
        {
          fileUrl: data.fileUrl,
          fileName: "video.webm",
          fileType: data.fileType,
          fileSize: data.fileSize,
          duration,
        },
      ]);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video");
    }
  };

  return (
    <div className="border-t bg-background">
      <AttachmentPreview
        attachments={attachments}
        onRemove={(index) =>
          setAttachments((prev) => prev.filter((_, i) => i !== index))
        }
      />
      <div className="p-4">
        <div className="flex items-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isSending}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,video/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <AudioRecorder
            onRecordingComplete={handleAudioComplete}
          />
          <VideoRecorder
            onRecordingComplete={handleVideoComplete}
          />
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || isSending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={disabled || isSending || (!message.trim() && attachments.length === 0)}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

