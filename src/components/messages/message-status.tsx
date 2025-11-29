"use client";

import { Check, CheckCheck } from "lucide-react";

type MessageStatus = "SENT" | "DELIVERED" | "READ";

interface MessageStatusIndicatorProps {
  status: MessageStatus;
}

export function MessageStatusIndicator({
  status,
}: MessageStatusIndicatorProps) {
  switch (status) {
    case "SENT":
      return <Check className="h-3 w-3 inline" />;
    case "DELIVERED":
      return <CheckCheck className="h-3 w-3 inline" />;
    case "READ":
      return <CheckCheck className="h-3 w-3 inline text-blue-500" />;
    default:
      return <Check className="h-3 w-3 inline" />;
  }
}

