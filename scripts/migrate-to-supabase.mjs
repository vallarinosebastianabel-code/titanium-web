/**
 * Migra public/bucket/data/vehicles.json + fotos a Supabase.
 *
 * Requisitos en .env:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node --env-file=.env scripts/migrate-to-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const catalog = JSON.parse(await readFile(path.join(root, "public/bucket/data/vehicles.json"), "utf8"));

function contentType(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

for (const v of catalog.vehicles) {
  const payload = {
    slug: v.slug,
    stock_number: v.stockNumber,
    status: v.status,
    featured: Boolean(v.featured),
    make: v.make,
    model: v.model,
    trim: v.trim ?? null,
    year: v.year,
    body_type: v.bodyType,
    price: v.price,
    mileage: v.mileage,
    transmission: v.transmission,
    fuel_type: v.fuelType,
    drivetrain: v.drivetrain ?? null,
    engine: v.engine ?? null,
    exterior_color: v.exteriorColor ?? null,
    interior_color: v.interiorColor ?? null,
    vin: v.vin ?? null,
    badges: v.badges ?? [],
    features: v.features ?? [],
    description: v.description ?? "",
    published_at: v.publishedAt ?? new Date().toISOString(),
  };

  const { data: existing } = await supabase.from("vehicles").select("id").eq("stock_number", v.stockNumber).maybeSingle();

  let vehicleId = existing?.id;
  if (vehicleId) {
    const { error } = await supabase.from("vehicles").update(payload).eq("id", vehicleId);
    if (error) throw new Error(`${v.stockNumber} update: ${error.message}`);
    await supabase.from("vehicle_images").delete().eq("vehicle_id", vehicleId);
  } else {
    const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();
    if (error) throw new Error(`${v.stockNumber} insert: ${error.message}`);
    vehicleId = data.id;
  }

  let order = 0;
  for (const image of v.images ?? []) {
    const localRel = image.src.replace(/^\/+/, "");
    const localPath = path.join(root, "public/bucket", localRel);
    let buffer;
    try {
      buffer = await readFile(localPath);
    } catch {
      console.warn("  skip missing", localRel);
      continue;
    }
    const filename = path.basename(localRel);
    const storagePath = `${vehicleId}/${filename}`;
    const { error: upErr } = await supabase.storage.from("vehicles").upload(storagePath, buffer, {
      contentType: contentType(filename),
      upsert: true,
    });
    if (upErr) throw new Error(`${storagePath}: ${upErr.message}`);
    const { error: imgErr } = await supabase.from("vehicle_images").insert({
      vehicle_id: vehicleId,
      storage_path: storagePath,
      alt: image.alt ?? "",
      sort_order: order++,
    });
    if (imgErr) throw new Error(`image row: ${imgErr.message}`);
  }

  console.log("ok", v.stockNumber, vehicleId);
}

console.log(`Migrados ${catalog.vehicles.length} vehículos`);
// silence unused
void readdir;
