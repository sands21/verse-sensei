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
  quotes: string[];
  universeSlug: string;
  universeName: string;
  glow: string;
  icon: string;
  ctaText: string;
};

function getDailyCharacter(): FeaturedCharacter {
  const choices: FeaturedCharacter[] = [
    {
      name: "Naruto Uzumaki",
      quotes: [
        "I'm gonna be Hokage! Believe it!",
        "Never give up, that's my nindō: my ninja way!",
        "When people are protecting something truly special to them, they can become as strong as they can be.",
      ],
      universeSlug: "naruto",
      universeName: "Naruto",
      glow: "#f59e0b",
      icon: "🍥",
      ctaText: "Learn from Naruto",
    },
    {
      name: "Monkey D. Luffy",
      quotes: [
        "I'm gonna be King of the Pirates!",
        "I don't want to conquer anything. I just think the guy with the most freedom in this ocean is the Pirate King!",
        "Power isn't determined by your size, but the size of your heart and dreams!",
      ],
      universeSlug: "one-piece",
      universeName: "One Piece",
      glow: "#60a5fa",
      icon: "☠️",
      ctaText: "Set Sail with Luffy",
    },
    {
      name: "Mikasa Ackerman",
      quotes: [
        "As long as I'm alive, I'll protect you.",
        "This world is cruel, but also very beautiful.",
        "If we don't win, we die. If we win, we live. If we don't fight, we can't win.",
      ],
      universeSlug: "attack-on-titan",
      universeName: "Attack on Titan",
      glow: "#9ca3af",
      icon: "⚔️",
      ctaText: "Join the Scouts",
    },
    {
      name: "Goku",
      quotes: [
        "The harder the battle, the greater the victory!",
        "I am the hope of the universe!",
        "Power comes in response to a need, not a desire.",
      ],
      universeSlug: "dragon-ball",
      universeName: "Dragon Ball",
      glow: "#fb923c",
      icon: "⚡",
      ctaText: "Train with Goku",
    },
    {
      name: "Yuji Itadori",
      quotes: [
        "I don't know how I'll feel when I'm dead, but I don't want to regret how I lived.",
        "I'm going to save people and make sure they have a proper death.",
        "Even if I'm the only one, I'll kill you!",
      ],
      universeSlug: "jujutsu-kaisen",
      universeName: "Jujutsu Kaisen",
      glow: "#7c3aed",
      icon: "👁️",
      ctaText: "Face the Curses",
    },
    {
      name: "Tanjiro Kamado",
      quotes: [
        "No matter how many people you may lose, you have no choice but to go on living.",
        "All I can do is work hard! That's the story of my life!",
        "Feel the rage. The powerful, pure rage of not being able to forgive will become your unswerving drive.",
      ],
      universeSlug: "demon-slayer",
      universeName: "Demon Slayer",
      glow: "#10b981",
      icon: "🗡️",
      ctaText: "Master the Breath",
    },
  ];
  const dayIndex =
    Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % choices.length;
  return choices[dayIndex];
}

function FeaturedCharacterCard() {
  const c = getDailyCharacter();
  const [currentQuoteIndex, setCurrentQuoteIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const [timeUntilReset, setTimeUntilReset] = React.useState("");

  // Quote cycling
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % c.quotes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [c.quotes.length]);

  // Card entrance animation
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer
  React.useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="featured-character-card"
      style={{
        backgroundImage: themedBackground(c.universeSlug, c.glow),
        borderColor: hexToRgba(c.glow, 0.25),
        boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 80px ${hexToRgba(
          c.glow,
          0.15
        )}`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1)" : "scale(0.95)",
        transition: "opacity 600ms ease, transform 600ms ease",
        // @ts-expect-error CSS var
        "--universe-glow": c.glow,
      }}
    >
      {/* Animated aura layers */}
      <div
        className="character-aura character-aura-1"
        style={{ background: radialGradient(c.glow) }}
      />
      <div
        className="character-aura character-aura-2"
        style={{ background: radialGradient(c.glow) }}
      />
      <div
        className="character-aura character-aura-3"
        style={{ background: radialGradient(c.glow) }}
      />

      {/* Universe badge */}
      <div
        className="universe-badge"
        style={{
          borderColor: hexToRgba(c.glow, 0.3),
          boxShadow: `0 0 20px ${hexToRgba(c.glow, 0.2)}`,
        }}
      >
        <span className="text-lg">{c.icon}</span>
        <span className="text-xs font-medium">{c.universeName}</span>
      </div>

      {/* Character image placeholder */}
      <div className="character-image-section">
        <div className="character-silhouette">
          <div className="character-placeholder">{c.icon}</div>
        </div>
      </div>

      {/* Content section */}
      <div className="character-content">
        <h3
          className="character-name font-display"
          style={{
            background: `linear-gradient(135deg, ${c.glow}, ${hexToRgba(
              c.glow,
              0.6
            )})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {c.name}
        </h3>

        {/* Quote cycling area */}
        <div className="quote-container">
          {c.quotes.map((quote, index) => (
            <p
              key={index}
              className="quote-text"
              style={{
                opacity: currentQuoteIndex === index ? 1 : 0,
                transform:
                  currentQuoteIndex === index
                    ? "translateY(0)"
                    : "translateY(10px)",
                position: currentQuoteIndex === index ? "relative" : "absolute",
                transition: "opacity 600ms ease, transform 600ms ease",
              }}
            >
              &ldquo;{quote}&rdquo;
            </p>
          ))}
        </div>

        {/* CTA Button */}
        <div className="mt-6">
          <Link
            href={`/chat?universe=${encodeURIComponent(
              c.universeName
            )}&character=${encodeURIComponent(c.name)}`}
            className="cta-button"
            style={{
              borderColor: hexToRgba(c.glow, 0.4),
              boxShadow: `0 0 30px ${hexToRgba(
                c.glow,
                0.3
              )}, 0 4px 12px rgba(0,0,0,0.3)`,
            }}
          >
            <span className="relative z-10">{c.ctaText} →</span>
          </Link>
        </div>

        {/* Countdown timer */}
        <div className="countdown-timer">
          <span className="text-muted">Resets in: </span>
          <span className="font-mono" style={{ color: c.glow }}>
            {timeUntilReset}
          </span>
        </div>
      </div>


    </div>
  );
}
