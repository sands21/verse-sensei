"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, Search, Sparkles, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import supabase from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

type UniverseRow = { id: string; name: string };
type CharacterRow = { id: string; name: string; universe_id: string };

interface ChatInputProps {
  selectedUniverse: string;
  selectedCharacter: string;
  onUniverseChange: (universe: string) => void;
  onCharacterChange: (character: string) => void;
  onSendMessage: (message: string) => void;
  isUniverseLocked?: boolean;
}

export function ChatInput({
  selectedUniverse,
  selectedCharacter,
  onUniverseChange,
  onCharacterChange,
  onSendMessage,
  isUniverseLocked = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isUniverseOpen, setIsUniverseOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [universeSearch, setUniverseSearch] = useState("");
  const [characterSearch, setCharacterSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [universes, setUniverses] = useState<UniverseRow[]>([]);
  const [characters, setCharacters] = useState<CharacterRow[]>([]);

  // Load universes once
  useEffect(() => {
    const loadUniverses = async () => {
      const { data } = await supabase
        .from("universes")
        .select("id, name")
        .order("name", { ascending: true });
      setUniverses(data || []);
    };
    loadUniverses();
  }, []);

  const loadCharactersForUniverse = async (universeId: string) => {
    const { data, error } = await supabase
      .from("characters")
      .select("id, name, universe_id")
      .eq("universe_id", universeId)
      .order("name", { ascending: true });
    if (error) {
      console.error("Failed to load characters:", error.message);
      setCharacters([]);
      return [] as CharacterRow[];
    }
    const list = data || [];
    setCharacters(list);
    return list;
  };

  // Load characters when selectedUniverse changes
  useEffect(() => {
    if (!selectedUniverse) return;
    const match = universes.find((u) => u.name === selectedUniverse);
    if (match) {
      loadCharactersForUniverse(match.id);
    } else {
      // Fallback: lookup by name if universes not yet loaded
      (async () => {
        const { data: uni } = await supabase
          .from("universes")
          .select("id")
          .eq("name", selectedUniverse)
          .single();
        if (uni) await loadCharactersForUniverse(uni.id);
      })();
    }
  }, [selectedUniverse, universes]);

  const filteredUniverses = universes.filter((u) =>
    u.name.toLowerCase().includes(universeSearch.toLowerCase())
  );

  const filteredCharacters = characters.filter((c) =>
    c.name.toLowerCase().includes(characterSearch.toLowerCase())
  );

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [message]);

  return (
    <div className="bg-transparent">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div
          className={cn(
            "relative rounded-2xl bg-background/95 backdrop-blur-sm",
            "border-2 border-accent/70",
            // soft ambient glow plus depth shadow
            "shadow-[0_10px_36px_rgba(0,0,0,0.45),0_0_24px_rgba(255,122,69,0.06)]",
            "px-3 md:px-4 py-3"
          )}
          aria-label="Message composer"
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent text-foreground placeholder:text-muted-foreground",
              "focus:outline-none text-sm md:text-[0.95rem] leading-relaxed",
              "overflow-hidden",
              "pr-14 pb-14 md:pb-[3.75rem] min-h-20"
            )}
          />

          <div
            className={cn(
              "absolute left-2 md:left-3 bottom-2 md:bottom-3 z-10",
              "flex items-center gap-1.5"
            )}
            aria-label="Selectors"
          >
            <Popover
              open={isUniverseOpen && !isUniverseLocked}
              onOpenChange={(o) => {
                if (isUniverseLocked) return;
                setIsUniverseOpen(o);
                if (o) setIsCharacterOpen(false);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  aria-haspopup="listbox"
                  aria-expanded={isUniverseOpen}
                  aria-controls="universe-combobox-list"
                  role="combobox"
                  disabled={isUniverseLocked}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full",
                    "px-2.5 py-1 text-xs md:text-sm font-medium",
                    "bg-secondary hover:bg-secondary/90 transition-colors",
                    "shadow-sm shadow-black/30 focus-visible:outline-none focus-visible:ring-0",
                    !isUniverseLocked && "cursor-pointer",
                    isUniverseLocked &&
                      "opacity-50 cursor-not-allowed pointer-events-auto"
                  )}
                  title={
                    isUniverseLocked
                      ? "Start a new chat to change universe"
                      : undefined
                  }
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedUniverse}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isUniverseOpen && "rotate-180"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                id="universe-combobox-list"
                align="start"
                side="top"
                sideOffset={12}
                className={cn(
                  "p-0 z-50 w-[min(320px,calc(var(--radix-popover-trigger-width)+120px))] rounded-2xl",
                  "bg-[oklch(0.11_0_0)] border border-border/70",
                  "shadow-[0_8px_28px_rgba(0,0,0,0.35)] overflow-hidden"
                )}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="p-4 border-b border-border/70 bg-[oklch(0.11_0_0)]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search universes..."
                        value={universeSearch}
                        onChange={(e) => setUniverseSearch(e.target.value)}
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
                  <div className="max-h-64 overflow-y-auto px-2 py-2 bg-[oklch(0.11_0_0)]">
                    {filteredUniverses.map((universe, index) => (
                      <motion.button
                        key={universe.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{
                          duration: 0.15,
                          delay: index * 0.02,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        onClick={() => {
                          onUniverseChange(universe.name);
                          // Auto-load characters and set a sensible default character
                          (async () => {
                            const list = await loadCharactersForUniverse(
                              universe.id
                            );
                            if (list.length > 0) {
                              onCharacterChange(list[0].name);
                            }
                          })();
                          setIsUniverseOpen(false);
                          setUniverseSearch("");
                          textareaRef.current?.focus();
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm cursor-pointer",
                          "transition-colors duration-200",
                          selectedUniverse === universe.name
                            ? "!bg-[oklch(0.20_0_0)]"
                            : "!bg-transparent hover:!bg-[oklch(0.15_0_0)]"
                        )}
                      >
                        <span className="font-medium text-foreground">
                          {universe.name}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>

            <Popover
              open={isCharacterOpen}
              onOpenChange={(o) => {
                setIsCharacterOpen(o);
                if (o) setIsUniverseOpen(false);
              }}
            >
              <PopoverTrigger asChild>
                <button
                  aria-haspopup="listbox"
                  aria-expanded={isCharacterOpen}
                  aria-controls="character-combobox-list"
                  role="combobox"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full",
                    "px-2.5 py-1 text-xs md:text-sm font-medium",
                    "bg-secondary hover:bg-secondary/90 transition-colors",
                    "shadow-sm shadow-black/30 focus-visible:outline-none focus-visible:ring-0",
                    "cursor-pointer"
                  )}
                >
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedCharacter}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-200",
                      isCharacterOpen && "rotate-180"
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent
                id="character-combobox-list"
                align="start"
                side="top"
                sideOffset={12}
                className={cn(
                  "p-0 z-50 w-[min(360px,calc(var(--radix-popover-trigger-width)+160px))] rounded-2xl",
                  "bg-[oklch(0.11_0_0)] border border-border/70",
                  "shadow-[0_8px_28px_rgba(0,0,0,0.35)] overflow-hidden"
                )}
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <div className="p-4 border-b border-border/70 bg-[oklch(0.11_0_0)]">
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search characters..."
                        value={characterSearch}
                        onChange={(e) => setCharacterSearch(e.target.value)}
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
                  <div className="max-h-64 overflow-y-auto px-2 py-2 bg-[oklch(0.11_0_0)]">
                    <AnimatePresence mode="wait">
                      {filteredCharacters.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="px-3 py-6 text-sm text-muted-foreground/80"
                        >
                          No characters found.
                        </motion.div>
                      ) : (
                        filteredCharacters.map((character, index) => (
                          <motion.button
                            key={character.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{
                              duration: 0.15,
                              delay: index * 0.02,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            onClick={() => {
                              onCharacterChange(character.name);
                              setIsCharacterOpen(false);
                              setCharacterSearch("");
                              textareaRef.current?.focus();
                            }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm cursor-pointer",
                              "transition-colors duration-200",
                              selectedCharacter === character.name
                                ? "!bg-[oklch(0.20_0_0)]"
                                : "!bg-transparent hover:!bg-[oklch(0.15_0_0)]"
                            )}
                          >
                            <span className="font-medium text-foreground">
                              {character.name}
                            </span>
                          </motion.button>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            onClick={handleSend}
            disabled={!message.trim()}
            size="icon"
            className={cn(
              "absolute bottom-2 md:bottom-3 right-2 md:right-3 h-10 w-10 rounded-full",
              "bg-primary hover:bg-primary/90",
              "shadow-[0_8px_20px_var(--shadow-primary,rgba(0,0,0,0.45))] hover:shadow-[0_10px_28px_var(--shadow-primary,rgba(0,0,0,0.55))]",
              "transition-all duration-200",
              "focus-visible:ring-0",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
