"use client";

import { useEffect } from "react";

export default function HeroMotion() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (e: MouseEvent) => {
      if (reduce.matches) return;
      const rect = hero.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * 18; // px movement for background
      targetY = relY * 18;
      schedule();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0;
      // ease toward target
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      hero.style.setProperty("--hero-panels-x", `${-currentX}px`);
      hero.style.setProperty("--hero-panels-y", `${-currentY}px`);
      hero.style.setProperty("--hero-fg-x", `${currentX * 0.45}px`);
      hero.style.setProperty("--hero-fg-y", `${currentY * 0.45}px`);
      if (
        Math.abs(currentX - targetX) > 0.2 ||
        Math.abs(currentY - targetY) > 0.2
      )
        schedule();
    };

    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
