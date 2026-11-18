import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VehicleGrid } from "@/components/sections/catalog/VehicleGrid";
import { VehicleSearchBar } from "@/components/sections/catalog/VehicleSearchBar";
import { GlowButton } from "@/components/ui/GlowButton";
import { Link } from "@/i18n/navigation";
import { kikoWhatsApp } from "@/lib/brand";
import { DISCLAIMER_ES } from "@/lib/disclaimer";
import { hasActiveFilters, parseFilters } from "@/lib/vehicle-filters";
import type { BodyType } from "@/lib/schemas/vehicle";
import { getSiteConfig, getVehicleSearchIndex, getVehicles } from "@/services/dataService";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: t("inventoryTitle"),
    description: t("inventoryDescription"),
  };
}

export default async function InventoryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Catalog");
  const tHero = await getTranslations("Hero");
  const tWa = await getTranslations("WhatsApp");

  const filters = parseFilters(await searchParams);
  const [site, vehicles, searchIndex] = await Promise.all([
    getSiteConfig(),
    getVehicles(filters),
    getVehicleSearchIndex(),
  ]);
  const currency = { locale: site.locale.code, currency: site.locale.currency };

  const hasFilters = hasActiveFilters(filters);
  const noMatches = hasFilters && vehicles.length === 0;
  const list = noMatches ? await getVehicles() : vehicles;

  const BODY_CHIPS: Array<{ id: BodyType | ""; label: string }> = [
    { id: "", label: t("all") },
    { id: "suv", label: t("suv") },
    { id: "sedan", label: t("sedan") },
    { id: "pickup", label: t("pickup") },
    { id: "van", label: t("minivan") },
  ];

  return (
    <section className="bg-surface pb-24 pt-32 sm:pt-36">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("eyebrow")}</h1>
        <p className="mt-3 max-w-2xl text-navy-600">{t("inventoryLead")}</p>

        <VehicleSearchBar
          key={JSON.stringify(filters)}
          index={searchIndex}
          initial={filters}
          className="mt-8"
        />

        <div className="mt-6 flex flex-wrap gap-2">
          {BODY_CHIPS.map((chip) => {
            const active = (filters.bodyType ?? "") === chip.id;
            const href = chip.id ? `/inventario?bodyType=${chip.id}` : "/inventario";
            return (
              <Link
                key={chip.label}
                href={href}
                className={
                  active
                    ? "rounded-full bg-navy-900 px-4 py-2 text-sm font-bold text-white"
                    : "rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy-700 shadow-sm hover:bg-navy-50"
                }
              >
                {chip.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-navy-600">
            {list.length === 0
              ? t("nonePublished")
              : noMatches
                ? t("noExact")
                : t("count", { count: list.length })}
          </span>
          {hasFilters && (
            <Link href="/inventario" className="font-bold text-accent-600 hover:underline">
              {t("clearFilters")}
            </Link>
          )}
        </div>

        <div className="mt-10">
          {list.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-card">
              <p className="text-lg font-extrabold tracking-tight">{t("emptyTitle")}</p>
              <p className="mt-2 text-navy-600">{t("emptyLead")}</p>
              <GlowButton
                href={kikoWhatsApp(
                  site.business,
                  tWa("default", { name: site.business.contactName, business: site.business.name }),
                )}
                target="_blank"
                rel="noopener noreferrer"
                variant="accent"
                size="lg"
                className="mt-6"
              >
                {tHero("ctaWhatsApp")}
              </GlowButton>
            </div>
          ) : (
            <VehicleGrid vehicles={list} currency={currency} loan={site.loan} whatsapp={site.business.whatsapp} />
          )}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-navy-400">{DISCLAIMER_ES}</p>

        <div className="mt-10 flex justify-center">
          <GlowButton href="/#financiamiento" variant="dark" size="lg">
            {t("seeDownPayment")}
          </GlowButton>
        </div>
      </div>
    </section>
  );
}