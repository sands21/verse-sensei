import Link from "next/link";

// How-it-works: three shared-border manga panels with oversized ghost numbers.
// The final panel is the red accent and links into /chat. See CLAUDE.md §4.

export function HowItWorks() {
  return (
    <section className="halftone border-t-[3px] border-ink">
      <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        {/* Calm section header — title left, count right (system default) */}
        <div className="mb-8 flex items-end gap-4">
          <h2 className="font-clash text-3xl font-bold uppercase text-ink md:text-4xl">
            How it works
          </h2>
          <div className="mb-2 h-[4px] flex-1 bg-ink" />
          <span className="font-label mb-1 whitespace-nowrap text-[11px] uppercase tracking-[0.15em] text-ink-muted">
            03 steps
          </span>
        </div>

        {/* Manga panel strip — shared borders, one hard shadow */}
        <div
          className="grid grid-cols-1 border-[3px] border-ink bg-paper-raised md:grid-cols-3"
          style={{ boxShadow: "var(--shadow-lift)" }}
        >
          {/* 01 */}
          <div className="relative border-b-[3px] border-ink p-7 md:border-b-0 md:border-r-[3px] md:p-8">
            <div className="font-clash text-6xl font-bold leading-none text-ghost md:text-7xl">
              01
            </div>
            <h3 className="font-clash mt-3 text-xl font-bold uppercase text-ink">
              Pick a world
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-ink-soft">
              Naruto, One Piece, Attack on Titan… six universes and counting.
            </p>
          </div>

          {/* 02 */}
          <div className="relative border-b-[3px] border-ink p-7 md:border-b-0 md:border-r-[3px] md:p-8">
            <div className="font-clash text-6xl font-bold leading-none text-ghost md:text-7xl">
              02
            </div>
            <h3 className="font-clash mt-3 text-xl font-bold uppercase text-ink">
              Pick a hero
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-ink-soft">
              Any character — hero or villain. Each one stays true to their voice.
            </p>
          </div>

          {/* 03 — red accent, links into chat */}
          <Link
            href="/chat"
            className="group relative bg-red p-7 text-white transition-colors hover:bg-red-deep md:p-8"
          >
            <div className="font-clash text-6xl font-bold leading-none text-white/30 md:text-7xl">
              03
            </div>
            <h3 className="font-clash mt-3 text-xl font-bold uppercase">
              Start talking
            </h3>
            <p className="font-body mt-2 text-sm leading-relaxed text-white/85">
              Ask anything. They answer in their own words — right away.
            </p>
            <span className="font-clash mt-4 inline-flex items-center gap-2 text-sm font-bold uppercase">
              Open the chat
              <span className="transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
