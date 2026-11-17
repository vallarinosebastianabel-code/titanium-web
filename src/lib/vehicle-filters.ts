import type { BodyType, VehicleSearchEntry } from "@/lib/schemas/vehicle";
import { BODY_TYPES } from "@/lib/schemas/vehicle";

export const BODY_LABEL: Record<BodyType, string> = {
  sedan: "Sedán",
  suv: "SUV",
  pickup: "Pickup",
  hatchback: "Hatchback",
  coupe: "Coupé",
  van: "Van",
};

export interface VehicleFilters {
  /** Texto libre: marca, modelo o versión. */
  q?: string;
  make?: string;
  model?: string;
  year?: number;
  maxPrice?: number;
  bodyType?: BodyType;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

function matchesText(v: VehicleSearchEntry, q: string): boolean {
  const haystack = normalize([v.year, v.make, v.model, v.trim].filter(Boolean).join(" "));
  const compact = haystack.replace(/ /g, "");
  return normalize(q)
    .split(" ")
    .filter(Boolean)
    .every((token) => haystack.includes(token) || compact.includes(token));
}

/** Puro e isomórfico: lo usan el servidor (resultados) y el cliente (buscador). */
export function filterVehicles<T extends VehicleSearchEntry>(list: T[], filters: VehicleFilters): T[] {
  const { q, make, model, year, maxPrice, bodyType } = filters;
  return list.filter(
    (v) =>
      (!make || v.make === make) &&
      (!model || v.model === model) &&
      (!year || v.year === year) &&
      (!bodyType || v.bodyType === bodyType) &&
      (!maxPrice || v.price <= maxPrice) &&
      (!q || matchesText(v, q)),
  );
}

export function parseFilters(params: Record<string, string | string[] | undefined>): VehicleFilters {
  const one = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const maxPrice = Number(one("maxPrice"));
  const year = Number(one("year"));
  const bodyType = one("bodyType");
  return {
    q: one("q")?.trim() || undefined,
    make: one("make") || undefined,
    model: one("model") || undefined,
    year: Number.isInteger(year) && year > 1900 ? year : undefined,
    bodyType: BODY_TYPES.includes(bodyType as BodyType) ? (bodyType as BodyType) : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : undefined,
  };
}

export const hasActiveFilters = (f: VehicleFilters) =>
  Boolean(f.q || f.make || f.model || f.year || f.maxPrice || f.bodyType);
