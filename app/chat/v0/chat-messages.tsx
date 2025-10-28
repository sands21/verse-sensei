"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-interface";
import { Bot, User } from "lucide-react";
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
              "flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  "border-2 shadow-lg",
                  message.role === "user"
                    ? "bg-primary border-primary/50 shadow-primary/20"
                    : "bg-card border-accent shadow-accent/20"
                )}
              >
                {message.role === "user" ? (
                  <User className="h-5 w-5 text-primary-foreground" />
                ) : (
                  <Bot className="h-5 w-5 text-foreground" />
                )}
              </div>
            </div>

            {/* Message Content */}
            <div
              className={cn(
                "flex flex-col max-w-[70%]",
                message.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "rounded-2xl px-5 py-3 shadow-lg",
                  "border backdrop-blur-sm break-words",
                  message.role === "user"
                    ? "bg-primary/90 border-primary/50 text-primary-foreground shadow-primary/20"
                    : "bg-card/90 border-accent text-card-foreground shadow-black/30"
                )}
                dangerouslySetInnerHTML={renderMarkdown(message.content)}
              />
              <span className="text-xs text-muted-foreground mt-1.5 px-2">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-card border-2 border-accent shadow-lg shadow-accent/20">
                <Bot className="h-5 w-5 text-foreground" />
              </div>
            </div>
            <div className="flex items-center px-5 py-3 bg-card/90 border border-accent rounded-2xl shadow-lg shadow-black/30 backdrop-blur-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
