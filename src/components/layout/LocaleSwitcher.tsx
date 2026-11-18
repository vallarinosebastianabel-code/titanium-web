"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, type AppLocale, locales } from "@/i18n/routing";
import { cn } from "@/lib/format";

export function LocaleSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  const onSelect = (next: AppLocale) => {
    if (next === locale) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const search = typeof window !== "undefined" ? window.location.search : "";
    startTransition(() => {
      router.replace(
        // Preserve query + hash; avoid Next.js scroll-to-top on locale change.
        `${pathname}${search}${hash}`,
        { locale: next, scroll: false },
      );
    });
  };

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn("flex items-center gap-1", pending && "opacity-60", className)}
    >
      {locales.map((code) => {
        const meta = localeLabels[code];
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => onSelect(code)}
            aria-current={active ? "true" : undefined}
            title={meta.name}
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition",
              active
                ? "bg-navy-900 text-white"
                : "text-navy-600 hover:bg-navy-50 hover:text-navy-900",
            )}
          >
            <span aria-hidden="true" className="text-sm leading-none">
              {meta.flag}
            </span>
            <span>{meta.code}</span>
          </button>
        );
      })}
    </div>
  );
}
