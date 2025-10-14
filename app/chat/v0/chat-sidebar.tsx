"use client";

import { useState, useEffect } from "react";
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import type { ChatHistory } from "./chat-interface";
import supabase from "@/lib/supabaseClient";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation?: (conversationId: string) => void;
  activeConversationId?: string | null;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onSelectConversation,
  activeConversationId,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: convos } = await supabase
          .from("conversations")
          .select(
            `
            id,
            created_at,
            character_id
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (convos) {
          const formattedConvos: ChatHistory[] = [];

          for (const convo of convos) {
            // Fetch character name
            const { data: character } = await supabase
              .from("characters")
              .select("name")
              .eq("id", convo.character_id)
              .single();

            // Fetch messages for this conversation
            const { data: messages } = await supabase
              .from("messages")
              .select("content, timestamp")
              .eq("conversation_id", convo.id)
              .order("timestamp", { ascending: true });

            const lastMsg = messages?.[messages.length - 1];
            const firstUserMsg = messages?.find((m) => m.content);

            formattedConvos.push({
              id: convo.id,
              title:
                firstUserMsg?.content?.slice(0, 50) ||
                `Chat with ${character?.name || "Character"}`,
              lastMessage: lastMsg?.content?.slice(0, 60) || "New conversation",
              timestamp: new Date(
                lastMsg?.timestamp || convo.created_at || Date.now()
              ),
            });
          }

          setConversations(formattedConvos);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">
                  Loading conversations...
                </p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center py-8 px-4">
                <p className="text-sm text-muted-foreground text-center">
                  No conversations yet. Start chatting to create one!
                </p>
              </div>
            ) : (
              conversations.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectConversation?.(chat.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-colors duration-200",
                    "group relative mb-2",
                    activeConversationId === chat.id
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
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
