import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";
import { DISCLAIMER_EN, DISCLAIMER_ES } from "@/lib/disclaimer";
import { addressLines } from "@/lib/format";
import type { SiteConfig } from "@/lib/schemas/site";

import { HomeLink } from "./HomeLink";

export async function Footer({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("Footer");
  const tNav = await getTranslations("Nav");
  const { address } = business;
  const lines = addressLines(address);

  const links = [
    { href: "/#como-funciona" as const, label: tNav("howItWorks") },
    { href: "/#inventario" as const, label: tNav("inventory") },
    { href: "/#financiamiento" as const, label: tNav("financing") },
    { href: "/#quienes-somos" as const, label: tNav("about") },
    { href: "/#faq" as const, label: tNav("faq") },
    { href: "/#contacto" as const, label: tNav("contact") },
  ];

  return (
    <footer className="border-t border-white/10 bg-navy-950 text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <div>
          <HomeLink className="inline-flex" aria-label={tNav("homeAria", { name: business.name })}>
            <Logo variant="light" className="h-20" />
          </HomeLink>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{t("tagline")}</p>
          <p className="mt-2 text-sm">{t("sub", { voiceName: business.voiceName })}</p>
        </div>

        <nav aria-label={t("nav")}>
          <p className="text-sm font-bold uppercase tracking-wider text-white">{t("nav")}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <p className="font-bold uppercase tracking-wider text-white">{t("visit")}</p>
          <address className="mt-4 not-italic leading-relaxed">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
          <p className="mt-3">
            <a href={`tel:${business.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">
              {business.contactName} · {business.phone}
            </a>
            {business.email && (
              <>
                <br />
                <a href={`mailto:${business.email}`} className="hover:text-white">
                  {business.email}
                </a>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs leading-relaxed text-white/50 lg:px-8">
          <p>{t("rights", { year: new Date().getFullYear(), name: business.name })}</p>
          <p>{DISCLAIMER_EN}</p>
          <p>{DISCLAIMER_ES}</p>
        </div>
      </div>
    </footer>
  );
}
