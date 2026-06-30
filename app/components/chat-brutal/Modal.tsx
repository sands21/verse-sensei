"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Reusable brutalist modal (preview). Solid-ink backdrop (NO blur), hard
// ink-bordered paper panel, snappy pop entrance, square ✕ close. Esc + backdrop
// click close. See CLAUDE.md §5 (Modals).

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: "top" | "center";
  ariaLabel?: string;
}

export function Modal({
  open,
  onClose,
  children,
  className,
  align = "center",
  ariaLabel,
}: ModalProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex justify-center px-4",
        align === "top" ? "items-start pt-[12vh]" : "items-center"
      )}
      onClick={onClose}
    >
      {/* Backdrop — solid ink, no blur */}
      <div
        className="absolute inset-0 bg-ink/60 duration-150 animate-in fade-in"
        aria-hidden
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full rounded-none border-[3px] border-ink bg-paper-raised duration-150 animate-in fade-in zoom-in-95 [box-shadow:7px_7px_0_var(--ink)]",
          className
        )}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute -right-[3px] -top-[3px] flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border-[3px] border-ink bg-paper-raised text-ink transition-transform duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
