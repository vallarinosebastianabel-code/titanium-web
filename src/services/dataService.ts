import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import type { ZodType } from "zod";

import { BUCKET_URL, isRemoteBucket } from "@/lib/assets";
import {
  faqFileSchema,
  testimonialsFileSchema,
  type FaqItem,
  type Testimonial,
} from "@/lib/schemas/content";
import { siteConfigSchema, type SiteConfig } from "@/lib/schemas/site";
import {
  vehicleCatalogSchema,
  type Vehicle,
  type VehicleSearchEntry,
} from "@/lib/schemas/vehicle";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { mapDbVehicle } from "@/lib/supabase/map-vehicle";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { DbVehicleWithImages } from "@/lib/supabase/types";
import { filterVehicles, type VehicleFilters } from "@/lib/vehicle-filters";

/**
 * Capa de acceso a datos.
 *
 * Inventario:
 *   - Si hay Supabase configurado → Postgres
 *   - Si no → JSON del bucket (public/bucket o Spaces)
 *
 * site / faqs / testimonials siguen en JSON del bucket.
 */

const REVALIDATE_SECONDS = Number(process.env.DATA_REVALIDATE_SECONDS ?? 300);

const VEHICLE_SELECT = "*, vehicle_images(*)";

export class DataServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DataServiceError";
  }
}

async function readRawJson(file: string): Promise<unknown> {
  try {
    if (isRemoteBucket) {
      const res = await fetch(`${BUCKET_URL}/data/${file}`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    }

    const absolute = path.join(process.cwd(), "public", BUCKET_URL, "data", file);
    return JSON.parse(await readFile(absolute, "utf8"));
  } catch (error) {
    throw new DataServiceError(`No se pudo cargar "${file}" desde ${BUCKET_URL}`, { cause: error });
  }
}

async function loadJson<T>(file: string, schema: ZodType<T>): Promise<T> {
  const parsed = schema.safeParse(await readRawJson(file));
  if (!parsed.success) {
    throw new DataServiceError(`"${file}" no cumple el esquema: ${parsed.error.message}`);
  }
  return parsed.data;
}

const loadSite = cache(() => loadJson("site.json", siteConfigSchema));
const loadCatalog = cache(() => loadJson("vehicles.json", vehicleCatalogSchema));
const loadTestimonials = cache(() => loadJson("testimonials.json", testimonialsFileSchema));
const loadFaqs = cache(() => loadJson("faqs.json", faqFileSchema));

async function loadVehiclesFromSupabase(): Promise<Vehicle[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error) throw new DataServiceError(`Supabase vehicles: ${error.message}`);
  return ((data ?? []) as DbVehicleWithImages[]).map(mapDbVehicle);
}

const loadAllVehicles = cache(async (): Promise<Vehicle[]> => {
  if (isSupabaseConfigured()) return loadVehiclesFromSupabase();
  const { vehicles } = await loadCatalog();
  return vehicles;
});

export async function getSiteConfig(): Promise<SiteConfig> {
  return loadSite();
}

/** Vehículos publicables (excluye vendidos). Destacados primero, luego más recientes. */
export async function getVehicles(filters: VehicleFilters = {}): Promise<Vehicle[]> {
  const visible = (await loadAllVehicles()).filter((v) => v.status !== "sold");

  return filterVehicles(visible, filters).sort(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
  );
}

/** Todos los vehículos (incl. sold) — solo panel admin. */
export async function getAllVehiclesForAdmin(): Promise<Vehicle[]> {
  if (!isSupabaseConfigured()) {
    const { vehicles } = await loadCatalog();
    return vehicles;
  }
  return loadVehiclesFromSupabase();
}

export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  const vehicles = await getVehicles();
  return vehicles.slice(0, limit);
}

export async function getVehicleBySlug(slug: string): Promise<Vehicle | undefined> {
  return (await loadAllVehicles()).find((v) => v.slug === slug);
}

export async function getVehicleById(id: string): Promise<Vehicle | undefined> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase.from("vehicles").select(VEHICLE_SELECT).eq("id", id).maybeSingle();
    if (error) throw new DataServiceError(`Supabase vehicle ${id}: ${error.message}`);
    return data ? mapDbVehicle(data as DbVehicleWithImages) : undefined;
  }
  return (await loadAllVehicles()).find((v) => v.id === id);
}

/** Índice liviano (marca/modelo/año/tipo) para los selects del buscador. */
export async function getVehicleSearchIndex(): Promise<VehicleSearchEntry[]> {
  const vehicles = await getVehicles();
  return vehicles.map(({ make, model, trim, year, price, bodyType }) => ({ make, model, trim, year, price, bodyType }));
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const { testimonials } = await loadTestimonials();
  return testimonials;
}

export async function getFaqs(): Promise<FaqItem[]> {
  const { faqs } = await loadFaqs();
  return faqs;
}
