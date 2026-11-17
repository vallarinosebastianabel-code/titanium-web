import type { Metadata } from "next";
import Link from "next/link";

import { VehicleGrid } from "@/components/sections/catalog/VehicleGrid";
import { VehicleSearchBar } from "@/components/sections/catalog/VehicleSearchBar";
import { GlowButton } from "@/components/ui/GlowButton";
import { kikoWhatsApp } from "@/lib/brand";
import { DISCLAIMER_ES } from "@/lib/disclaimer";
import { hasActiveFilters, parseFilters } from "@/lib/vehicle-filters";
import type { BodyType } from "@/lib/schemas/vehicle";
import { getSiteConfig, getVehicleSearchIndex, getVehicles } from "@/services/dataService";

export const metadata: Metadata = {
  title: "Inventario",
  description: "Carros listos para rodar en Broward. Título limpio (Clean Title). Precio a financiar, no de contado.",
};

const BODY_CHIPS: Array<{ id: BodyType | ""; label: string }> = [
  { id: "", label: "Todos" },
  { id: "suv", label: "SUV" },
  { id: "sedan", label: "Sedán" },
  { id: "pickup", label: "Pickup" },
  { id: "van", label: "Minivan" },
];

export default async function InventoryPage({ searchParams }: PageProps<"/inventario">) {
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

  return (
    <section className="bg-surface pb-24 pt-32 sm:pt-36">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Inventario</h1>
        <p className="mt-3 max-w-2xl text-navy-600">
          Precio a financiar. Título limpio. Elegí el tipo de carro que necesitás.
        </p>

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
              ? "No hay carros publicados ahora"
              : noMatches
                ? "Sin coincidencias · te mostramos el stock completo"
                : `${list.length} carros`}
          </span>
          {hasFilters && (
            <Link href="/inventario" className="font-bold text-accent-600 hover:underline">
              Limpiar filtros
            </Link>
          )}
        </div>

        <div className="mt-10">
          {list.length === 0 ? (
            <div className="rounded-3xl bg-white px-6 py-14 text-center shadow-card">
              <p className="text-lg font-extrabold tracking-tight">Por ahora no hay unidades en la web</p>
              <p className="mt-2 text-navy-600">Escribime a Sebastián y te contamos qué está entrando.</p>
              <GlowButton
                href={kikoWhatsApp(site.business)}
                target="_blank"
                rel="noopener noreferrer"
                variant="accent"
                size="lg"
                className="mt-6"
              >
                Escribime por WhatsApp
              </GlowButton>
            </div>
          ) : (
            <VehicleGrid vehicles={list} currency={currency} loan={site.loan} whatsapp={site.business.whatsapp} />
          )}
        </div>

        <p className="mx-auto mt-10 max-w-3xl text-center text-xs leading-relaxed text-navy-400">{DISCLAIMER_ES}</p>

        <div className="mt-10 flex justify-center">
          <GlowButton href="/#financiamiento" variant="dark" size="lg">
            Ver inicial y cuota
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
