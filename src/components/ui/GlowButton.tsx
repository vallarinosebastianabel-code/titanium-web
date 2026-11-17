"use client";

import Link from "next/link";
import {
  useRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/format";

type Variant = "dark" | "accent" | "light";
type Size = "md" | "lg";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CommonProps | "href"> & { href: string };

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps> & { href?: undefined };

export type GlowButtonProps = AnchorProps | NativeButtonProps;

const sizes: Record<Size, string> = {
  md: "px-5 py-3 text-sm",
  lg: "px-7 py-4 text-base",
};

/**
 * Botón principal con el efecto "glowy hover" del CodePen (overlay enmascarado que
 * sigue al puntero). El overlay duplica el contenido y es invisible para lectores de pantalla.
 */
export function GlowButton(props: GlowButtonProps) {
  const { variant = "dark", size = "md", className, children, ...rest } = props;
  const overlayRef = useRef<HTMLSpanElement>(null);

  const move = (e: PointerEvent<HTMLElement>) => {
    const overlay = overlayRef.current;
    if (!overlay || e.pointerType === "touch") return;
    const rect = e.currentTarget.getBoundingClientRect();
    overlay.style.setProperty("--opacity", "1");
    overlay.style.setProperty("--x", `${e.clientX - rect.left}px`);
    overlay.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  const leave = () => overlayRef.current?.style.setProperty("--opacity", "0");

  const classes = cn(
    "glow-btn",
    variant === "accent" && "glow-btn--accent",
    variant === "light" && "glow-btn--light",
    sizes[size],
    className,
  );

  const inner = (
    <>
      <span className="glow-btn__label">{children}</span>
      <span ref={overlayRef} className="glow-btn__overlay" aria-hidden="true">
        {children}
      </span>
    </>
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest;
    const Tag = href.startsWith("/") || href.startsWith("#") ? Link : "a";
    return (
      <Tag href={href} className={classes} onPointerMove={move} onPointerLeave={leave} {...anchorRest}>
        {inner}
      </Tag>
    );
  }

  const { type = "button", ...buttonRest } = rest as NativeButtonProps;
  return (
    <button type={type} className={classes} onPointerMove={move} onPointerLeave={leave} {...buttonRest}>
      {inner}
    </button>
  );
}
