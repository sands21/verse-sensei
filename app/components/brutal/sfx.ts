// Manga onomatopoeia that pops on click. See CLAUDE.md §3 (Interaction onomatopoeia).
// Decorative only, aria-hidden, reduced-motion safe. Scoped to a curated action set.

export type SfxPool = "go" | "send" | "impact";

// [word, font-size px]
const POOLS: Record<SfxPool, Array<[string, number]>> = {
  go: [
    ["LET'S GO!", 46],
    ["GO!!", 56],
    ["ZOOM!", 50],
    ["DASH!!", 48],
  ],
  send: [
    ["WHOOSH!", 46],
    ["ZIP!", 54],
    ["SWISH!", 48],
    ["FWOOSH!", 44],
  ],
  impact: [
    ["DON!!", 58],
    ["DODON!!", 46],
    ["BAM!", 56],
    ["POW!", 56],
    ["BOOM!", 52],
  ],
};

/** Pop a random themed sound-effect word at viewport coords (x, y). */
export function popSfx(pool: SfxPool, x: number, y: number): void {
  if (typeof document === "undefined") return;

  const arr = POOLS[pool] ?? POOLS.impact;
  const [word, size] = arr[Math.floor(Math.random() * arr.length)];
  const inkOutline = Math.random() > 0.5;
  const rot = Math.random() * 22 - 11;

  const el = document.createElement("div");
  el.textContent = word;
  el.setAttribute("aria-hidden", "true");

  const styles: Record<string, string> = {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    "font-family": "var(--ff-bangers), system-ui, sans-serif",
    "font-size": `${size}px`,
    "line-height": "1",
    color: inkOutline ? "var(--ink)" : "var(--red)",
    "-webkit-text-stroke": inkOutline ? "2px var(--red)" : "2px var(--ink)",
    "text-shadow": inkOutline ? "3px 3px 0 var(--red)" : "3px 3px 0 var(--ink)",
    transform: "translate(-50%, -50%)",
    "pointer-events": "none",
    "white-space": "nowrap",
    "user-select": "none",
    "z-index": "9999",
  };
  for (const [k, v] of Object.entries(styles)) el.style.setProperty(k, v);

  document.body.appendChild(el);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const anim = reduce
    ? el.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], {
        duration: 500,
      })
    : el.animate(
        [
          {
            transform: `translate(-50%, -50%) scale(0.3) rotate(${rot}deg)`,
            opacity: 0,
          },
          {
            transform: `translate(-50%, -60%) scale(1.15) rotate(${rot}deg)`,
            opacity: 1,
            offset: 0.22,
          },
          {
            transform: `translate(-50%, -160%) scale(1.3) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        { duration: 680, easing: "cubic-bezier(.2,.8,.2,1)" }
      );

  const cleanup = () => el.remove();
  anim.onfinish = cleanup;
  anim.oncancel = cleanup;
}

/** Convenience for click handlers: popSfxAt("impact", e). */
export function popSfxAt(
  pool: SfxPool,
  e: { clientX: number; clientY: number }
): void {
  popSfx(pool, e.clientX, e.clientY);
}
