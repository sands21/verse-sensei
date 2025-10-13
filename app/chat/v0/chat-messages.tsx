"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "./chat-interface";
import { Bot, User } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  "border backdrop-blur-sm",
                  message.role === "user"
                    ? "bg-primary/90 border-primary/50 text-primary-foreground shadow-primary/20"
                    : "bg-card/90 border-accent text-card-foreground shadow-black/30"
                )}
              >
                <p className="text-sm leading-relaxed text-pretty">
                  {message.content}
                </p>
              </div>
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
