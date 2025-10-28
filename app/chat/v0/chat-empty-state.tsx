"use client";

import { useState } from "react";
import { Sparkles, FileText, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatEmptyStateProps {
  userName?: string;
  characterName?: string;
  onPromptClick: (prompt: string) => void;
}

type CategoryType = "Learn" | "Explore" | "Feed Your Curiosity" | null;

const categories = [
  { icon: GraduationCap, label: "Learn" as const, color: "text-orange-400" },
  { icon: FileText, label: "Explore" as const, color: "text-blue-400" },
  {
    icon: Sparkles,
    label: "Feed Your Curiosity" as const,
    color: "text-purple-400",
  },
];

const promptsByCategory: Record<string, string[]> = {
  default: [
    "What's the best way to learn a new skill quickly?",
    "Explain quantum computing in simple terms",
    "What are some productivity tips that actually work?",
    "What is the meaning of life?",
  ],
  Learn: [
    "Explain quantum physics in simple terms",
    "How do neural networks learn?",
    "What is the theory of relativity?",
    "Teach me about ancient civilizations",
  ],
  Explore: [
    "What are the deepest parts of the ocean?",
    "Tell me about unexplored territories on Earth",
    "What mysteries remain unsolved in space?",
    "Describe the most remote places on our planet",
  ],
  "Feed Your Curiosity": [
    "Why do we dream?",
    "What would happen if the moon disappeared?",
    "How do birds navigate during migration?",
    "What is the origin of consciousness?",
  ],
};

export function ChatEmptyState({
  userName,
  onPromptClick,
}: ChatEmptyStateProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

  const handleCategoryClick = (categoryLabel: CategoryType) => {
    // Toggle: if already selected, deselect; otherwise select
    setSelectedCategory((prev) =>
      prev === categoryLabel ? null : categoryLabel
    );
  };

  const currentPrompts = selectedCategory
    ? promptsByCategory[selectedCategory]
    : promptsByCategory.default;

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Greeting */}
        <h1 className="text-3xl font-semibold text-left text-foreground pl-1 mt-10 pb-1 font-display">
          How can I help you{userName ? `, ${userName}` : ""}?
        </h1>

        {/* Category Buttons */}
        <div className="flex items-center justify-start gap-3 flex-wrap pl-1 mb-5">
          {categories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.label;
            return (
              <button
                key={category.label}
                onClick={() => handleCategoryClick(category.label)}
                className={cn(
                  "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl",
                  "outline-none cursor-pointer",
                  "transition-all duration-200",
                  "text-sm font-medium",
                  "focus-visible:outline-2 focus-visible:outline-border/70",
                  isSelected
                    ? "!bg-[oklch(0.26_0_0)] text-foreground"
                    : "!bg-background/95 text-muted-foreground hover:!bg-[oklch(0.22_0_0)] hover:text-foreground active:!bg-[oklch(0.24_0_0)]"
                )}
              >
                <Icon className={cn("h-4 w-4", category.color)} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Sample Prompts */}
        <div className="space-y-0.5 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory || "default"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-0.5"
            >
              {currentPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onPromptClick(prompt)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg",
                    "!bg-transparent outline-none cursor-pointer",
                    "hover:!bg-[oklch(0.22_0_0)] hover:outline-1 hover:outline-border/70",
                    "active:!bg-[oklch(0.26_0_0)] active:scale-[0.99]",
                    "transition-all duration-200",
                    "text-sm text-foreground/90 hover:text-foreground",
                    "focus-visible:outline-2 focus-visible:outline-border/70"
                  )}
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
