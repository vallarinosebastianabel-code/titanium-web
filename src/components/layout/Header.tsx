import { getTranslations } from "next-intl/server";

import { Logo } from "@/components/ui/Logo";
import { Link } from "@/i18n/navigation";
import type { SiteConfig } from "@/lib/schemas/site";

import { HomeLink } from "./HomeLink";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileNav } from "./MobileNav";

const linkClass = "text-sm font-semibold text-navy-700 transition-colors hover:text-accent-600";

export async function Header({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("Nav");

  const items = [
    { href: "/#como-funciona" as const, label: t("howItWorks") },
    { href: "/#inventario" as const, label: t("inventory") },
    { href: "/#financiamiento" as const, label: t("financing") },
    { href: "/#quienes-somos" as const, label: t("about") },
    { href: "/#faq" as const, label: t("faq") },
    { href: "/#contacto" as const, label: t("contact") },
  ];

  const left = items.slice(0, 3);
  const right = items.slice(3);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-navy-100 bg-white/95 text-navy-900 shadow-sm backdrop-blur-md">
      <div className="mx-auto grid h-[4.5rem] max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-8">
        <div className="flex items-center justify-start">
          <MobileNav
            items={items}
            openLabel={t("openMenu")}
            closeLabel={t("closeMenu")}
            menuLabel={t("menu")}
          />
          <nav aria-label={t("primary")} className="hidden items-center gap-8 lg:flex">
            {left.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <HomeLink
          className="flex items-center justify-center"
          aria-label={t("homeAria", { name: business.name })}
        >
          <Logo priority className="h-12 sm:h-14" />
        </HomeLink>

        <div className="flex items-center justify-end gap-4">
          <nav aria-label={t("secondary")} className="hidden items-center gap-8 lg:flex">
            {right.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
