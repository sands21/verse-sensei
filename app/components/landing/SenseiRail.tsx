import Link from "next/link";
import { cn } from "@/lib/utils";
import { Burst } from "../brutal/Burst";

// "Pick your sensei" — responsive cast. Mobile = horizontal swipe, desktop = grid.
// Static cast for now (always renders); deep-links into /chat. See CLAUDE.md §4.

type Badge = "new" | "today";

type Character = {
  name: string;
  universe: string; // must match DB universe name for /chat preselect
  emoji: string; // portrait slot — swap for real art later
  trait: string;
  badge?: Badge;
};

const CAST: Character[] = [
  { name: "Naruto", universe: "Naruto", emoji: "🍥", trait: "Never gives up", badge: "today" },
  { name: "Luffy", universe: "One Piece", emoji: "☠️", trait: "Chases freedom" },
  { name: "Goku", universe: "Dragon Ball", emoji: "⚡", trait: "Beyond limits" },
  { name: "Mikasa", universe: "Attack on Titan", emoji: "⚔️", trait: "Fierce loyalty" },
  { name: "Tanjiro", universe: "Demon Slayer", emoji: "🗡️", trait: "Quiet resolve" },
  { name: "Gojo", universe: "Jujutsu Kaisen", emoji: "👁️", trait: "Limitless", badge: "new" },
  { name: "Sasuke", universe: "Naruto", emoji: "🌀", trait: "Cold focus" },
];

// Vertical-only lift on the mobile rail (the horizontal scroll container clips
// the x-axis, so an x-translate would crop the leftmost card on hover). The full
// diagonal lift returns on lg, where the grid uses overflow-visible.
const RAISED =
  "transition-[transform,box-shadow] duration-100 ease-out " +
  "hover:-translate-y-0.5 active:translate-y-0.5 " +
  "lg:hover:-translate-x-0.5 lg:active:translate-x-0.5";

function chatHref(c: Character) {
  return `/chat?universe=${encodeURIComponent(c.universe)}&character=${encodeURIComponent(
    c.name
  )}`;
}

function CharacterCard({ c }: { c: Character }) {
  const featured = c.badge === "today";
  return (
    <Link
      href={chatHref(c)}
      className={cn(
        "group relative w-[158px] shrink-0 snap-start border-[2.5px] border-ink bg-paper-raised p-5 text-center",
        "lg:w-auto",
        RAISED,
        // Shadow via classes (not inline style) so hover/active can override.
        featured
          ? "[box-shadow:var(--shadow-red)] hover:[box-shadow:6px_6px_0_var(--red)] active:[box-shadow:2px_2px_0_var(--red)]"
          : "[box-shadow:var(--shadow)] hover:[box-shadow:var(--shadow-lift)] active:[box-shadow:var(--shadow-sm)]"
      )}
    >
      {c.badge ? (
        <div className="absolute -right-3 -top-5 z-10">
          {c.badge === "new" ? (
            <Burst text="NEW!!" tone="red" size={86} rotate={9} pulse="a" />
          ) : (
            <Burst text="TODAY" tone="cream" size={86} rotate={-7} pulse="b" />
          )}
        </div>
      ) : null}

      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[2.5px] border-ink bg-paper text-2xl"
        style={{ boxShadow: "var(--shadow-sm)" }}
        aria-hidden
      >
        {c.emoji}
      </div>
      <div className="font-clash mt-3 text-base font-bold uppercase text-ink">
        {c.name}
      </div>
      <div className="font-label text-[10px] uppercase tracking-[0.12em] text-ink-muted">
        {c.universe}
      </div>
      <div className="font-body mt-1 text-[12px] text-ink-soft">{c.trait}</div>
    </Link>
  );
}

function SeeAllCard() {
  return (
    <Link
      href="/chat"
      className={cn(
        "group flex w-[158px] shrink-0 snap-start flex-col items-center justify-center border-[2.5px] border-ink bg-ink p-5 text-center text-paper",
        "lg:w-auto",
        RAISED,
        "[box-shadow:var(--shadow-red)] hover:[box-shadow:6px_6px_0_var(--red)] active:[box-shadow:2px_2px_0_var(--red)]"
      )}
    >
      <div className="font-clash text-3xl font-bold leading-none">+</div>
      <div className="font-clash mt-2 text-sm font-bold uppercase">See all</div>
      <div className="font-label mt-0.5 text-[10px] uppercase tracking-[0.12em] text-paper/55">
        &amp; more soon
      </div>
    </Link>
  );
}

export function SenseiRail() {
  return (
    <section
      id="sensei"
      className="relative overflow-hidden border-t-[3px] border-ink"
    >
      {/* Ambient atmosphere bursts (cream, no red) */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <Burst
          tone="ghost"
          size={104}
          rotate={12}
          pulse="b"
          opacity={0.4}
          className="absolute -left-10 top-32"
        />
        <Burst
          tone="ghost"
          size={88}
          rotate={-10}
          pulse="a"
          opacity={0.4}
          className="absolute -right-6 bottom-10"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:py-20">
        {/* Calm section header */}
        <div className="mb-6 flex items-end gap-4 lg:mb-10">
          <h2 className="font-clash text-3xl font-bold uppercase text-ink md:text-4xl">
            Pick your sensei
          </h2>
          <div className="mb-2 h-[4px] flex-1 bg-ink" />
          <span className="font-label mb-1 whitespace-nowrap text-[11px] uppercase tracking-[0.15em] text-ink-muted">
            06 worlds
          </span>
        </div>

        {/* Mobile: horizontal swipe · Desktop: grid.
            Rail stays inside the section's px-5 (no full-bleed) so the first card
            aligns with the title and scroll-snap can't eat a start gutter.
            pt-8/pb-5: overflow-x:auto forces overflow-y to clip, so the corner
            badges (-top-5) and hover-lift would crop without the vertical pad. */}
        <div className="flex snap-x gap-4 overflow-x-auto pb-5 pt-8 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:pb-0 lg:pt-0">
          {CAST.map((c) => (
            <CharacterCard key={`${c.universe}-${c.name}`} c={c} />
          ))}
          <SeeAllCard />
        </div>

        <p className="font-label mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-ink-muted lg:hidden">
          ← swipe the cast →
        </p>
      </div>
    </section>
  );
}

export default SenseiRail;
