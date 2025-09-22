"use client";

import Image from "next/image";

const SOURCES = [
  "/images/panels/naruto.webp",
  "/images/panels/attack-on-titan.avif",
  "/images/panels/zoro.jpg",
  "/images/panels/demon.jpg",
  "/images/panels/sukuna.jpg",
  "/images/panels/random.jpg",
];

export default function HeroCollage() {
  // 24 panels for denser coverage; classes will dictate chaos
  const panels = Array.from({ length: 24 }).map((_, i) => ({
    idx: i,
    src: SOURCES[i % SOURCES.length],
  }));

  return (
    <div className="hero-background-panels" aria-hidden>
      {panels.map((p) => (
        <div key={p.idx} className={`panel-hero panel-hero-${p.idx + 1}`}>
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
