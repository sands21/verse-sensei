"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../brutal/Button";
import { Modal } from "./Modal";
import type { Convo } from "./Sidebar";

// ⌘K search + profile modal contents. Flat rows reuse the sidebar/picker
// treatment; sign out is secondary (red stays meaningful). See CLAUDE.md §5.

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  conversations: Convo[];
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

export function SearchModal({
  open,
  onClose,
  conversations,
  onSelect,
  onNewChat,
}: SearchModalProps) {
  const [q, setQ] = React.useState("");

  // Reset the query each time the modal opens.
  React.useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Modal open={open} onClose={onClose} align="top" className="max-w-xl" ariaLabel="Search chats">
      {/* Search input row (extra right padding clears the corner ✕ button) */}
      <div className="flex items-center gap-3 border-b-[2.5px] border-ink py-3 pl-4 pr-12">
        <Search className="h-[18px] w-[18px] flex-shrink-0 text-ink-muted" aria-hidden />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !q.trim()) {
              onNewChat();
              onClose();
            }
          }}
          aria-label="Search conversations"
          className="w-full bg-transparent font-body text-[15px] text-ink outline-none placeholder:font-label placeholder:text-[11px] placeholder:uppercase placeholder:tracking-[0.12em] placeholder:text-ink-muted"
          placeholder="Search or enter for new chat"
        />
        <span className="flex-shrink-0 rounded-none border-[2px] border-ink px-1.5 py-0.5 font-label text-[9px] tracking-[0.1em] text-ink">
          ⌘K
        </span>
      </div>

      {/* Results */}
      <div className="max-h-[55vh] overflow-y-auto p-2">
        <div className="px-2 pb-1.5 pt-1 font-label text-[9px] uppercase tracking-[0.15em] text-ink-muted">
          Recent chats
        </div>
        {filtered.length === 0 ? (
          <div className="px-2 py-8 text-center font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            No conversations found
          </div>
        ) : (
          filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                onSelect(c.id);
                onClose();
              }}
              className="relative flex w-full cursor-pointer items-center rounded-none py-2.5 pl-3 pr-3 text-left text-[13.5px] text-ink hover:bg-ghost"
            >
              {c.title}
            </button>
          ))
        )}
      </div>
    </Modal>
  );
}

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  email: string;
  avatar: string;
}

export function ProfileModal({
  open,
  onClose,
  name,
  email,
  avatar,
}: ProfileModalProps) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-sm" ariaLabel="Profile">
      <div className="flex items-center gap-3.5 p-5">
        <span
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-none border-[2.5px] border-ink bg-red font-clash text-2xl font-bold text-white"
          style={{ boxShadow: "var(--shadow-sm)" }}
          aria-hidden
        >
          {avatar}
        </span>
        <div className="min-w-0">
          <div className="truncate font-clash text-xl font-bold uppercase tracking-[-0.02em] text-ink">
            {name}
          </div>
          <div className="truncate font-body text-[13px] text-ink-muted">
            {email}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-5 pb-5">
        <span className="rounded-none bg-ink px-2 py-1 font-label text-[9px] uppercase tracking-[0.12em] text-paper">
          Free plan
        </span>
        <Button
          variant="secondary"
          size="md"
          onClick={onClose}
          className={cn("text-[12px]")}
        >
          Sign out
        </Button>
      </div>
    </Modal>
  );
}
