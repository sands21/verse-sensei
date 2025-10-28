"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  Plus,
  PanelLeft,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatHistory } from "./chat-interface";
import supabase from "@/lib/supabaseClient";

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onSelectConversation?: (conversationId: string) => void;
  activeConversationId?: string | null;
  onNewChat?: () => void;
}

export function ChatSidebar({
  isOpen,
  onToggle,
  onSelectConversation,
  activeConversationId,
  onNewChat,
}: ChatSidebarProps) {
  const [conversations, setConversations] = useState<ChatHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);
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
      {/* Fixed toggle button - always visible */}
      <button
        onClick={onToggle}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
        className={cn(
          "fixed top-4 left-4 z-50",
          "inline-flex h-10 w-10 items-center justify-center rounded-md",
          "!bg-[oklch(0.11_0_0)] hover:!bg-[oklch(0.15_0_0)] transition-all duration-200",
          "border-0 cursor-pointer"
        )}
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {/* Additional icons - fade in when sidebar closed */}
      <div
        className={cn(
          "fixed top-4 left-[64px] z-50 flex items-center gap-2 transition-all duration-300",
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md",
            "!bg-[oklch(0.11_0_0)]",
            "hover:!bg-[oklch(0.15_0_0)] transition-colors cursor-pointer"
          )}
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <button
          onClick={() => onNewChat?.()}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md",
            "!bg-[oklch(0.11_0_0)]",
            "hover:!bg-[oklch(0.15_0_0)] transition-colors cursor-pointer"
          )}
          aria-label="New chat"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative h-full bg-[oklch(0.04_0_0)] transition-all duration-300 ease-in-out z-40",
          "flex flex-col overflow-hidden",
          isOpen ? "w-[240px]" : "w-0"
        )}
      >
        <div
          className={cn(
            "flex flex-col h-full w-[240px] flex-shrink-0",
            "transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {/* App branding */}
          <div className="px-6 py-4 bg-[oklch(0.04_0_0)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex-shrink-0" />
              <h1 className="text-lg font-semibold tracking-tight text-foreground whitespace-nowrap font-display">
                Verse Sensei
              </h1>
            </div>
          </div>

          {/* New Chat button */}
          <div className="pt-3 pb-2 mb-3">
            <button
              onClick={() => onNewChat?.()}
              className={cn(
                "mx-4 w-[calc(100%-2rem)] inline-flex items-center justify-center gap-2",
                "rounded-lg px-4 py-2.5 text-sm font-medium outline-none",
                "!bg-[oklch(0.18_0_0)] text-muted-foreground",
                "hover:!bg-[oklch(0.26_0_0)] hover:text-foreground",
                "active:!bg-[oklch(0.28_0_0)]",
                "transition-all duration-200 cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-border/70"
              )}
            >
              <Plus className="h-4 w-4" /> New Chat
            </button>
          </div>

          {/* Search bar */}
          <div className="px-4 mb-3">
            <div className="relative max-w-[240px] mx-auto">
              <Search className="pointer-events-none absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your convos..."
                className={cn(
                  "w-full pl-8 pr-3 py-2 pb-3 text-sm",
                  "!bg-transparent border-none",
                  "outline-none text-foreground placeholder:text-muted-foreground",
                  "transition-colors duration-200"
                )}
              />
              <div className="h-[2px] bg-border/60 absolute bottom-0 left-0 right-0" />
            </div>
          </div>

          {/* Chat List */}
          <div
            className={cn(
              "flex-1 overflow-y-auto px-2 py-3 thin-scrollbar bg-[oklch(0.04_0_0)]"
            )}
          >
            <div className="px-2 pb-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Last 30 Days
              </span>
            </div>
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
              conversations
                .filter((c) =>
                  c.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => onSelectConversation?.(chat.id)}
                    className={cn(
                      "w-full text-left rounded-lg transition-all duration-200 cursor-pointer",
                      "group relative mb-2 py-2.5 px-4",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border/70",
                      activeConversationId === chat.id
                        ? "!bg-[oklch(0.20_0_0)] border border-border/70 shadow-sm"
                        : "!bg-transparent hover:!bg-[oklch(0.15_0_0)] border border-transparent active:scale-[0.99]"
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

          {/* User account section pinned to bottom */}
          <div className="mt-auto sticky bottom-0 bg-[oklch(0.04_0_0)]">
            <div className="p-3">
              <button
                className={cn(
                  "w-full flex items-center gap-3 text-left",
                  "rounded-xl px-4 py-3",
                  "bg-[oklch(0.06_0_0)] border border-border/70",
                  "shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer",
                  "hover:bg-[oklch(0.08_0_0)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border/70"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-[oklch(0.11_0_0)] border border-border/70 flex items-center justify-center shadow-md">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {userEmail || "Signed out"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Free plan
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-20"
          onClick={() => setIsSearchModalOpen(false)}
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl mx-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[oklch(0.08_0_0)] rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder="Search or press Enter to start new chat..."
                    className={cn(
                      "w-full pl-12 pr-4 py-3 text-base",
                      "!bg-transparent !border-none appearance-none",
                      "outline-none text-foreground placeholder:text-muted-foreground"
                    )}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !modalSearchQuery.trim()) {
                        setIsSearchModalOpen(false);
                        onNewChat?.();
                      }
                    }}
                  />
                  <Plus className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {modalSearchQuery ? (
                  <>
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        </div>
                        <span>Recent Chats</span>
                      </div>
                    </div>
                    <div className="p-2">
                      {conversations
                        .filter((c) =>
                          c.title
                            .toLowerCase()
                            .includes(modalSearchQuery.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((chat) => (
                          <button
                            key={chat.id}
                            onClick={() => {
                              onSelectConversation?.(chat.id);
                              setIsSearchModalOpen(false);
                              setModalSearchQuery("");
                            }}
                            className={cn(
                              "w-full text-left rounded-lg transition-all duration-200 cursor-pointer",
                              "py-3 px-3 mb-1",
                              "hover:bg-[oklch(0.15_0_0)]",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border/70"
                            )}
                          >
                            <h4 className="font-medium text-sm text-foreground mb-1">
                              {chat.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {chat.lastMessage}
                            </p>
                          </button>
                        ))}
                      {conversations.filter((c) =>
                        c.title
                          .toLowerCase()
                          .includes(modalSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="py-8 px-4 text-center text-muted-foreground text-sm">
                          No conversations found
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-4">
                    <div className="px-4 py-3 mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                      </div>
                      <span>Recent Chats</span>
                    </div>
                    {conversations.slice(0, 5).map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => {
                          onSelectConversation?.(chat.id);
                          setIsSearchModalOpen(false);
                        }}
                        className={cn(
                          "w-full text-left rounded-lg transition-all duration-200 cursor-pointer",
                          "py-3 px-3 mb-1",
                          "hover:bg-[oklch(0.15_0_0)]"
                        )}
                      >
                        <h4 className="font-medium text-sm text-foreground mb-1">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {chat.lastMessage}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
