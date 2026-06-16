import * as React from "react";
import { cn } from "@/lib/utils";

// Brutalist speech bubble: sharp corners, ink border, hard offset shadow, side tail.
// character = cream fill / ink shadow / tail left · user = ink fill / red shadow / tail right.
// See CLAUDE.md §3 (Speech bubble).

interface BubbleProps {
  side: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function Bubble({ side, children, className }: BubbleProps) {
  const isUser = side === "right";

  return (
    <div
      className={cn(
        "relative inline-block max-w-full border-[2.5px] border-ink rounded-none px-3.5 py-3",
        "font-body text-sm leading-snug",
        isUser ? "bg-ink text-paper" : "bg-paper-raised text-ink",
        className
      )}
      style={{ boxShadow: isUser ? "var(--shadow-red)" : "var(--shadow)" }}
    >
      {children}

      {isUser ? (
        // Tail pointing right (single ink triangle — fill and border are both ink)
        <span
          aria-hidden
          className="absolute right-[-14px] top-3 h-0 w-0 border-t-[9px] border-b-[9px] border-t-transparent border-b-transparent border-l-[14px] border-l-ink"
        />
      ) : (
        <>
          {/* Outer ink triangle (the tail's border) */}
          <span
            aria-hidden
            className="absolute left-[-14px] top-3 h-0 w-0 border-t-[9px] border-b-[9px] border-t-transparent border-b-transparent border-r-[14px] border-r-ink"
          />
          {/* Inner fill triangle, inset so the ink reads as an outline */}
          <span
            aria-hidden
            className="absolute left-[-9px] top-[18px] h-0 w-0 border-t-[6px] border-b-[6px] border-t-transparent border-b-transparent border-r-[10px]"
            style={{ borderRightColor: "var(--paper-raised)" }}
          />
        </>
      )}
    </div>
  );
}

export default Bubble;
