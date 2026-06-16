"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { popSfxAt, type SfxPool } from "./sfx";

// Brutalist button: sharp corners, ink border, hard offset shadow that lifts on
// hover and presses on active. Optional onomatopoeia pop. See CLAUDE.md §3.

type Variant = "primary" | "secondary" | "ink" | "ghost";
type Size = "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-red text-white",
  secondary: "bg-paper-raised text-ink",
  ink: "bg-ink text-paper",
  ghost: "bg-transparent text-ink hover:bg-ink/5",
};

const SIZE: Record<Size, string> = {
  md: "px-5 py-3 text-[13px]",
  lg: "px-7 py-3.5 text-[15px]",
};

// The hard-shadow lift/press, applied to every variant except ghost.
const RAISED =
  "[box-shadow:var(--shadow)] hover:[box-shadow:var(--shadow-lift)] active:[box-shadow:var(--shadow-sm)] " +
  "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5";

interface BaseProps {
  variant?: Variant;
  size?: Size;
  /** Fire a manga SFX pop at the click point. */
  sfx?: SfxPool;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  title?: string;
}

type ButtonProps = BaseProps & {
  href?: undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

type AnchorProps = BaseProps & {
  href: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

export function Button(props: ButtonProps | AnchorProps) {
  const {
    variant = "primary",
    size = "md",
    sfx,
    className,
    children,
    title,
  } = props;
  const ariaLabel = props["aria-label"];

  const classes = cn(
    "inline-flex items-center justify-center gap-2 select-none cursor-pointer",
    "font-body font-bold uppercase tracking-wide rounded-none",
    "border-[2.5px] border-ink transition-[transform,box-shadow] duration-100 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2",
    VARIANT[variant],
    variant !== "ghost" && RAISED,
    SIZE[size],
    className
  );

  if ("href" in props && props.href !== undefined) {
    return (
      <Link
        href={props.href}
        className={classes}
        title={title}
        aria-label={ariaLabel}
        onClick={(e) => {
          if (sfx) popSfxAt(sfx, e);
          props.onClick?.(e);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      title={title}
      aria-label={ariaLabel}
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={(e) => {
        if (sfx) popSfxAt(sfx, e);
        props.onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}

export default Button;
