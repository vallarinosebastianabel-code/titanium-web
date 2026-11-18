"use client";

import type { MouseEvent, ReactNode } from "react";

import { Link, usePathname } from "@/i18n/navigation";

interface HomeLinkProps {
  className?: string;
  "aria-label"?: string;
  children: ReactNode;
}

/** Lleva siempre al inicio de la home, también si ya estás en ella (con o sin #ancla). */
export function HomeLink({ children, ...rest }: HomeLinkProps) {
  const pathname = usePathname();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/" || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (window.location.hash) {
      const { pathname: path } = window.location;
      window.history.replaceState(window.history.state, "", path);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Link href="/" onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
