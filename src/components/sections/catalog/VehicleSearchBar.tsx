"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, type FormEvent } from "react";

import { GlowButton } from "@/components/ui/GlowButton";
import { SearchIcon } from "@/components/ui/icons";
import { SlimSelectField } from "@/components/ui/SlimSelectField";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";
import type { BodyType, VehicleSearchEntry } from "@/lib/schemas/vehicle";
import { BODY_LABEL, filterVehicles, type VehicleFilters } from "@/lib/vehicle-filters";

interface VehicleSearchBarProps {
  index: VehicleSearchEntry[];
  /** Valores iniciales (p. ej. los filtros activos en /inventario). */
  initial?: VehicleFilters;
  className?: string;
}

const uniqueSorted = <T,>(values: T[], compare: (a: T, b: T) => number) => [...new Set(values)].sort(compare);

const cell = "rounded-xl bg-white px-4 py-2.5 lg:rounded-none lg:bg-transparent";
const divider = "lg:border-l lg:border-navy-200/70";
const label = "mb-0.5 block text-xs font-semibold text-navy-500";

function catalogBodyLabel(type: BodyType, t: ReturnType<typeof useTranslations<"Catalog">>): string {
  switch (type) {
    case "van":
      return t("minivan");
    case "sedan":
    case "suv":
    case "pickup":
      return t(type);
    default:
      return BODY_LABEL[type];
  }
}

export function VehicleSearchBar({ index, initial = {}, className }: VehicleSearchBarProps) {
  const t = useTranslations("Catalog");
  const router = useRouter();
  const [q, setQ] = useState(initial.q ?? "");
  const [bodyType, setBodyType] = useState<string>(initial.bodyType ?? "");
  const [year, setYear] = useState(initial.year ? String(initial.year) : "");

  const bodyOptions = useMemo(
    () =>
      uniqueSorted(
        index.map((v) => v.bodyType),
        (a, b) => catalogBodyLabel(a, t).localeCompare(catalogBodyLabel(b, t)),
      ).map((type) => ({ value: type, text: catalogBodyLabel(type, t) })),
    [index, t],
  );

  const years = useMemo(() => {
    const pool = filterVehicles(index, { bodyType: (bodyType || undefined) as BodyType | undefined });
    return uniqueSorted(
      pool.map((v) => v.year),
      (a, b) => b - a,
    ).map(String);
  }, [index, bodyType]);

  const onBodyType = (value: string) => {
    setBodyType(value);
    const pool = filterVehicles(index, { bodyType: (value || undefined) as BodyType | undefined });
    if (year && !pool.some((v) => String(v.year) === year)) setYear("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (bodyType) params.set("bodyType", bodyType);
    if (year) params.set("year", year);
    const qs = params.toString();
    router.push(qs ? `/inventario?${qs}` : "/inventario");
  };

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn("rounded-3xl bg-white p-4 shadow-card ring-1 ring-navy-100 sm:p-5", className)}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
        <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">{t("searchTitle")}</h3>
        <p className="text-sm text-navy-500">{t("searchLead")}</p>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-surface p-2 ring-1 ring-navy-100 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-center lg:gap-0">
        <div className={cn(cell, "sm:col-span-2 lg:col-span-1")}>
          <label htmlFor="search-q" className={label}>
            {t("makeModel")}
          </label>
          <input
            id="search-q"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("placeholderQuery")}
            autoComplete="off"
            className="h-8 w-full bg-transparent text-[0.95rem] font-semibold text-navy-900 outline-none placeholder:font-medium placeholder:text-navy-400"
          />
        </div>

        <SlimSelectField
          label={t("bodyType")}
          placeholder={t("allTypes")}
          options={bodyOptions}
          value={bodyType}
          onChange={onBodyType}
          labelClassName={label}
          className={cn(cell, divider, "search-select")}
        />

        <SlimSelectField
          label={t("year")}
          placeholder={t("anyYear")}
          options={years.map((y) => ({ value: y, text: y }))}
          value={year}
          onChange={setYear}
          labelClassName={label}
          className={cn(cell, divider, "search-select")}
        />

        <GlowButton type="submit" className="w-full sm:col-span-2 lg:col-span-1 lg:ml-2 lg:h-full lg:w-auto">
          <SearchIcon width={18} height={18} />
          {t("searchCta")}
        </GlowButton>
      </div>
    </form>
  );
}