import Link from "next/link";

import { Logo } from "@/components/ui/Logo";

import { HomeLink } from "./HomeLink";
import type { SiteConfig } from "@/lib/schemas/site";

const NAV_LEFT = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#inventario", label: "Inventario" },
  { href: "/#financiamiento", label: "Financiamiento" },
];

const NAV_RIGHT = [
  { href: "/#quienes-somos", label: "Quiénes somos" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
];

const linkClass = "text-sm font-semibold text-navy-700 transition-colors hover:text-accent-600";

function NavGroup({ items, label, className }: { items: typeof NAV_LEFT; label: string; className: string }) {
  return (
    <nav aria-label={label} className={`hidden items-center gap-8 lg:flex ${className}`}>
      {items.map((item) => (
        <Link key={item.href} href={item.href} className={linkClass}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Header({ business }: { business: SiteConfig["business"] }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-navy-100 bg-white/95 text-navy-900 shadow-sm backdrop-blur-md">
      <div className="mx-auto grid h-[4.5rem] max-w-7xl grid-cols-1 items-center px-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-8">
        <NavGroup items={NAV_LEFT} label="Principal" className="justify-start" />

        <HomeLink className="flex items-center justify-center" aria-label={`${business.name} – Inicio`}>
          <Logo priority className="h-14" />
        </HomeLink>

        <NavGroup items={NAV_RIGHT} label="Secundaria" className="justify-end" />
      </div>
    </header>
  );
}
