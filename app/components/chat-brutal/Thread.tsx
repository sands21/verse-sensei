"use client";

import * as React from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Bubble } from "../brutal/Bubble";
import { Markdown } from "./Markdown";

// Neo-brutalist message thread (preview). Bubbles + avatars-beside-dialogue
// (grouped: avatar on first of a run, timestamp on last), red-italic-action
// markdown, ink-square typing indicator, copy-on-hover, red error + RETRY.
// See CLAUDE.md §5 (Message thread).

export interface ChatMsg {
  id: string;
  role: "user" | "character";
  content: string;
  ts: Date;
  /** Mid-stream token cursor (the ▍) — true while this reply is still typing. */
  streaming?: boolean;
  error?: boolean;
}

interface ThreadProps {
  messages: ChatMsg[];
  isTyping: boolean;
  character: { name: string; avatar: string };
  userAvatar: string;
  onRetry?: (id: string) => void;
}

// While streaming, render inline (split on '*' so even a half-typed *action*
// shows red immediately, like the Hero) with the caret inline. Full block
// Markdown takes over once the reply finishes.
function renderStreaming(text: string): React.ReactNode[] {
  return text.split("\n").map((line, li) => (
    <React.Fragment key={li}>
      {li > 0 && <br />}
      {line.split("*").map((seg, i) =>
        i % 2 === 1 ? (
          <em key={i} className="font-medium italic text-red">
            {seg}
          </em>
        ) : (
          <React.Fragment key={i}>{seg}</React.Fragment>
        )
      )}
    </React.Fragment>
  ));
}

const fmtTime = (d: Date) =>
  d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

function Avatar({
  kind,
  label,
}: {
  kind: "user" | "character";
  label: string;
}) {
  const user = kind === "user";
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-none border-[2.5px] border-ink font-clash text-sm font-bold",
        user ? "bg-ink text-paper" : "bg-paper text-ink"
      )}
      style={{ boxShadow: user ? "3px 3px 0 var(--red)" : "var(--shadow-sm)" }}
    >
      {label}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      aria-label={done ? "Copied" : "Copy message"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* clipboard may be blocked in the preview iframe */
        }
        setDone(true);
        setTimeout(() => setDone(false), 1200);
      }}
      className={cn(
        "flex h-6 w-6 cursor-pointer items-center justify-center rounded-none border-[2px] border-ink bg-paper-raised text-ink",
        "[box-shadow:2px_2px_0_var(--ink)] hover:[box-shadow:3px_3px_0_var(--ink)] active:[box-shadow:1px_1px_0_var(--ink)]",
        "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px",
        "opacity-0 group-hover/msg:opacity-100 focus-visible:opacity-100"
      )}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function RetryButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex h-6 cursor-pointer items-center gap-1 rounded-none border-[2px] border-ink bg-paper-raised px-2 font-label text-[9px] uppercase tracking-[0.1em] text-ink",
        "[box-shadow:2px_2px_0_var(--ink)] hover:[box-shadow:3px_3px_0_var(--ink)] active:[box-shadow:1px_1px_0_var(--ink)]",
        "transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-px hover:-translate-y-px active:translate-x-px active:translate-y-px"
      )}
    >
      <RotateCcw className="h-3 w-3" /> Retry
    </button>
  );
}

function Dots() {
  return (
    <span className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((n) => (
        <span
          key={n}
          aria-hidden
          className="h-1.5 w-1.5 bg-ink"
          style={{
            animation: "brutal-march 1s ease-in-out infinite",
            animationDelay: `${n * 0.18}s`,
          }}
        />
      ))}
      <span className="sr-only">Typing…</span>
    </span>
  );
}

export function Thread({
  messages,
  isTyping,
  character,
  userAvatar,
  onRetry,
}: ThreadProps) {
  const endRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {messages.map((m, idx) => {
        const user = m.role === "user";
        const firstOfRun = idx === 0 || messages[idx - 1].role !== m.role;
        const lastOfRun =
          idx === messages.length - 1 || messages[idx + 1].role !== m.role;
        const avatar = (
          <Avatar
            kind={m.role}
            label={user ? userAvatar : character.avatar}
          />
        );
        const spacer = <span className="w-8 flex-shrink-0" aria-hidden />;

        return (
          <div
            key={m.id}
            className={cn(
              "group/msg flex items-start gap-5 duration-150 animate-in fade-in slide-in-from-bottom-2",
              user ? "justify-end" : "justify-start"
            )}
          >
            {!user && (firstOfRun ? avatar : spacer)}

            <div
              className={cn(
                "flex max-w-[80%] flex-col",
                user ? "items-end" : "items-start"
              )}
            >
              <Bubble
                side={user ? "right" : "left"}
                className={m.error ? "border-red" : undefined}
              >
                {user ? (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                ) : m.streaming ? (
                  <span className="whitespace-pre-wrap">
                    {renderStreaming(m.content)}
                    <span className="ml-0.5 inline-block animate-pulse align-[-2px] text-ink">
                      ▍
                    </span>
                  </span>
                ) : (
                  <Markdown text={m.content} />
                )}
              </Bubble>

              {/* Meta row: copy (character) + retry (error) + timestamp (last of run) */}
              <div
                className={cn(
                  "mt-2 flex h-6 items-center gap-2",
                  user ? "flex-row-reverse" : "flex-row"
                )}
              >
                {!user && !m.streaming && <CopyButton text={m.content} />}
                {m.error && <RetryButton onClick={() => onRetry?.(m.id)} />}
                {lastOfRun && !m.streaming && (
                  <time className="font-label text-[9px] uppercase tracking-[0.12em] text-ink-muted">
                    {fmtTime(m.ts)}
                  </time>
                )}
              </div>
            </div>

            {user && (firstOfRun ? avatar : spacer)}
          </div>
        );
      })}

      {/* Typing indicator — character-side bubble with ink square dots */}
      {isTyping && (
        <div className="flex items-start gap-5 duration-150 animate-in fade-in slide-in-from-bottom-2">
          <Avatar kind="character" label={character.avatar} />
          <Bubble side="left">
            <Dots />
          </Bubble>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

export default Thread;
