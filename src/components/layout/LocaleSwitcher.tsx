"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, type AppLocale, locales } from "@/i18n/routing";
import { cn } from "@/lib/format";

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Nav");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = localeLabels[locale];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onSelect = (next: AppLocale) => {
    setOpen(false);
    if (next === locale) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = typeof window !== "undefined" ? window.location.search : "";
    startTransition(() => {
      router.replace(`${pathname}${search}${hash}`, { locale: next, scroll: false });
    });
  };

  return (
    <div ref={rootRef} className={cn("relative", pending && "opacity-60", className)}>
      <button
        type="button"
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t("language")}
        title={current.name}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-navy-100 bg-white px-2.5 text-xs font-bold text-navy-800 transition hover:bg-navy-50"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {current.flag}
        </span>
        <span>{current.code}</span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-navy-400 transition", open && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t("language")}
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[9.5rem] overflow-hidden rounded-xl border border-navy-100 bg-white py-1 shadow-lg"
        >
          {locales.map((code) => {
            const meta = localeLabels[code];
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onSelect(code)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold transition",
                    active ? "bg-navy-900 text-white" : "text-navy-700 hover:bg-navy-50",
                  )}
                >
                  <span aria-hidden="true" className="text-base leading-none">
                    {meta.flag}
                  </span>
                  <span>{meta.code}</span>
                  <span className={cn("font-semibold", active ? "text-white/70" : "text-navy-400")}>
                    {meta.name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
