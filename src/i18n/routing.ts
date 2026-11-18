import { defineRouting } from "next-intl/routing";

export const locales = ["es", "en", "pt", "ht"] as const;
export type AppLocale = (typeof locales)[number];

export const localeLabels: Record<AppLocale, { code: string; flag: string; name: string }> = {
  es: { code: "ES", flag: "🇪🇸", name: "Español" },
  en: { code: "EN", flag: "🇺🇸", name: "English" },
  pt: { code: "PT", flag: "🇧🇷", name: "Português" },
  ht: { code: "HT", flag: "🇭🇹", name: "Kreyòl" },
};

export const routing = defineRouting({
  locales,
  defaultLocale: "es",
  localePrefix: "always",
});
