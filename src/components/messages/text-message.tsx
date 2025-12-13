"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";

interface TextMessageProps {
  content: string;
}

// URL regex pattern
const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

function detectLinks(text: string): Array<{ type: "text" | "link" | "email"; content: string; url?: string }> {
  const parts: Array<{ type: "text" | "link" | "email"; content: string; url?: string }> = [];
  let lastIndex = 0;

  // Find all URLs and emails
  const matches: Array<{ index: number; length: number; type: "link" | "email"; url: string }> = [];
  
  // Find URLs
  let urlMatch;
  while ((urlMatch = URL_REGEX.exec(text)) !== null) {
    matches.push({
      index: urlMatch.index,
      length: urlMatch[0].length,
      type: "link",
      url: urlMatch[0],
    });
  }

  // Find emails
  URL_REGEX.lastIndex = 0; // Reset regex
  let emailMatch;
  while ((emailMatch = EMAIL_REGEX.exec(text)) !== null) {
    // Only add if not already part of a URL
    const isPartOfUrl = matches.some(
      (m) => m.type === "link" && emailMatch.index >= m.index && emailMatch.index < m.index + m.length
    );
    if (!isPartOfUrl) {
      matches.push({
        index: emailMatch.index,
        length: emailMatch[0].length,
        type: "email",
        url: `mailto:${emailMatch[0]}`,
      });
    }
  }

  // Sort matches by index
  matches.sort((a, b) => a.index - b.index);

  // Build parts array
  matches.forEach((match) => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex, match.index),
      });
    }

    // Add link/email
    parts.push({
      type: match.type,
      content: text.substring(match.index, match.index + match.length),
      url: match.url,
    });

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.substring(lastIndex),
    });
  }

  // If no matches, return entire text as single part
  if (parts.length === 0) {
    parts.push({ type: "text", content: text });
  }

  return parts;
}

export function TextMessage({ content }: TextMessageProps) {
  const parts = React.useMemo(() => detectLinks(content), [content]);

  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }

        const isEmail = part.type === "email";
        const displayText = isEmail ? part.content : part.content;

        return (
          <a
            key={index}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary underline hover:text-primary/80 transition-colors break-all"
          >
            {displayText}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        );
      })}
    </p>
  );
}

