// Spiky comic-explosion balloon. See CLAUDE.md §3 (Impact burst).
// Two stacked polygons: an ink shadow offset by (4,4) under a filled+stroked face.
// red = attention (NEW!! badge) · cream/ghost = atmosphere (LIVE, ambient).

const POINTS =
  "75,4 90,26 122,12 110,33 146,35 112,46 128,66 92,52 75,68 58,52 22,66 38,46 4,35 40,33 28,12 60,26";

type BurstTone = "red" | "cream" | "ghost";

interface BurstProps {
  /** Shout text (e.g. "NEW!!", "LIVE"). Omit for a pure decorative burst. */
  text?: string;
  tone?: BurstTone;
  /** SVG render width in px. */
  size?: number;
  /** Static tilt in degrees, for the hand-inked feel. */
  rotate?: number;
  /** Throb animation; omit to keep it still. */
  pulse?: "a" | "b";
  /** For ambient decoration. */
  opacity?: number;
  className?: string;
  ariaLabel?: string;
}

export function Burst({
  text,
  tone = "cream",
  size = 100,
  rotate = 0,
  pulse,
  opacity = 1,
  className,
  ariaLabel,
}: BurstProps) {
  const faceFill =
    tone === "red"
      ? "var(--red)"
      : tone === "ghost"
      ? "var(--ghost)"
      : "var(--paper-raised)";
  const textFill = tone === "red" ? "var(--paper-raised)" : "var(--ink)";
  const textSize = Math.round(size * 0.2);

  return (
    <div
      className={className}
      style={{ transform: `rotate(${rotate}deg)`, opacity, lineHeight: 0 }}
    >
      <div className={pulse === "a" ? "burst-pulse-a" : pulse === "b" ? "burst-pulse-b" : undefined}>
        <svg
          viewBox="0 0 150 70"
          width={size}
          style={{ overflow: "visible", display: "block" }}
          role={text || ariaLabel ? "img" : "presentation"}
          aria-label={ariaLabel ?? text}
          aria-hidden={text || ariaLabel ? undefined : true}
        >
          <polygon points={POINTS} fill="var(--ink)" transform="translate(4,4)" />
          <polygon
            points={POINTS}
            fill={faceFill}
            stroke="var(--ink)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
          {text ? (
            <text
              x={75}
              y={37}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textFill}
              style={{ fontFamily: "var(--ff-bangers), system-ui, sans-serif" }}
              fontSize={textSize}
            >
              {text}
            </text>
          ) : null}
        </svg>
      </div>
    </div>
  );
}

export default Burst;
