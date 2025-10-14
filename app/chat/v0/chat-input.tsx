"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Send, ChevronDown, Search, Sparkles, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

const UNIVERSES = [
  { id: "marvel", name: "Marvel", icon: "🦸" },
  { id: "dc", name: "DC", icon: "🦇" },
  { id: "star-wars", name: "Star Wars", icon: "⚔️" },
  { id: "harry-potter", name: "Harry Potter", icon: "🪄" },
  { id: "lotr", name: "Lord of the Rings", icon: "💍" },
];

const CHARACTERS = [
  { id: "iron-man", name: "Iron Man", universe: "Marvel", avatar: "🤖" },
  { id: "spider-man", name: "Spider-Man", universe: "Marvel", avatar: "🕷️" },
  { id: "thor", name: "Thor", universe: "Marvel", avatar: "⚡" },
  { id: "batman", name: "Batman", universe: "DC", avatar: "🦇" },
  { id: "superman", name: "Superman", universe: "DC", avatar: "🔵" },
  { id: "luke", name: "Luke Skywalker", universe: "Star Wars", avatar: "⚔️" },
  { id: "vader", name: "Darth Vader", universe: "Star Wars", avatar: "😈" },
];

interface ChatInputProps {
  selectedUniverse: string;
  selectedCharacter: string;
  onUniverseChange: (universe: string) => void;
  onCharacterChange: (character: string) => void;
  onSendMessage: (message: string) => void;
}

export function ChatInput({
  selectedUniverse,
  selectedCharacter,
  onUniverseChange,
  onCharacterChange,
  onSendMessage,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isUniverseOpen, setIsUniverseOpen] = useState(false);
  const [isCharacterOpen, setIsCharacterOpen] = useState(false);
  const [universeSearch, setUniverseSearch] = useState("");
  const [characterSearch, setCharacterSearch] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredUniverses = UNIVERSES.filter((u) =>
    u.name.toLowerCase().includes(universeSearch.toLowerCase())
  );

  const filteredCharacters = CHARACTERS.filter(
    (c) =>
      c.universe === selectedUniverse &&
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
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div
          className={cn(
            "relative rounded-2xl bg-background/95 backdrop-blur-sm",
            "border border-accent/70",
            "shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
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
              open={isUniverseOpen}
              onOpenChange={(o) => {
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
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full",
                    "px-2.5 py-1 text-xs md:text-sm font-medium",
                    "bg-secondary hover:bg-secondary/90 transition-colors",
                    "shadow-sm shadow-black/30 focus-visible:outline-none focus-visible:ring-0"
                  )}
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
              >
                <div className="p-4 border-b border-border/70 bg-[oklch(0.11_0_0)]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search universes..."
                      value={universeSearch}
                      onChange={(e) => setUniverseSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[oklch(0.08_0_0)] rounded-lg text-sm focus:outline-none text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/20"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto px-2 py-2 bg-[oklch(0.11_0_0)]">
                  {filteredUniverses.map((universe) => (
                    <button
                      key={universe.id}
                      onClick={() => {
                        onUniverseChange(universe.name);
                        setIsUniverseOpen(false);
                        setUniverseSearch("");
                        textareaRef.current?.focus();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm",
                        "transition-colors duration-200",
                        selectedUniverse === universe.name
                          ? "!bg-[oklch(0.20_0_0)]"
                          : "!bg-transparent hover:!bg-[oklch(0.15_0_0)]"
                      )}
                    >
                      <span className="text-2xl">{universe.icon}</span>
                      <span className="font-medium text-foreground">
                        {universe.name}
                      </span>
                    </button>
                  ))}
                </div>
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
                    "shadow-sm shadow-black/30 focus-visible:outline-none focus-visible:ring-0"
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
              >
                <div className="p-4 border-b border-border/70 bg-[oklch(0.11_0_0)]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search characters..."
                      value={characterSearch}
                      onChange={(e) => setCharacterSearch(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-[oklch(0.08_0_0)] rounded-lg text-sm focus:outline-none text-foreground placeholder:text-muted-foreground shadow-inner shadow-black/20"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto px-2 py-2 bg-[oklch(0.11_0_0)]">
                  {filteredCharacters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => {
                        onCharacterChange(character.name);
                        setIsCharacterOpen(false);
                        setCharacterSearch("");
                        textareaRef.current?.focus();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm",
                        "transition-colors duration-200",
                        selectedCharacter === character.name
                          ? "!bg-[oklch(0.20_0_0)]"
                          : "!bg-transparent hover:!bg-[oklch(0.15_0_0)]"
                      )}
                    >
                      <span className="text-2xl">{character.avatar}</span>
                      <span className="font-medium text-foreground">
                        {character.name}
                      </span>
                    </button>
                  ))}
                </div>
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
