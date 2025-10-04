"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Universe = {
  name: string;
  slug: string;
  glow: string;
  description?: string;
};

type Props = {
  universes: Universe[];
  onHoverChange?: (u?: Universe) => void;
};

const DEFAULT_POSITIONS: Record<string, { x: number; y: number }> = {
  naruto: { x: 18, y: 62 },
  "one-piece": { x: 74, y: 48 },
  "attack-on-titan": { x: 36, y: 26 },
  "dragon-ball": { x: 56, y: 72 },
  "jujutsu-kaisen": { x: 28, y: 42 },
  "demon-slayer": { x: 86, y: 22 },
};

export default function UniverseMap({ universes, onHoverChange }: Props) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string>("");
  const [activating, setActivating] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [initialPositions, setInitialPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [positions, setPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});
  const [dragging, setDragging] = useState<string | null>(null);
  const dragRef = useRef<{
    slug: string;
    pointerId: number;
    startX: number;
    startY: number;
    active: boolean;
  } | null>(null);
  const suppressClickSlugRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Generate randomized starting positions on the client after mount
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {};
    const minX = 12;
    const maxX = 88;
    const minY = 18;
    const maxY = 82;
    universes.forEach((u) => {
      positions[u.slug] = {
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
      };
    });
    setInitialPositions(positions);
  }, [universes]);

  // Initialize current positions when initial positions are available
  useEffect(() => {
    if (!Object.keys(initialPositions).length) return;
    setPositions((prev) =>
      Object.keys(prev).length ? prev : initialPositions
    );
  }, [initialPositions]);

  // Resize observer to compute node size based on container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      // Base node size scales with container width but stays within limits
      const base = Math.max(56, Math.min(96, width * 0.11));
      el.style.setProperty("--node-size", `${base}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodes = useMemo(() => {
    return universes.map((u, idx) => {
      const pos = positions[u.slug] ||
        initialPositions[u.slug] ||
        DEFAULT_POSITIONS[u.slug] || {
          x: 18 + ((idx * 27) % 70),
          y: 28 + ((idx * 19) % 60),
        };
      const image = `/assets/${u.slug.replace(/-/g, " ")}.jpg`;
      return { ...u, x: pos.x, y: pos.y, image };
    });
  }, [universes, positions, initialPositions]);

  const lines = useMemo(() => {
    // Connect sequential nodes to form a subtle constellation loop
    return nodes.map((n, i) => {
      const next = nodes[(i + 1) % nodes.length];
      return [
        { x: n.x, y: n.y },
        { x: next.x, y: next.y },
      ];
    });
  }, [nodes]);

  const currentGlow = useMemo(() => {
    const found = hovered ? nodes.find((n) => n.slug === hovered) : undefined;
    return found?.glow ?? "#6b7280"; // default muted glow
  }, [hovered, nodes]);

  return (
    <div
      ref={wrapperRef}
      className="universe-map"
      style={{
        // @ts-expect-error CSS var
        "--map-accent": currentGlow,
      }}
      onMouseMove={(e) => {
        const el = wrapperRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const rx = (e.clientX - rect.left) / rect.width - 0.5;
        const ry = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty("--parallax-x", `${rx * 8}px`);
        el.style.setProperty("--parallax-y", `${ry * 8}px`);
        el.style.setProperty("--parallax-rot", `${rx * -1.2}deg`);
      }}
      onMouseLeave={() => {
        const el = wrapperRef.current;
        if (!el) return;
        el.style.setProperty("--parallax-x", `0px`);
        el.style.setProperty("--parallax-y", `0px`);
        el.style.setProperty("--parallax-rot", `0deg`);
      }}
    >
      {!isMobile && (
        <div className="map-canvas" ref={containerRef}>
          <div className="map-background" aria-hidden />
          <svg
            className="map-lines"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            {lines.map(([a, b], idx) => (
              <line
                key={idx}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className="ley-line"
              />
            ))}
          </svg>

          {/* Ambient particles */}
          <div className="map-particles" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="particle"
                style={{
                  left: `${(i * 53) % 100}%`,
                  top: `${(i * 37) % 100}%`,
                  animationDelay: `${(i * 131) % 2000}ms`,
                }}
              />
            ))}
          </div>

          {nodes.map((n) => (
            <button
              key={n.slug}
              type="button"
              className={
                "portal-node" + (activating === n.slug ? " activating" : "")
              }
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                // @ts-expect-error CSS var
                "--node-glow": n.glow,
              }}
              onMouseEnter={() => {
                setHovered(n.slug);
                if (onHoverChange) onHoverChange(n);
              }}
              onMouseLeave={() => {
                setHovered("");
                if (onHoverChange) onHoverChange(undefined);
              }}
              onClick={(e) => {
                if (activating) return;
                if (suppressClickSlugRef.current === n.slug) {
                  // ignore click triggered by a drag release
                  suppressClickSlugRef.current = null;
                  e.preventDefault();
                  return;
                }
                setActivating(n.slug);
                setTimeout(() => {
                  router.push(`/chat?universe=${encodeURIComponent(n.name)}`);
                }, 450);
              }}
              onPointerDown={(e) => {
                if (isMobile) return;
                e.currentTarget.setPointerCapture(e.pointerId);
                setDragging(n.slug);
                dragRef.current = {
                  slug: n.slug,
                  pointerId: e.pointerId,
                  startX: e.clientX,
                  startY: e.clientY,
                  active: false,
                };
              }}
              onPointerUp={(e) => {
                const info = dragRef.current;
                if (info && info.slug === n.slug) {
                  if (info.active) {
                    suppressClickSlugRef.current = n.slug;
                    window.setTimeout(() => {
                      if (suppressClickSlugRef.current === n.slug) {
                        suppressClickSlugRef.current = null;
                      }
                    }, 300);
                  }
                }
                if (dragging === n.slug) setDragging(null);
                dragRef.current = null;
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId);
                } catch {}
              }}
              onPointerCancel={() => {
                setDragging(null);
                dragRef.current = null;
              }}
              onPointerMove={(e) => {
                const info = dragRef.current;
                if (
                  !info ||
                  info.slug !== n.slug ||
                  info.pointerId !== e.pointerId
                )
                  return;
                const el = containerRef.current;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const px = ((e.clientX - rect.left) / rect.width) * 100;
                const py = ((e.clientY - rect.top) / rect.height) * 100;
                const clampedX = Math.max(4, Math.min(96, px));
                const clampedY = Math.max(6, Math.min(94, py));
                if (!info.active) {
                  const moved = Math.hypot(
                    e.clientX - info.startX,
                    e.clientY - info.startY
                  );
                  if (moved > 3) info.active = true;
                }
                setPositions((prev) => ({
                  ...prev,
                  [n.slug]: { x: clampedX, y: clampedY },
                }));
              }}
              aria-label={n.name}
            >
              <span className="portal-aura" />
              <span className="portal-ring" />
              <Image
                src={n.image}
                alt={n.name}
                className="portal-image"
                width={72}
                height={72}
                draggable={false}
              />
              <span className="portal-shadow" />
            </button>
          ))}
        </div>
      )}

      {/* Mobile fallback: vertical portals */}
      {isMobile && (
        <div className="mobile-portals no-scrollbar overflow-y-auto h-full">
          {nodes.map((n) => (
            <button
              key={n.slug}
              type="button"
              className="mobile-portal"
              style={{
                // @ts-expect-error CSS var
                "--node-glow": n.glow,
              }}
              onClick={() => {
                if (activating) return;
                setActivating(n.slug);
                setTimeout(() => {
                  router.push(`/chat?universe=${encodeURIComponent(n.name)}`);
                }, 350);
              }}
            >
              <span className="mobile-portal-ring" />
              <Image src={n.image} alt={n.name} width={68} height={68} />
              <div className="meta">
                <div className="name">{n.name}</div>
                {n.description ? (
                  <div className="desc">{n.description}</div>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
