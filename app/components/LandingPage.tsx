"use client";
import Link from "next/link";
import * as React from "react";
import HeroCollage from "./HeroCollage";
import HeroMotion from "./HeroMotion";
import UniverseMap from "./UniverseMap";

type Lore = { tagline: string; lore: string[] };

const LORE_BY_SLUG: Record<string, Lore> = {
  naruto: {
    tagline: "Ninja bonds, chakra, and unbreakable will.",
    lore: [
      "The spiral leaf symbol represents Konoha's will of fire.",
      "Torii gates often mark sacred training grounds.",
    ],
  },
  "one-piece": {
    tagline: "Set sail for freedom across the Grand Line.",
    lore: [
      "Log Pose compasses point to islands with magnetic fields.",
      "Dawn Island's sunsets inspired the Straw Hat flag colors.",
    ],
  },
  "attack-on-titan": {
    tagline: "Humanity fights for sky beyond the walls.",
    lore: [
      "ODM gear came from ancient blueprints found in a cellar.",
      "The Walls are named for mythic guardians of old.",
    ],
  },
  "dragon-ball": {
    tagline: "Train hard, surpass limits, protect your world.",
    lore: [
      "Four-star ball is Goku's keepsake from Grandpa Gohan.",
      "Ki signatures ripple like auroras in high gravity.",
    ],
  },
  "jujutsu-kaisen": {
    tagline: "Curses feed on fear; insight turns fear to strength.",
    lore: [
      "Shrines near torii are said to dampen cursed whispers.",
      "Purple flares mark peak domain expansions.",
    ],
  },
  "demon-slayer": {
    tagline: "Breath, blade, and unwavering resolve.",
    lore: [
      "Nichirin blades shift hue in sunlight.",
      "Wisteria blooms ward demons near mountain paths.",
    ],
  },
};

function LorePanelAndMap({ universes }: { universes: typeof UNIVERSES }) {
  const [hovered, setHovered] = React.useState<string>("");
  const [displayedSlug, setDisplayedSlug] = React.useState<string>("");
  const [phase, setPhase] = React.useState<"idle" | "out">("idle");

  React.useEffect(() => {
    setPhase("out");
    const t = window.setTimeout(() => {
      setDisplayedSlug(hovered);
      setPhase("idle");
    }, 160);
    return () => window.clearTimeout(t);
  }, [hovered]);

  const active: Lore | undefined = displayedSlug
    ? LORE_BY_SLUG[displayedSlug as keyof typeof LORE_BY_SLUG]
    : undefined;
  const glow = universes.find((u) => u.slug === displayedSlug)?.glow;
  const title = displayedSlug
    ? universes.find((u) => u.slug === displayedSlug)?.name ?? ""
    : "A living galaxy of worlds";
  const tagline = displayedSlug
    ? active?.tagline || "Explore this world."
    : "Hover the portals to feel their energy. Click and drag the universes to your liking :)";
  const items =
    displayedSlug && active
      ? active.lore
      : [
          "Each universe has its own unique characters and stories",
          "Immerse yourself in authentic conversations",
          "From ninjas to pirates to supernatural warriors",
        ];

  return (
    <div
      className="grid gap-6 md:grid-cols-[minmax(220px,1fr)_minmax(0,1.6fr)] items-stretch"
      style={{
        // @ts-expect-error CSS var passthrough
        "--map-section-h": "380px",
      }}
    >
      <div
        className="glass-card rounded-xl p-6 md:p-7 h-full hidden md:block"
        style={{
          boxShadow: glow ? `0 10px 30px ${hexToRgba(glow, 0.22)}` : undefined,
          borderColor: glow ? hexToRgba(glow, 0.25) : undefined,
        }}
      >
        <div
          style={{
            transition: "opacity 200ms ease, transform 200ms ease",
            opacity: phase === "out" ? 0 : 1,
            transform: phase === "out" ? "translateY(6px)" : "none",
          }}
        >
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted">{tagline}</p>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {items.map((t, i) => (
              <li key={`${displayedSlug || "default"}-${i}`}>• {t}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="relative overflow-visible">
        <UniverseMap
          universes={universes}
          onHoverChange={(u) => setHovered(u?.slug || "")}
        />
      </div>
    </div>
  );
}

type Universe = {
  name: string;
  slug: string;
  glow: string; // hex color for glow accents
};

const UNIVERSES: (Universe & { description: string })[] = [
  {
    name: "Naruto",
    slug: "naruto",
    glow: "#f59e0b",
    description: "Talk with ninjas, heroes, and legends of Konoha.",
  },
  {
    name: "One Piece",
    slug: "one-piece",
    glow: "#60a5fa",
    description: "Set sail and banter with pirates of the Grand Line.",
  },
  {
    name: "Attack on Titan",
    slug: "attack-on-titan",
    glow: "#9ca3af",
    description: "Join the scouts and face the Titans head-on.",
  },
  {
    name: "Dragon Ball",
    slug: "dragon-ball",
    glow: "#fb923c",
    description:
      "Train, spar, and chat with the strongest fighters in the galaxy.",
  },
  {
    name: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    glow: "#7c3aed",
    description: "Enter the world of curses and sorcerers.",
  },
  {
    name: "Demon Slayer",
    slug: "demon-slayer",
    glow: "#ef4444",
    description: "Walk alongside slayers and demons in their eternal struggle.",
  },
];

export default function LandingPage() {
  return (
    <main className="relative z-10 overflow-visible">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="animated-gradient absolute -top-1/4 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full opacity-60" />
        <div className="grid-overlay absolute inset-0" />
        <div className="orb absolute -left-10 top-20 h-40 w-40 opacity-40" />
        <div className="orb absolute bottom-10 right-10 h-52 w-52 opacity-40" />
      </div>
      {/* Ambient particles overlay (non-interactive) */}
      <div className="particles" aria-hidden>
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${(i * 97) % 100}%`,
              width: `${6 + ((i * 13) % 10)}px`,
              height: `${6 + ((i * 13) % 10)}px`,
              animationDuration: `${18 + ((i * 7) % 14)}s`,
              animationDelay: `${(i * 3) % 20}s`,
              opacity: 0.25 + ((i * 7) % 10) / 100,
            }}
          />
        ))}
      </div>

      {/* Hero */}
      <section
        id="hero"
        className="relative flex h-screen min-h-screen w-full flex-col items-center justify-center px-6 text-center sm:px-8 snap-start"
      >
        <HeroMotion />
        <HeroCollage />
        <p className="fade-in-up text-xs uppercase tracking-widest text-muted">
          A fun way to learn
        </p>
        <h1 className="hero-headline mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl font-display">
          <span className="line line-1">Think like your heroes</span>
          <br />
          {/* <span className="line line-2">Physics by Yoda, DSA by Goku </span> */}
          {/* <br /> */}
          <span className="line line-3 gradient-text whitespace-nowrap">
            Complex ideas, their way
          </span>
        </h1>
        <h2 className="fade-in-up delay-2 mt-5 max-w-2xl text-base text-muted sm:text-lg">
          Every character has unique wisdom and perspective. Unlock new ways of
          understanding by learning from the minds you&apos;re already drawn to.
          Choose any universe, pick any hero or villain, and discover how
          they&apos;d explain the world&apos;s most fascinating concepts
        </h2>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/chat"
            className="btn btn-primary-glow hover-lift rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] px-6 py-3 text-base font-medium ring-1 ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)]"
          >
            Pick your sensei
          </Link>
          <Link
            href="/login"
            className="btn btn-outline-animated hover-lift rounded-full bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] px-6 py-3 text-base font-medium ring-1 ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)]"
          >
            Login
          </Link>
        </div>

        <div className="scroll-indicator" aria-hidden>
          <span className="chevron">⌄</span>
        </div>
      </section>

      {/* Universe selection - interactive map with text */}
      <section
        id="universe-picker"
        className="mx-auto w-full max-w-6xl px-6 pb-14 sm:px-8 snap-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted font-display">
            Pick your universe
          </h2>
        </div>
        <LorePanelAndMap universes={UNIVERSES} />
      </section>

      {/* Featured Character of the Day */}
      <section
        id="featured"
        className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-8 snap-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted font-display">
            Featured Character of the Day
          </h2>
        </div>
        <FeaturedCharacterCard />
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-8 snap-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted font-display">
            Why you’ll love it
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="glass-card hover-lift rounded-xl p-6">
            <div className="text-2xl">🤖</div>
            <h4 className="mt-3 text-lg font-semibold">Persona-true replies</h4>
            <p className="mt-1 text-sm text-muted">
              Every chat feels authentic — like the character is really talking
              to you.
            </p>
          </div>
          <div className="glass-card hover-lift rounded-xl p-6">
            <div className="text-2xl">✨</div>
            <h4 className="mt-3 text-lg font-semibold">
              Smooth & fun interactions
            </h4>
            <p className="mt-1 text-sm text-muted">
              Playful micro-animations, no clutter. Feels alive.
            </p>
          </div>
          <div className="glass-card hover-lift rounded-xl p-6">
            <div className="text-2xl">⚡</div>
            <h4 className="mt-3 text-lg font-semibold">Fast startup</h4>
            <p className="mt-1 text-sm text-muted">
              Jump straight into the action — no setup, no delay.
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon Teaser */}
      <section
        id="coming-soon"
        className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-8 snap-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted font-display">
            More worlds are opening soon…
          </h2>
        </div>
        <div className="no-scrollbar -mx-6 flex snap-x gap-4 overflow-x-auto px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative min-w-[220px] snap-start overflow-hidden rounded-xl p-6 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-60 blur-xl"
                style={{
                  backgroundImage: radialGradient(
                    `#${(((i + 2) * 123456) % 0xffffff)
                      .toString(16)
                      .padStart(6, "0")}`
                  ),
                  backgroundRepeat: "no-repeat",
                }}
              />
              <div className="relative z-10 text-3xl text-muted">?</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-sm text-muted">
          Hint: More heroes, villains, and universes are on their way.
        </p>
      </section>

      {/* Footer */}
      <footer className="mt-8 bg-[color-mix(in_oklab,black_18%,var(--background))] py-10">
        <div className="mx-auto w-full max-w-6xl px-6 text-center sm:px-8">
          <p className="text-sm text-muted">
            Powered by ninjas, pirates, titans, and curses ⚡
          </p>
          <div className="mt-4 flex items-center justify-center gap-6 text-2xl text-muted">
            <span className="fade-cycle">🍥</span>
            <span className="fade-cycle delay-1">☠️</span>
            <span className="fade-cycle delay-2">⚔️</span>
            <span className="fade-cycle delay-3">🐉</span>
            <span className="fade-cycle delay-4">✨</span>
            <span className="fade-cycle delay-5">🗡️</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function radialGradient(hex: string): string {
  const rgba = hexToRgba(hex, 0.22);
  return `radial-gradient(40% 40% at 50% 50%, ${rgba}, transparent 70%)`;
}

function themedBackground(slug: string, glow: string): string {
  switch (slug) {
    case "naruto":
      return `linear-gradient(135deg, ${hexToRgba(
        glow,
        0.15
      )}, rgba(255,255,255,0.02)), radial-gradient(60% 60% at 20% 20%, ${hexToRgba(
        glow,
        0.18
      )}, transparent 60%), radial-gradient(50% 50% at 80% 30%, rgba(255,122,69,0.12), transparent 60%)`;
    case "one-piece":
      return `linear-gradient(135deg, rgba(96,165,250,0.14), rgba(34,211,238,0.10)), radial-gradient(40% 40% at 80% 70%, rgba(34,211,238,0.15), transparent 60%)`;
    case "attack-on-titan":
      return `linear-gradient(135deg, rgba(156,163,175,0.14), rgba(75,85,99,0.10)), radial-gradient(40% 40% at 70% 30%, rgba(16,185,129,0.10), transparent 60%)`;
    case "dragon-ball":
      return `linear-gradient(135deg, rgba(251,146,60,0.16), rgba(239,68,68,0.10)), radial-gradient(40% 40% at 20% 80%, rgba(251,146,60,0.18), transparent 60%)`;
    case "jujutsu-kaisen":
      return `linear-gradient(135deg, rgba(124,58,237,0.16), rgba(79,70,229,0.10)), radial-gradient(40% 40% at 80% 20%, rgba(124,58,237,0.18), transparent 60%)`;
    case "demon-slayer":
      return `linear-gradient(135deg, rgba(16,185,129,0.14), rgba(239,68,68,0.10)), radial-gradient(40% 40% at 30% 70%, rgba(16,185,129,0.16), transparent 60%)`;
    default:
      return `linear-gradient(135deg, ${hexToRgba(
        glow,
        0.12
      )}, rgba(255,255,255,0.02))`;
  }
}

type FeaturedCharacter = {
  name: string;
  quote: string;
  universeSlug: string;
  universeName: string;
  glow: string;
};

function getDailyCharacter(): FeaturedCharacter {
  const choices: FeaturedCharacter[] = [
    {
      name: "Naruto Uzumaki",
      quote: "I’m gonna be Hokage! Believe it!",
      universeSlug: "naruto",
      universeName: "Naruto",
      glow: "#f59e0b",
    },
    {
      name: "Monkey D. Luffy",
      quote: "I’m gonna be King of the Pirates!",
      universeSlug: "one-piece",
      universeName: "One Piece",
      glow: "#60a5fa",
    },
    {
      name: "Mikasa Ackerman",
      quote: "As long as I’m alive, I’ll protect you.",
      universeSlug: "attack-on-titan",
      universeName: "Attack on Titan",
      glow: "#9ca3af",
    },
    {
      name: "Goku",
      quote: "The harder the battle, the greater the victory!",
      universeSlug: "dragon-ball",
      universeName: "Dragon Ball",
      glow: "#fb923c",
    },
    {
      name: "Yuji Itadori",
      quote:
        "I don’t know how I’ll feel when I’m dead, but I don’t want to regret how I lived.",
      universeSlug: "jujutsu-kaisen",
      universeName: "Jujutsu Kaisen",
      glow: "#7c3aed",
    },
    {
      name: "Tanjiro Kamado",
      quote:
        "No matter how many people you may lose, you have no choice but to go on living.",
      universeSlug: "demon-slayer",
      universeName: "Demon Slayer",
      glow: "#10b981",
    },
  ];
  const dayIndex =
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % choices.length;
  return choices[dayIndex];
}

function FeaturedCharacterCard() {
  const c = getDailyCharacter();
  return (
    <div
      className="relative overflow-hidden rounded-xl p-6 md:p-8"
      style={{
        backgroundImage: themedBackground(c.universeSlug, c.glow),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        boxShadow: `0 20px 50px rgba(0,0,0,0.35), 0 0 40px ${hexToRgba(
          c.glow,
          0.25
        )}`,
      }}
    >
      <div
        className="pointer-events-none absolute -inset-10 opacity-70 blur-2xl"
        style={{
          backgroundImage: radialGradient(c.glow),
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10">
        <div className="text-xs uppercase tracking-wide text-muted">
          {c.universeName}
        </div>
        <h3 className="mt-1 text-3xl font-semibold sm:text-4xl">{c.name}</h3>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          “{c.quote}”
        </p>
        <div className="mt-5">
          <Link
            href={`/chat?universe=${encodeURIComponent(
              c.universeName
            )}&character=${encodeURIComponent(c.name)}`}
            className="btn hover-lift rounded-full bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] px-5 py-2.5 text-sm font-medium ring-1 ring-[color-mix(in_oklab,var(--foreground)_20%,transparent)]"
            style={{ boxShadow: `0 0 22px ${hexToRgba(c.glow, 0.35)}` }}
          >
            Chat Now
          </Link>
        </div>
      </div>
    </div>
  );
}
