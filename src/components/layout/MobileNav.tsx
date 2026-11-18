"use client";

import { useEffect, useId, useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/format";

import { LocaleSwitcher } from "./LocaleSwitcher";

type NavItem = { href: "/#como-funciona" | "/#inventario" | "/#financiamiento" | "/#quienes-somos" | "/#faq" | "/#contacto"; label: string };

interface MobileNavProps {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
  menuLabel: string;
}

export function MobileNav({ items, openLabel, closeLabel, menuLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl border border-navy-100 bg-white text-navy-900 transition hover:bg-navy-50"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <CloseIcon width={22} height={22} /> : <MenuIcon width={22} height={22} />}
      </button>

      <div
        className={cn(
          "fixed inset-x-0 top-[4.5rem] z-40 border-b border-navy-100 bg-white shadow-lg transition-[opacity,visibility] duration-200 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none",
        )}
        id={panelId}
        hidden={!open}
      >
        <nav aria-label={menuLabel} className="mx-auto flex max-h-[calc(100svh-4.5rem)] max-w-7xl flex-col gap-1 overflow-y-auto px-5 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 text-base font-bold text-navy-900 transition hover:bg-navy-50"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-navy-100 pt-4">
            <LocaleSwitcher />
          </div>
        </nav>
      </div>

      {open ? (
        <button
          type="button"
          aria-label={closeLabel}
          className="fixed inset-0 top-[4.5rem] z-30 bg-navy-950/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
