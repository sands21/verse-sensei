"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-interface";
import { ChatEmptyState } from "./chat-empty-state";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  userName?: string;
  characterName?: string;
  onPromptClick?: (prompt: string) => void;
}

export function ChatMessages({
  messages,
  isTyping,
  userName,
  characterName,
  onPromptClick,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Show empty state if no messages
  if (messages.length === 0 && !isTyping) {
    return (
      <ChatEmptyState
        userName={userName}
        characterName={characterName}
        onPromptClick={onPromptClick || (() => {})}
      />
    );
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Minimal, safe markdown renderer: **bold**, *italic*, `code`, line breaks
  const renderMarkdown = (text: string) => {
    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    let html = escapeHtml(text);
    // Inline code first to avoid conflicts
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 rounded bg-[oklch(0.11_0_0)] border border-border/70">$1</code>'
    );
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    // Italic (single asterisks, not part of bold)
    html = html.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    // Line breaks
    html = html.replace(/\n/g, "<br />");
    return { __html: html };
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex flex-col max-w-[70%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "break-words leading-relaxed",
                  message.role === "user"
                    ? "rounded-2xl px-5 py-3 bg-[oklch(0.24_0_0)] text-foreground/95 shadow-sm"
                    : "text-foreground/95"
                )}
                dangerouslySetInnerHTML={renderMarkdown(message.content)}
              />
              <span className="text-xs text-muted-foreground mt-1.5">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-1.5 px-3 py-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-muted animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-muted animate-bounce" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
