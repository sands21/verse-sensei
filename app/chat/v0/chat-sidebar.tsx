"use client";

import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { ChatHistory } from "./chat-interface";

const DUMMY_CHATS: ChatHistory[] = [
  {
    id: "1",
    title: "Superhero Powers Discussion",
    lastMessage: "Tell me about your suit's capabilities",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    title: "Avengers Team Strategy",
    lastMessage: "How do you coordinate with the team?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "3",
    title: "Arc Reactor Technology",
    lastMessage: "Explain how the arc reactor works",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
  },
  {
    id: "4",
    title: "Battle of New York",
    lastMessage: "What was your strategy during the invasion?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "5",
    title: "Future of AI",
    lastMessage: "Thoughts on artificial intelligence?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
  },
  {
    id: "6",
    title: "Stark Industries",
    lastMessage: "How do you balance hero work with business?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: "7",
    title: "Multiverse Theories",
    lastMessage: "Do you believe in parallel universes?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
  },
];

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ChatSidebar({ isOpen, onToggle }: ChatSidebarProps) {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className={cn(
          "fixed top-4 z-50 transition-all duration-300 !bg-[oklch(0.11_0_0)] border border-border/70 hover:!bg-[oklch(0.15_0_0)]",
          isOpen ? "left-[calc(25%-1rem)] lg:left-[calc(25%-1rem)]" : "left-4"
        )}
      >
        {isOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative h-full bg-[oklch(0.04_0_0)] border-r border-border/70 transition-all duration-300 ease-in-out z-40",
          "flex flex-col",
          isOpen ? "w-[280px] lg:w-[25%]" : "w-0 lg:w-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full overflow-hidden",
            !isOpen && "opacity-0"
          )}
        >
          {/* Header */}
          <div className="p-6 border-b border-border/70 bg-[oklch(0.04_0_0)]">
            <h2 className="text-xl font-semibold text-foreground">
              Chat History
            </h2>
          </div>

          {/* Chat List */}
          <div
            className={cn(
              "flex-1 overflow-y-auto px-2 py-3 thin-scrollbar bg-[oklch(0.04_0_0)]"
            )}
          >
            {DUMMY_CHATS.map((chat, index) => (
              <button
                key={chat.id}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-colors duration-200",
                  "group relative mb-2",
                  index === 0
                    ? "!bg-[oklch(0.20_0_0)]"
                    : "!bg-transparent hover:!bg-[oklch(0.15_0_0)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-foreground truncate mb-1">
                      {chat.title}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      {formatTimestamp(chat.timestamp)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
