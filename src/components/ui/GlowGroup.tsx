"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { cn } from "@/lib/format";

interface GlowGroupProps {
  /** Clases del contenedor de tarjetas (grid/flex). Se aplican igual a la capa base y al overlay. */
  className?: string;
  /** Elementos hijos directos con la clase `.glow-card`. */
  children: ReactNode;
}

const subscribe = () => () => {};
/** `false` en SSR/hidratación, `true` ya en el cliente. */
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

/**
 * Port a React del CodePen "glowy hover effect":
 * renderiza los hijos dos veces (capa real + overlay clonado y enmascarado) y mueve el
 * centro del radial-gradient con el puntero. Todo vía CSS variables -> cero re-renders.
 *
 * El clon se monta solo tras la hidratación: el HTML del servidor (SEO, peso) contiene
 * cada tarjeta una única vez.
 */
export function GlowGroup({ className, children }: GlowGroupProps) {
  const hydrated = useHydrated();
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const overlay = overlayRef.current;
    if (!hydrated || !root || !overlay) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = root.getBoundingClientRect();
        overlay.style.setProperty("--opacity", "1");
        overlay.style.setProperty("--x", `${e.clientX - rect.left}px`);
        overlay.style.setProperty("--y", `${e.clientY - rect.top}px`);
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", onMove);
    };
  }, [hydrated]);

  return (
    <div ref={rootRef} className="glow-group">
      <div className={className}>{children}</div>
      {hydrated && (
        <div ref={overlayRef} className={cn(className, "glow-overlay")} aria-hidden="true" inert>
          {children}
        </div>
      )}
    </div>
  );
}
