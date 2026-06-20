// Static cast for the chat preview (no DB). Mirrors the landing SenseiRail.
// In the real app this comes from characters/universes + persona_config.
// See CLAUDE.md §5. Avatar letters stand in for portrait/emoji placeholders.

export interface CastChar {
  name: string;
  avatar: string;
  universe: string;
  trait: string;
}

export const CAST: CastChar[] = [
  { name: "Naruto", avatar: "N", universe: "Konoha", trait: "Never gives up" },
  { name: "Sasuke", avatar: "S", universe: "Konoha", trait: "The avenger" },
  { name: "Luffy", avatar: "L", universe: "One Piece", trait: "Free spirit" },
  { name: "Gojo", avatar: "G", universe: "Jujutsu Kaisen", trait: "The strongest" },
  { name: "Tanjiro", avatar: "T", universe: "Demon Slayer", trait: "Kind heart" },
  { name: "Eren", avatar: "E", universe: "Attack on Titan", trait: "Freedom" },
];

// Universe names in cast order, de-duplicated.
export const UNIVERSES: string[] = CAST.reduce<string[]>((acc, c) => {
  if (!acc.includes(c.universe)) acc.push(c.universe);
  return acc;
}, []);

export const charsInUniverse = (universe: string): CastChar[] =>
  CAST.filter((c) => c.universe === universe);

export const FEATURED: CastChar = CAST[0]; // Naruto
