"use client";

import * as React from "react";
import { Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bubble } from "../brutal/Bubble";
import { popSfxAt } from "../brutal/sfx";
import { personaFor, sample, MODES, type Mode } from "./persona";
import type { CastChar } from "./cast";

// Persona-forward empty state ("your hero is already here"). Sequence on
// character-select: identity snaps in → in-voice greeting auto-types → VN-style
// dialogue-choice prompts reveal. EXPLAIN/HYPE ME/JUST TALK modes swap the set;
// shuffle re-rolls (DON SFX). Prompts dim while the user types. See CLAUDE.md §5.

interface EmptyStateProps {
  character: CastChar;
  userName: string;
  dimmed: boolean; // composer has a draft → recede the prompts
  onSendPrompt: (text: string, e: React.MouseEvent) => void;
}

// Inline render: split on '*' so *actions* go red (and half-typed too).
function inline(text: string): React.ReactNode[] {
  return text.split("*").map((seg, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-medium italic text-red">
        {seg}
      </em>
    ) : (
      <React.Fragment key={i}>{seg}</React.Fragment>
    )
  );
}

export function EmptyState({
  character,
  userName,
  dimmed,
  onSendPrompt,
}: EmptyStateProps) {
  const persona = personaFor(character.name);
  const [mode, setMode] = React.useState<Mode>("EXPLAIN");
  const [greeting, setGreeting] = React.useState("");
  const [typed, setTyped] = React.useState("");
  const [revealed, setRevealed] = React.useState(false);
  const [prompts, setPrompts] = React.useState<string[]>([]);

  const drawPrompts = React.useCallback(
    (m: Mode) => setPrompts(sample(persona.prompts[m], 3)),
    [persona]
  );

  // (Re)start the sequence whenever the character changes.
  React.useEffect(() => {
    const g = sample(persona.greetings, 1)[0].replace(/\{user\}/g, userName || "friend");
    setGreeting(g);
    setRevealed(false);
    setMode("EXPLAIN");

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTyped(g);
      setRevealed(true);
      drawPrompts("EXPLAIN");
      return;
    }

    setTyped("");
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setTyped(g.slice(0, i));
      if (i >= g.length) {
        clearInterval(iv);
        setRevealed(true);
        drawPrompts("EXPLAIN");
      }
    }, 24);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.name]);

  const selectMode = (m: Mode) => {
    setMode(m);
    drawPrompts(m);
  };

  const done = typed.length >= greeting.length;

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-1 py-4">
      {/* Identity */}
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-20 w-20">
          <span
            aria-hidden
            className="absolute -inset-5"
            style={{
              background:
                "repeating-conic-gradient(from 0deg at 50% 50%, var(--ink) 0deg 1.4deg, transparent 1.4deg 11deg)",
              opacity: 0.1,
              WebkitMaskImage:
                "radial-gradient(circle, #000 30%, transparent 72%)",
              maskImage: "radial-gradient(circle, #000 30%, transparent 72%)",
            }}
          />
          <div
            className="relative flex h-20 w-20 items-center justify-center border-[3px] border-ink bg-paper-raised font-clash text-4xl font-bold text-ink"
            style={{ boxShadow: "var(--shadow-lift)" }}
            aria-hidden
          >
            {character.avatar}
          </div>
        </div>
        <div className="font-clash text-3xl font-bold uppercase leading-none tracking-[-0.02em] text-ink md:text-4xl">
          {character.name}
        </div>
        <div className="mt-2 font-label text-[11px] uppercase tracking-[0.18em] text-ink-muted">
          {character.universe} · {character.trait}
        </div>
      </div>

      {/* Greeting bubble (avatar + bubble set) */}
      <div className="mt-6 flex items-start gap-5">
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center border-[2.5px] border-ink bg-paper font-clash text-sm font-bold text-ink"
          style={{ boxShadow: "var(--shadow-sm)" }}
          aria-hidden
        >
          {character.avatar}
        </div>
        <Bubble side="left" className="max-w-[88%]">
          <span className="whitespace-pre-wrap">
            {inline(typed)}
            {!done && (
              <span className="ml-0.5 inline-block animate-pulse align-[-2px] text-ink">
                ▍
              </span>
            )}
          </span>
        </Bubble>
      </div>

      {/* Modes · prompts · shuffle — revealed after the greeting types out, and
          dimmed while the user is drafting in the composer. */}
      {revealed && (
        <div
          className={cn(
            "mt-6 transition-[opacity,transform] duration-200",
            dimmed
              ? "pointer-events-none translate-y-1 opacity-30"
              : "opacity-100"
          )}
        >
          {/* Mode tags */}
          <div className="flex flex-wrap justify-end gap-2">
            {MODES.map((m) => {
              const on = m === mode;
              return (
                <button
                  key={m}
                  onClick={() => selectMode(m)}
                  className={cn(
                    "cursor-pointer rounded-none border-[2.5px] border-ink px-3 py-1.5 font-label text-[10px] uppercase tracking-[0.12em]",
                    "[box-shadow:2px_2px_0_var(--ink)] hover:[box-shadow:3px_3px_0_var(--ink)] active:[box-shadow:1px_1px_0_var(--ink)]",
                    "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5",
                    on ? "bg-red text-white" : "bg-paper-raised text-ink"
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>

          {/* VN-style dialogue-choice prompts (your reply side) */}
          <div className="mt-3 flex flex-col items-end gap-2.5">
            {prompts.map((p, i) => (
              <button
                key={`${mode}-${p}`}
                onClick={(e) => onSendPrompt(p, e)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={cn(
                  "max-w-[88%] cursor-pointer rounded-none border-[2.5px] border-ink bg-paper-raised px-3.5 py-2.5 text-left text-[13.5px] text-ink",
                  "[box-shadow:3px_3px_0_var(--ink)] hover:[box-shadow:5px_5px_0_var(--ink)] active:[box-shadow:1px_1px_0_var(--ink)]",
                  "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5",
                  "duration-200 animate-in fade-in slide-in-from-bottom-2"
                )}
              >
                <span className="mr-2 font-label text-[11px] text-red">▸</span>
                {p}
              </button>
            ))}
          </div>

          {/* Shuffle / re-roll */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={(e) => {
                drawPrompts(mode);
                popSfxAt("impact", e);
              }}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-none border-[2.5px] border-ink bg-ink px-3 py-1.5 font-label text-[10px] uppercase tracking-[0.14em] text-paper",
                "[box-shadow:3px_3px_0_var(--red)] hover:[box-shadow:5px_5px_0_var(--red)] active:[box-shadow:1px_1px_0_var(--red)]",
                "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
              )}
            >
              <Dices className="h-3.5 w-3.5" /> Re-roll
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
