"use client";

import * as React from "react";
import { Globe, ChevronDown, ChevronUp, Lock, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { popSfxAt } from "../brutal/sfx";
import { UNIVERSES, charsInUniverse, type CastChar } from "./cast";

// Neo-brutalist composer (preview). Sharp paper-raised panel, 3px ink top border,
// hard shadow — no blur/round/accent. Universe chip (Space Mono tag) + character
// chip (avatar folded in, Clash name); popovers open upward and mirror the cast
// cards. Red Send (WHOOSH), DON on character-select, persona placeholder,
// locked-universe state. See CLAUDE.md §5 (Composer).

interface ComposerProps {
  universe: string;
  character: CastChar;
  isUniverseLocked: boolean;
  onSelectCharacter: (c: CastChar) => void;
  onSelectUniverse: (universe: string) => void;
  onSend: (text: string) => void;
}

const CHIP_LIFT =
  "[box-shadow:var(--shadow-sm)] hover:[box-shadow:var(--shadow)] active:[box-shadow:2px_2px_0_var(--ink)] " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-[transform,box-shadow] duration-100 ease-out";

export function Composer({
  universe,
  character,
  isUniverseLocked,
  onSelectCharacter,
  onSelectUniverse,
  onSend,
}: ComposerProps) {
  const [text, setText] = React.useState("");
  const [universeOpen, setUniverseOpen] = React.useState(false);
  const [charOpen, setCharOpen] = React.useState(false);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea.
  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  const submit = (e?: React.MouseEvent) => {
    const t = text.trim();
    if (!t) return;
    if (e) popSfxAt("send", e);
    onSend(t);
    setText("");
    if (taRef.current) taRef.current.style.height = "auto";
  };

  const chars = charsInUniverse(universe);

  return (
    <div className="relative flex-shrink-0 border-t-[3px] border-ink bg-paper-raised px-3 pb-3 pt-3 md:px-4">
      {/* Click-away catcher for popovers */}
      {(universeOpen || charOpen) && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden
          onClick={() => {
            setUniverseOpen(false);
            setCharOpen(false);
          }}
        />
      )}

      <div className="mx-auto max-w-3xl">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder={`Message ${character.name}…`}
          aria-label={`Message ${character.name}`}
          className="w-full resize-none overflow-y-auto bg-transparent font-body text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-muted"
        />

        {/* Control row: pickers (left) · send (right) */}
        <div className="mt-2 flex items-end justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {/* Universe chip */}
            <div className="relative">
              <button
                disabled={isUniverseLocked}
                aria-haspopup="listbox"
                aria-expanded={universeOpen}
                title={
                  isUniverseLocked
                    ? "Start a new chat to change universe"
                    : undefined
                }
                onClick={() => {
                  if (isUniverseLocked) return;
                  setUniverseOpen((o) => !o);
                  setCharOpen(false);
                }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-none border-[2.5px] px-2.5 py-2 font-label text-[10px] uppercase tracking-[0.1em]",
                  isUniverseLocked
                    ? "cursor-not-allowed border-ink/40 bg-paper text-ink-muted"
                    : cn("cursor-pointer border-ink bg-paper-raised text-ink", CHIP_LIFT)
                )}
              >
                <Globe className="h-3.5 w-3.5" />
                {universe}
                {isUniverseLocked ? (
                  <Lock className="h-3 w-3" />
                ) : universeOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {universeOpen && !isUniverseLocked && (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-[240px] rounded-none border-[2.5px] border-ink bg-paper-raised [box-shadow:var(--shadow)]">
                  <div className="border-b-[2.5px] border-ink px-3 py-2 font-label text-[9px] uppercase tracking-[0.15em] text-ink-muted">
                    Worlds
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {UNIVERSES.map((u) => {
                      const selected = u === universe;
                      return (
                        <button
                          key={u}
                          onClick={() => {
                            onSelectUniverse(u);
                            setUniverseOpen(false);
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center px-3 py-2.5 pl-4 text-left text-[13px] hover:[background:var(--ghost)]",
                            selected && "font-medium [background:var(--ghost)]"
                          )}
                        >
                          {selected && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-0 bottom-0 w-1 bg-red"
                            />
                          )}
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Character chip (avatar folded in) */}
            <div className="relative">
              <button
                aria-haspopup="listbox"
                aria-expanded={charOpen}
                onClick={() => {
                  setCharOpen((o) => !o);
                  setUniverseOpen(false);
                }}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-none border-[2.5px] border-ink bg-paper-raised py-1.5 pl-1.5 pr-2.5 text-ink",
                  CHIP_LIFT
                )}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center border-[2px] border-ink bg-paper font-clash text-[11px] font-bold"
                  aria-hidden
                >
                  {character.avatar}
                </span>
                <span className="font-clash text-[13px] font-bold uppercase tracking-[-0.01em]">
                  {character.name}
                </span>
                {charOpen ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {charOpen && (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-[280px] rounded-none border-[2.5px] border-ink bg-paper-raised [box-shadow:var(--shadow)]">
                  <div className="border-b-[2.5px] border-ink px-3 py-2 font-label text-[9px] uppercase tracking-[0.15em] text-ink-muted">
                    Pick your sensei
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {chars.map((c) => {
                      const selected = c.name === character.name;
                      return (
                        <button
                          key={c.name}
                          onClick={(e) => {
                            onSelectCharacter(c);
                            popSfxAt("impact", e);
                            setCharOpen(false);
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center gap-2.5 px-3 py-2.5 pl-4 text-left hover:[background:var(--ghost)]",
                            selected && "[background:var(--ghost)]"
                          )}
                        >
                          {selected && (
                            <span
                              aria-hidden
                              className="absolute left-0 top-0 bottom-0 w-1 bg-red"
                            />
                          )}
                          <span
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-[2.5px] border-ink bg-paper font-clash text-base font-bold text-ink"
                            style={{ boxShadow: "var(--shadow-sm)" }}
                            aria-hidden
                          >
                            {c.avatar}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-clash text-[15px] font-bold uppercase leading-none tracking-[-0.01em] text-ink">
                              {c.name}
                            </span>
                            <span className="mt-1 block font-label text-[9px] uppercase tracking-[0.1em] text-ink-muted">
                              {c.universe} · {c.trait}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send */}
          <button
            onClick={(e) => submit(e)}
            disabled={!text.trim()}
            aria-label="Send message"
            className={cn(
              "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-none border-[2.5px] border-ink bg-red text-white",
              CHIP_LIFT,
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:[box-shadow:var(--shadow-sm)]"
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Composer;
