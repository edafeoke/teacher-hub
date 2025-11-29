"use client";

interface TextMessageProps {
  content: string;
}

export function TextMessage({ content }: TextMessageProps) {
  return <p className="text-sm whitespace-pre-wrap" style={{ overflowWrap: 'break-word', wordBreak: 'normal' }}>{content}</p>;
}

