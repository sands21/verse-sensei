"use client";

import * as React from "react";
import { Search, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { popSfxAt } from "../brutal/sfx";

// Neo-brutalist chat sidebar (preview). The rail itself: wordmark, red New Chat,
// search, Today/Last-30 sections, flat rows + red active-bar, user card. The
// toggle + collapsed Search/New Chat controls live in the main header (see
// ChatPreview), so the rail and header read as one clean top bar. On mobile the
// rail is a fixed slide-over over a solid-ink backdrop. Tone-swappable via
// TONE_VARS (ink for now / white fallback). See CLAUDE.md §5.

export type SidebarTone = "ink" | "paper";

// Sidebar surface tone — CSS custom props so ink↔white is a one-line flip.
// On ink, ink borders/shadows go invisible, so raised elements invert to cream.
export const TONE_VARS: Record<SidebarTone, React.CSSProperties> = {
  ink: {
    ["--sb-bg" as string]: "var(--ink)",
    ["--sb-text" as string]: "var(--paper)",
    ["--sb-muted" as string]: "#9b958a",
    ["--sb-line" as string]: "#45433d",
    ["--sb-raise-bd" as string]: "var(--paper)",
    ["--sb-raise-sh" as string]: "var(--paper)",
    ["--sb-row-hover" as string]: "#262624",
    ["--sb-active" as string]: "#2b2b29",
  },
  paper: {
    ["--sb-bg" as string]: "var(--paper-raised)",
    ["--sb-text" as string]: "var(--ink)",
    ["--sb-muted" as string]: "var(--ink-muted)",
    ["--sb-line" as string]: "var(--ink)",
    ["--sb-raise-bd" as string]: "var(--ink)",
    ["--sb-raise-sh" as string]: "var(--ink)",
    ["--sb-row-hover" as string]: "var(--ghost)",
    ["--sb-active" as string]: "var(--ink)",
  },
};

export interface Convo {
  id: string;
  title: string;
  bucket: "today" | "last30";
}

interface SidebarProps {
  tone: SidebarTone;
  isOpen: boolean;
  conversations: Convo[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  onArchive: (id: string) => void;
}

// Raised element inside the rail — border + shadow follow the tone (cream on ink).
const SB_RAISE =
  "rounded-none border-[2.5px] [border-color:var(--sb-raise-bd)] " +
  "[box-shadow:3px_3px_0_var(--sb-raise-sh)] hover:[box-shadow:5px_5px_0_var(--sb-raise-sh)] active:[box-shadow:1px_1px_0_var(--sb-raise-sh)] " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100 ease-out";

export function Sidebar({
  tone,
  isOpen,
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onArchive,
}: SidebarProps) {
  const [query, setQuery] = React.useState("");

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );
  const today = filtered.filter((c) => c.bucket === "today");
  const last30 = filtered.filter((c) => c.bucket === "last30");

  const Row = ({ c }: { c: Convo }) => {
    const active = c.id === activeId;
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(c.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(c.id);
          }
        }}
        className={cn(
          "group/row relative flex cursor-pointer items-center rounded-none py-2 pl-3 pr-8 text-[12.5px] outline-none",
          "hover:[background:var(--sb-row-hover)]",
          active && "font-medium"
        )}
        style={active ? { background: "var(--sb-active)" } : undefined}
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-0 top-0 bottom-0 w-1 bg-red"
          />
        )}
        <span className="truncate whitespace-nowrap">{c.title}</span>
        <button
          aria-label="Archive conversation"
          onClick={(e) => {
            e.stopPropagation();
            onArchive(c.id);
          }}
          style={{ color: "var(--sb-text)" }}
          className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-none bg-transparent opacity-0 transition-opacity hover:[background:var(--sb-line)] group-hover/row:opacity-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  return (
    <aside
      style={TONE_VARS[tone]}
      className={cn(
        "fixed left-0 top-0 z-40 h-full flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out lg:relative",
        isOpen ? "w-[260px] border-r-[3px] border-ink" : "w-0 border-r-0"
      )}
    >
      <div
        className={cn(
          "flex h-full w-[260px] flex-col p-3 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{ background: "var(--sb-bg)", color: "var(--sb-text)" }}
      >
        {/* Wordmark */}
        <span className="mb-4 px-1 font-clash text-lg font-bold uppercase tracking-[-0.02em]">
          Verse Sensei<span className="text-red">.</span>
        </span>

        {/* New Chat */}
        <button
          onClick={(e) => {
            popSfxAt("go", e);
            onNewChat();
          }}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-2 bg-red px-4 py-2.5 font-body text-[13px] font-bold uppercase tracking-wide text-white",
            SB_RAISE
          )}
        >
          <Plus className="h-4 w-4" /> New Chat
        </button>

        {/* Search */}
        <div className="relative mt-4">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--sb-muted)" }}
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH CONVOS"
            aria-label="Search conversations"
            className="w-full rounded-none border-[2px] bg-transparent py-2 pl-8 pr-2 font-label text-[10px] uppercase tracking-[0.12em] outline-none placeholder:opacity-70"
            style={{ borderColor: "var(--sb-line)", color: "var(--sb-text)" }}
          />
        </div>

        {/* Conversation list */}
        <div className="-mx-1 mt-4 flex-1 overflow-y-auto px-1">
          {today.length > 0 && (
            <div className="mb-4">
              <div
                className="mb-1.5 border-b-2 px-1 pb-1.5 font-label text-[10px] uppercase tracking-[0.18em]"
                style={{ borderColor: "var(--sb-line)", color: "var(--sb-muted)" }}
              >
                Today
              </div>
              {today.map((c) => (
                <Row key={c.id} c={c} />
              ))}
            </div>
          )}
          {last30.length > 0 && (
            <div className="mb-4">
              <div
                className="mb-1.5 border-b-2 px-1 pb-1.5 font-label text-[10px] uppercase tracking-[0.18em]"
                style={{ borderColor: "var(--sb-line)", color: "var(--sb-muted)" }}
              >
                Last 30 Days
              </div>
              {last30.map((c) => (
                <Row key={c.id} c={c} />
              ))}
            </div>
          )}
          {filtered.length === 0 && (
            <div
              className="px-2 py-6 text-center font-label text-[10px] uppercase tracking-[0.12em]"
              style={{ color: "var(--sb-muted)" }}
            >
              No conversations found
            </div>
          )}
        </div>

        {/* User card */}
        <button
          title="Profile"
          aria-label="Profile"
          style={{ color: "var(--sb-text)" }}
          className={cn(
            "mt-2 flex w-full cursor-pointer items-center gap-3 bg-transparent px-3 py-2.5 text-left",
            SB_RAISE
          )}
        >
          <span
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-none border-[2px] bg-red font-clash text-xs font-bold text-white"
            style={{ borderColor: "var(--sb-raise-bd)" }}
            aria-hidden
          >
            R
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium">
              Rajarshi
            </span>
            <span
              className="block font-label text-[9px] uppercase tracking-[0.1em]"
              style={{ color: "var(--sb-muted)" }}
            >
              Free plan
            </span>
          </span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
