import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Conservado por compatibilidad; ya no dispara animación. */
  animation?: string;
  delay?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  threshold?: number;
  className?: string;
}

/** Contenedor sin animación de entrada al hacer scroll. */
export function Reveal({ children, className }: RevealProps) {
  return <div className={className}>{children}</div>;
}
