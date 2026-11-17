import { assetUrl } from "@/lib/assets";
import type { Vehicle } from "@/lib/schemas/vehicle";
import { getSupabaseUrl } from "@/lib/supabase/env";
import type { DbVehicleWithImages } from "@/lib/supabase/types";

/** URL pública de una foto en el bucket `vehicles` de Supabase Storage. */
export function storagePublicUrl(path: string) {
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  const base = getSupabaseUrl();
  if (!base) return assetUrl(path);
  return `${base}/storage/v1/object/public/vehicles/${path.replace(/^\/+/, "")}`;
}

export function mapDbVehicle(row: DbVehicleWithImages): Vehicle {
  const images = [...(row.vehicle_images ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      src: storagePublicUrl(img.storage_path),
      alt: img.alt || `${row.year} ${row.make} ${row.model}`,
    }));

  return {
    id: row.id,
    slug: row.slug,
    stockNumber: row.stock_number,
    status: row.status,
    featured: row.featured,
    make: row.make,
    model: row.model,
    ...(row.trim ? { trim: row.trim } : {}),
    year: row.year,
    bodyType: row.body_type,
    price: Number(row.price),
    mileage: row.mileage,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    ...(row.drivetrain ? { drivetrain: row.drivetrain } : {}),
    ...(row.engine ? { engine: row.engine } : {}),
    ...(row.exterior_color ? { exteriorColor: row.exterior_color } : {}),
    ...(row.interior_color ? { interiorColor: row.interior_color } : {}),
    ...(row.vin ? { vin: row.vin } : {}),
    badges: row.badges ?? [],
    features: row.features ?? [],
    description: row.description ?? "",
    images:
      images.length > 0
        ? images
        : [{ src: "/images/brand/logo.png", alt: `${row.year} ${row.make} ${row.model}` }],
    ...(row.published_at ? { publishedAt: row.published_at } : {}),
  };
}

export function slugifyVehicle(input: {
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
}) {
  const base = [input.year, input.make, input.model, input.trim, input.stockNumber]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base;
}
