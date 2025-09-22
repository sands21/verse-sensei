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
];

export default function HeroCollage() {
  // Fewer panels on small screens to reduce work on mobile
  const [panelCount, setPanelCount] = useState<number>(8);

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

  const panels = useMemo(() => {
    const TOTAL_SLOTS = 24;
    const slots = Array.from({ length: panelCount }).map(
      (_, i) => Math.floor((i * TOTAL_SLOTS) / panelCount) + 1
    );
    return slots.map((slot, i) => ({
      idx: i,
      slot,
      src: SOURCES[i % SOURCES.length],
    }));
  }, [panelCount]);

  return (
    <div className="hero-background-panels" aria-hidden>
      {panels.map((p) => (
        <div key={p.idx} className={`panel-hero panel-hero-${p.slot}`}>
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
