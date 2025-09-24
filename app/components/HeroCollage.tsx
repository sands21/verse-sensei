"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const SOURCES = [
  "/images/panels/naruto.webp",
  "/images/panels/attack-on-titan.avif",
  "/images/panels/zoro.jpg",
  "/images/panels/demon.jpg",
  "/images/panels/sukuna.jpg",
  "/images/panels/random.jpg",
  "/images/panels/op.jpg",
  "/images/panels/images.jpg",
  "/images/panels/imagesd.jpg",
  "/images/panels/imagess.jpg",
  "/images/panels/fulfyl.jpg",
  "/images/panels/io;.jpg",
  "/images/panels/iop;'.jpg",
  "/images/panels/uio;.jpg",
  "/images/panels/rku.jpg",
  "/images/panels/tyukyuk.jpg",
  "/images/panels/rukryu.jpg",
  "/images/panels/tfjftu.jpg",
  "/images/panels/yykfguk.jpg",
  "/images/panels/dndf.jpg",
  "/images/panels/sfgjfg.jpg",
  "/images/panels/dfh.jpg",
  "/images/panels/sdf.jpg",
  "/images/panels/xdfh.jpg",
];

// Tiny PRNG and helpers for deterministic shuffles/ints from a seed
const makeRng = (s: number) => {
  let a = s >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const randInt = (rng: () => number, maxExclusive: number) =>
  Math.floor(rng() * maxExclusive);
const shuffleInPlace = <T,>(arr: T[], rng: () => number) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

export default function HeroCollage() {
  // Fewer panels on small screens to reduce work on mobile
  const [panelCount, setPanelCount] = useState<number>(8);
  // Random seed per refresh to vary layout deterministically on the client
  const [seed, setSeed] = useState<number | null>(null);

  useEffect(() => {
    const computeCount = (width: number): number => {
      if (width < 640) return 8; // phones
      if (width < 1024) return 16; // tablets / small laptops
      return 24; // desktops
    };
    const apply = () => setPanelCount(computeCount(window.innerWidth));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  // Initialize a per-load seed on mount to avoid SSR hydration mismatch
  useEffect(() => {
    // Use Math.random once on the client; no need to persist across navigation
    setSeed(Math.floor(Math.random() * 0x7fffffff));
  }, []);

  const panels = useMemo(() => {
    const TOTAL_SLOTS = 24;
    const baseSlots = Array.from({ length: panelCount }).map(
      (_, i) => Math.floor((i * TOTAL_SLOTS) / panelCount) + 1
    );
    // Vary which positions are used by rotating the evenly-spaced selection
    let slots = baseSlots;
    let sourceOrder = SOURCES;
    if (seed !== null) {
      const rng = makeRng(seed);
      const offset = randInt(rng, TOTAL_SLOTS);
      slots = baseSlots.map((s) => ((s - 1 + offset) % TOTAL_SLOTS) + 1);
      // Also vary which image maps to which slot
      sourceOrder = [...SOURCES];
      shuffleInPlace(sourceOrder, rng);
    }
    // Decide scale range based on density so layout stays pleasing
    const [minScale, maxScale] =
      panelCount >= 24
        ? [0.82, 1.25]
        : panelCount >= 16
        ? [0.88, 1.2]
        : [0.92, 1.18];

    const rng = seed !== null ? makeRng(seed ^ 0x9e3779b9) : null;
    const nextScale = () =>
      rng ? minScale + rng() * (maxScale - minScale) : 1;

    // Avoid repeats: use a unique image for each panel when available
    const uniqueCount = Math.min(slots.length, sourceOrder.length);
    const chosen = sourceOrder.slice(0, uniqueCount);
    // If there are more panels than images, wrap remaining
    return slots.map((slot, i) => ({
      idx: i,
      slot,
      src: chosen[i] ?? sourceOrder[i % sourceOrder.length],
      scale: nextScale(),
    }));
  }, [panelCount, seed]);

  return (
    <div className="hero-background-panels" aria-hidden>
      {panels.map((p) => (
        <div
          key={p.idx}
          className={`panel-hero panel-hero-${p.slot}`}
          style={{ scale: p.scale, transformOrigin: "50% 50%" }}
        >
          <Image
            src={p.src}
            alt="Manga panel"
            fill
            sizes="40vw"
            draggable={false}
          />
        </div>
      ))}
      <div className="hero-bottom-fade" />
    </div>
  );
}
