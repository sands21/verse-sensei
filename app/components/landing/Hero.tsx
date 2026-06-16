"use client";

import { useEffect, useState } from "react";
import { Button } from "../brutal/Button";
import { Bubble } from "../brutal/Bubble";
import { Burst } from "../brutal/Burst";

// Hero with a scripted, looping chat demo (no API calls). Doubles as a preview
// of the streaming chat to come. See CLAUDE.md §4.

type Exchange = {
  name: string;
  emoji: string;
  universe: string;
  question: string;
  answer: string; // *text* segments render as red italic actions
};

const EXCHANGES: Exchange[] = [
  {
    name: "Naruto",
    emoji: "🍥",
    universe: "Konoha",
    question: "How do I stay motivated when it's hard?",
    answer:
      "*grins* Believe it! You don't quit when it hurts — that's exactly when you push hardest.",
  },
  {
    name: "Luffy",
    emoji: "☠️",
    universe: "One Piece",
    question: "What does freedom really mean?",
    answer:
      "Freedom's doing what I want! The guy with the most freedom out here gets to be Pirate King.",
  },
  {
    name: "Goku",
    emoji: "⚡",
    universe: "Dragon Ball",
    question: "How do I push past my limits?",
    answer:
      "The harder the fight, the more I grow! Give it everything you've got — then go beyond.",
  },
  {
    name: "Tanjiro",
    emoji: "🗡️",
    universe: "Demon Slayer",
    question: "How do you keep going?",
    answer:
      "No matter how many times you fall, you get back up. That's all there really is to it.",
  },
];

// Split on '*' so complete *actions* AND a half-typed action both render red.
function renderInline(text: string) {
  return text.split("*").map((seg, i) =>
    i % 2 === 1 ? (
      <em key={i} className="font-medium italic text-red">
        {seg}
      </em>
    ) : (
      <span key={i}>{seg}</span>
    )
  );
}

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const ex = EXCHANGES[idx];
  const done = typed.length >= ex.answer.length;

  useEffect(() => {
    const next = () => setIdx((i) => (i + 1) % EXCHANGES.length);
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setTyped(ex.answer);
      const hold = setTimeout(next, 6200);
      return () => clearTimeout(hold);
    }

    setTyped("");
    let i = 0;
    let hold: ReturnType<typeof setTimeout>;
    const typer = setInterval(() => {
      i += 1;
      setTyped(ex.answer.slice(0, i));
      if (i >= ex.answer.length) {
        clearInterval(typer);
        hold = setTimeout(next, 5200);
      }
    }, 28);

    return () => {
      clearInterval(typer);
      clearTimeout(hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  return (
    <section className="halftone relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Left: copy + CTAs */}
        <div>
          <span className="font-label inline-block bg-ink px-2 py-1 text-[11px] uppercase text-paper">
            A fun way to learn
          </span>
          <h1 className="font-clash mt-5 text-5xl font-bold uppercase leading-[0.92] text-ink md:text-6xl lg:text-7xl">
            Think like
            <br />
            your heroes
          </h1>
          <span className="font-clash mt-4 inline-block -rotate-2 bg-red px-2 py-0.5 text-xl font-semibold uppercase text-white md:text-2xl lg:text-3xl">
            Complex ideas, their way
          </span>
          <p className="font-body mt-6 max-w-md text-[15px] font-medium leading-relaxed text-ink-soft">
            Pick any universe, pick any hero or villain, and learn how they&apos;d
            explain the world&apos;s most fascinating ideas.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" sfx="go" href="/chat">
              Pick your sensei →
            </Button>
            <Button variant="secondary" size="lg" href="#sensei">
              See the cast
            </Button>
          </div>
        </div>

        {/* Right: scripted chat demo */}
        <div className="relative">
          <div
            className="relative border-[3px] border-ink bg-paper-raised p-5 md:p-6"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            {/* LIVE badge */}
            <div className="absolute -right-3 -top-6 z-10">
              <Burst text="LIVE" tone="cream" size={96} rotate={-8} pulse="b" />
            </div>

            {/* Character header */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper text-xl"
                style={{ boxShadow: "var(--shadow-sm)" }}
                aria-hidden
              >
                {ex.emoji}
              </div>
              <div className="leading-tight">
                <div className="font-clash text-lg font-bold uppercase tracking-[-0.02em] text-ink">
                  {ex.name}
                </div>
                <div className="font-label text-[10px] uppercase tracking-[0.15em] text-ink-muted">
                  {ex.universe}
                </div>
              </div>
            </div>

            {/* Conversation */}
            <div className="mt-6 flex flex-col gap-5">
              <div className="flex justify-end">
                <Bubble side="right" className="max-w-[85%]">
                  {ex.question}
                </Bubble>
              </div>
              <div className="flex justify-start">
                <Bubble side="left" className="max-w-[90%]">
                  {renderInline(typed)}
                  {!done && (
                    <span className="ml-0.5 inline-block animate-pulse text-ink-muted">
                      ▍
                    </span>
                  )}
                </Bubble>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
