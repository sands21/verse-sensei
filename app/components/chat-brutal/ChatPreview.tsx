"use client";

import * as React from "react";
import { PanelLeft, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { popSfxAt } from "../brutal/sfx";
import { Sidebar, type SidebarTone, type Convo } from "./Sidebar";
import { Thread, type ChatMsg } from "./Thread";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { FEATURED, type CastChar, charsInUniverse } from "./cast";
import { replyFor } from "./replies";
import { SearchModal, ProfileModal } from "./Modals";

const USER_NAME = "Rajarshi";

// Neo-brutalist chat PREVIEW (paper canvas). Static/scripted, no backend, no auth.
// Mounted at /preview/chat; the real dark /chat is untouched. See CLAUDE.md §5.
//
// Built section by section (CLAUDE.md §5 build plan):
//   1. Shell + route          ✅
//   2. Sidebar                ✅
//   3. Thread + composer      — scaffold below
//   4. Empty state            — scaffold below
//   5. Semi-interactive demo
//   6. Modals + mobile polish

const CONVERSATIONS: Convo[] = [
  { id: "c1", title: "How do I push past my limits?", bucket: "today" },
  { id: "c2", title: "Explain entropy like a fight", bucket: "today" },
  { id: "c3", title: "What does freedom really mean?", bucket: "today" },
  { id: "c4", title: "Break down compound interest", bucket: "last30" },
  { id: "c5", title: "Talk me out of giving up", bucket: "last30" },
  { id: "c6", title: "Best ramen order, honestly?", bucket: "last30" },
];

const at = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

// Seed conversation (Step 3a) — exercises the bubble/avatar/markdown rendering.
// The real semi-interactive demo (canned reply pools) is Step 5.
const SAMPLE_THREAD: ChatMsg[] = [
  {
    id: "m1",
    role: "user",
    content: "Explain quantum computing like chakra control",
    ts: at(14, 30),
  },
  {
    id: "m2",
    role: "character",
    content:
      "*scratches head* Okay, listen up! Think of **quantum superposition** like shadow clones:\n- each clone is a possible state\n- they all exist at once\n- the moment you *look*, only one stays\n\nIt's basically `kage bunshin` for particles, dattebayo!",
    ts: at(14, 31),
  },
  {
    id: "m3",
    role: "user",
    content: "that actually makes sense lol",
    ts: at(14, 32),
  },
  {
    id: "m4",
    role: "character",
    content:
      "Right?! *grins* Believe it — the hardest ideas just need the right jutsu to click.",
    ts: at(14, 32),
  },
];

// Square ink icon button (over paper) — hard shadow lift/press, sharp corners.
function IconBtn({
  label,
  onClick,
  variant = "default",
  className,
  children,
}: {
  label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "default" | "red";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-none border-[2.5px] border-ink",
        "[box-shadow:var(--shadow-sm)] hover:[box-shadow:var(--shadow)] active:[box-shadow:2px_2px_0_var(--ink)]",
        "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5",
        variant === "red" ? "bg-red text-white" : "bg-paper-raised text-ink",
        className
      )}
    >
      {children}
    </button>
  );
}

export default function ChatPreview() {
  // Sidebar surface tone — flip to "paper" to A/B the white-on-cream variant.
  const tone: SidebarTone = "ink";

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [conversations, setConversations] =
    React.useState<Convo[]>(CONVERSATIONS);
  const [activeId, setActiveId] = React.useState<string | null>("c1");
  const [messages, setMessages] = React.useState<ChatMsg[]>(SAMPLE_THREAD);
  const [isTyping, setIsTyping] = React.useState(false);
  const [character, setCharacter] = React.useState<CastChar>(FEATURED);
  const [draft, setDraft] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  // ⌘K / Ctrl+K opens search.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(
    () => () => timers.current.forEach(clearTimeout),
    []
  );

  const isUniverseLocked = messages.length > 0;

  // Open by default on lg+, closed on mobile.
  React.useEffect(() => {
    const update = () => setIsSidebarOpen(window.innerWidth >= 1024);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const closeOnMobile = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };
  const handleSelect = (id: string) => {
    setActiveId(id);
    setMessages(SAMPLE_THREAD);
    closeOnMobile();
  };
  const handleNewChat = () => {
    setActiveId(null);
    setMessages([]);
    closeOnMobile();
  };
  const handleArchive = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  };

  const handleSelectCharacter = (c: CastChar) => setCharacter(c);
  const handleSelectUniverse = (u: string) => {
    const first = charsInUniverse(u)[0];
    if (first) setCharacter(first);
  };

  // Stream a canned reply into a character bubble, token by token (Step 3b: a
  // single placeholder line; Step 5 swaps in the prompt-tailored / sampled pools).
  const streamReply = (full: string) => {
    const id = `ai-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id, role: "character", content: "", ts: new Date(), streaming: true },
    ]);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: full, streaming: false } : m))
      );
      return;
    }
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: full.slice(0, i) } : m))
      );
      if (i >= full.length) {
        clearInterval(iv);
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, streaming: false } : m))
        );
      }
    }, 18);
  };

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text, ts: new Date() },
    ]);
    setIsTyping(true);
    const reply = replyFor(character.name, text);
    const t = setTimeout(() => {
      setIsTyping(false);
      streamReply(reply);
    }, 600 + Math.random() * 300); // 600–900ms of dots first
    timers.current.push(t);
  };

  const handleSendPrompt = (text: string, e: React.MouseEvent) => {
    popSfxAt("send", e);
    handleSend(text);
  };

  return (
    <div className="paper-canvas flex h-[100dvh] min-h-0 overflow-hidden">
      {/* Mobile backdrop (solid ink, no blur) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/60 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar
        tone={tone}
        isOpen={isSidebarOpen}
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
        onArchive={handleArchive}
        onProfile={() => setProfileOpen(true)}
      />

      {/* Main: header · thread · composer */}
      <main className="flex min-w-0 flex-1 flex-col bg-paper">
        {/* Top bar: controls (docked) · divider · character identity. When the
            rail is collapsed, Search + New Chat appear here so they stay reachable. */}
        <header className="flex flex-shrink-0 items-center gap-2.5 border-b-[2.5px] border-ink bg-paper-raised px-3 py-2.5">
          <IconBtn
            label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            onClick={() => setIsSidebarOpen((o) => !o)}
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </IconBtn>

          {!isSidebarOpen && (
            <>
              {/* Search — opens the ⌘K modal (desktop) */}
              <IconBtn
                label="Search"
                onClick={() => setSearchOpen(true)}
                className="hidden lg:inline-flex"
              >
                <Search className="h-[18px] w-[18px]" />
              </IconBtn>
              <IconBtn
                label="New chat"
                variant="red"
                onClick={(e) => {
                  popSfxAt("go", e);
                  handleNewChat();
                }}
              >
                <Plus className="h-[18px] w-[18px]" />
              </IconBtn>
            </>
          )}

          {/* Divider between controls and character identity */}
          <span aria-hidden className="mx-0.5 h-7 w-[2.5px] flex-shrink-0 bg-ink" />

          {/* Character identity */}
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[2.5px] border-ink bg-paper font-clash text-base font-bold text-ink"
            style={{ boxShadow: "var(--shadow-sm)" }}
            aria-hidden
          >
            {character.avatar}
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate font-clash text-base font-bold uppercase tracking-[-0.02em] text-ink">
              {character.name}
            </div>
            <div className="font-label text-[9px] uppercase tracking-[0.15em] text-ink-muted">
              {character.universe}
            </div>
          </div>
        </header>

        {/* Thread / empty state */}
        <div className="halftone min-h-0 flex-1 overflow-y-auto px-4 py-5">
          {messages.length > 0 ? (
            <Thread
              messages={messages}
              isTyping={isTyping}
              character={{ name: character.name, avatar: character.avatar }}
              userAvatar="R"
            />
          ) : (
            <EmptyState
              character={character}
              userName={USER_NAME}
              dimmed={draft}
              onSendPrompt={handleSendPrompt}
            />
          )}
        </div>

        {/* Composer */}
        <Composer
          universe={character.universe}
          character={character}
          isUniverseLocked={isUniverseLocked}
          isCharacterLocked={isUniverseLocked}
          onSelectCharacter={handleSelectCharacter}
          onSelectUniverse={handleSelectUniverse}
          onSend={handleSend}
          onDraftChange={setDraft}
        />
      </main>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        conversations={conversations}
        onSelect={handleSelect}
        onNewChat={handleNewChat}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        name={USER_NAME}
        email="rajarshi@versesensei.app"
        avatar="R"
      />
    </div>
  );
}
