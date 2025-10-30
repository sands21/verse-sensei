"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";
import supabase from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedUniverse, setSelectedUniverse] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Close sidebar by default on mobile, open on lg+
  useEffect(() => {
    const updateSidebarForViewport = () => {
      if (typeof window !== "undefined") {
        setIsSidebarOpen(window.innerWidth >= 1024); // lg breakpoint
      }
    };
    updateSidebarForViewport();
    window.addEventListener("resize", updateSidebarForViewport);
    return () => window.removeEventListener("resize", updateSidebarForViewport);
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      // Extract first name from Google metadata, or fall back to email
      if (user?.user_metadata?.full_name) {
        // Get first name from full name
        const firstName = user.user_metadata.full_name.split(" ")[0];
        setUserName(firstName);
      } else if (user?.email) {
        // Fall back to email-based name
        const emailName = user.email.split("@")[0];
        const capitalizedName =
          emailName.charAt(0).toUpperCase() + emailName.slice(1);
        setUserName(capitalizedName);
      }
    };
    getUser();
  }, []);

  // Initialize default universe/character from DB if none selected
  useEffect(() => {
    const initDefaults = async () => {
      if (selectedUniverse) return;
      const { data: universes } = await supabase
        .from("universes")
        .select("id, name")
        .order("name", { ascending: true })
        .limit(1);
      const firstUniverse = universes?.[0];
      if (!firstUniverse) return;
      setSelectedUniverse(firstUniverse.name);

      const { data: chars } = await supabase
        .from("characters")
        .select("name")
        .eq("universe_id", firstUniverse.id)
        .order("name", { ascending: true })
        .limit(1);
      const firstChar = chars?.[0];
      if (firstChar) setSelectedCharacter(firstChar.name);
    };
    initDefaults();
  }, [selectedUniverse]);

  // Fetch character ID when character/universe changes
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!selectedCharacter || !selectedUniverse) return;

      const { data: universe } = await supabase
        .from("universes")
        .select("id")
        .eq("name", selectedUniverse)
        .single();

      if (universe) {
        const { data: character } = await supabase
          .from("characters")
          .select("id, name")
          .eq("name", selectedCharacter)
          .eq("universe_id", universe.id)
          .single();

        if (character) {
          setCharacterId(character.id);
          // Don't load greeting - show empty state instead
        }
      }
    };

    fetchCharacter();
  }, [selectedCharacter, selectedUniverse]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Create or use existing conversation
      let convId = conversationId;
      if (!convId && userId && characterId) {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({
            user_id: userId,
            character_id: characterId,
          })
          .select("id")
          .single();

        convId = newConv?.id ?? null;
        setConversationId(convId);
      }

      // Save user message
      if (convId) {
        await supabase.from("messages").insert({
          conversation_id: convId,
          sender: "user",
          content,
          user_id: userId,
        });
      }

      // Get auth token for API
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: content,
          conversationId: convId,
          characterId: characterId,
        }),
      });

      const data = await response.json();

      if (data.ok && data.reply) {
        const aiMessage: Message = {
          id: data.aiMessageId || `ai-${Date.now()}`,
          content: data.reply,
          role: "assistant",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, I couldn't process your message. Please try again.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectConversation = async (convId: string) => {
    setConversationId(convId);
    setIsTyping(true);

    try {
      // Load conversation messages
      const { data: msgs } = await supabase
        .from("messages")
        .select("id, content, sender, timestamp")
        .eq("conversation_id", convId)
        .order("timestamp", { ascending: true });

      if (msgs) {
        const loadedMessages: Message[] = msgs.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role:
            msg.sender === "user" ? ("user" as const) : ("assistant" as const),
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(loadedMessages);
      }

      // Load conversation character
      const { data: convo } = await supabase
        .from("conversations")
        .select("character_id")
        .eq("id", convId)
        .single();

      if (convo?.character_id) {
        setCharacterId(convo.character_id);

        // Fetch character details
        const { data: character } = await supabase
          .from("characters")
          .select("name, universe_id")
          .eq("id", convo.character_id)
          .single();

        if (character) {
          setSelectedCharacter(character.name);

          // Fetch universe details
          const { data: universe } = await supabase
            .from("universes")
            .select("name")
            .eq("id", character.universe_id)
            .single();

          if (universe) {
            setSelectedUniverse(universe.name);
          }
        }
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleNewChat = async () => {
    setConversationId(null);
    setMessages([]);

    // Re-fetch character ID for current selection
    if (selectedCharacter && selectedUniverse) {
      const { data: universe } = await supabase
        .from("universes")
        .select("id")
        .eq("name", selectedUniverse)
        .single();

      if (universe) {
        const { data: character } = await supabase
          .from("characters")
          .select("id, name")
          .eq("name", selectedCharacter)
          .eq("universe_id", universe.id)
          .single();

        if (character) {
          setCharacterId(character.id);
          // Don't load greeting - show empty state instead
        }
      }
    }
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop blur when sidebar open */}
      {!isSidebarOpen ? null : (
        <div
          className="fixed inset-0 z-30 lg:hidden bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <ChatSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelectConversation={handleSelectConversation}
        activeConversationId={conversationId}
        onNewChat={handleNewChat}
      />

      {/* Main Chat Area */}
      <main
        className={cn(
          "flex flex-col flex-1 transition-all duration-300 ease-in-out",
          "bg-[oklch(0.15_0_0)]",
          isSidebarOpen ? "lg:ml-0" : "ml-0"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={conversationId || characterId || "empty"}
            initial={{ opacity: 0, y: 8, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.995 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ChatMessages
                messages={messages}
                isTyping={isTyping}
                userName={userName}
                characterName={selectedCharacter}
                onPromptClick={handlePromptClick}
              />
            </div>

            {/* Input Area */}
            <ChatInput
              selectedUniverse={selectedUniverse}
              selectedCharacter={selectedCharacter}
              onUniverseChange={setSelectedUniverse}
              onCharacterChange={setSelectedCharacter}
              onSendMessage={handleSendMessage}
            />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
