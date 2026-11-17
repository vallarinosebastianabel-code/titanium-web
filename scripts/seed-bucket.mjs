/**
 * Genera `public/bucket/data/vehicles.json` a partir del inventario real.
 *
 * Las fotos salen de `scripts/import-stock.py` (public/bucket/images/vehicles/tm-<stock>-<n>.jpg);
 * este script cuenta cuántas hay por auto y arma el JSON.
 *
 * ⚠️  Marca, modelo, color y equipamiento se dedujeron de las fotos. AÑO, PRECIO, MILLAJE, trim,
 *     motor y tracción son ESTIMADOS: revísalos contra el VIN / la etiqueta de cada auto antes de publicar.
 *
 * Uso: node scripts/seed-bucket.mjs
 * En producción estos archivos viven en DigitalOcean Spaces y este script no se usa.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.join(process.cwd(), "public", "bucket");

const BASE = ["Bluetooth", "Cámara de reversa", "Apple CarPlay / Android Auto", "Control de crucero"];
const SUNROOF = "Quemacocos";
const LEATHER = "Asientos de cuero";

// stock, make, model, trim, year, body, price, mileage, fuel, drive, color, engine, featured, badges, extras
// (trim / drive / engine = null cuando no se pudo confirmar)
const rows = [
  [1000, "RAM", "1500", "Limited", 2021, "pickup", 46900, 52300, "gasoline", "4x4", "burgundy", "5.7L V8 HEMI", true, ["Destacado"], [SUNROOF, LEATHER]],
  [1001, "Ford", "F-150", "Limited", 2019, "pickup", 42900, 61200, "gasoline", "4x4", "white", "3.5L V6 EcoBoost", true, ["4x4"], [SUNROOF, LEATHER]],
  [1002, "Toyota", "Highlander", null, 2022, "suv", 38900, 41800, "gasoline", null, "silver", "3.5L V6", true, ["Tercera fila"], [SUNROOF, LEATHER]],
  [1003, "Toyota", "RAV4", null, 2022, "suv", 31900, 28400, "gasoline", "awd", "blue", "2.5L 4 cil.", true, ["Más vendido"], [SUNROOF]],
  [1004, "Honda", "CR-V", "EX", 2023, "suv", 30900, 22100, "gasoline", null, "silver", "1.5L Turbo", true, ["Casi nuevo"], [SUNROOF]],
  [1005, "Toyota", "Tacoma", "TRD Off-Road", 2020, "pickup", 34900, 44600, "gasoline", "4x4", "silver", "3.5L V6", true, ["4x4"], []],
  [1006, "Toyota", "Sienna", null, 2022, "van", 41900, 30900, "hybrid", null, "white", "2.5L Híbrido", false, ["Híbrido"], []],
  [1007, "Chevrolet", "Suburban", "LT", 2021, "suv", 48900, 49200, "gasoline", "4x4", "gray", "5.3L V8", false, ["Tercera fila"], [LEATHER]],
  [1008, "Chevrolet", "Silverado 1500", "Custom", 2022, "pickup", 35900, 38100, "gasoline", null, "white", null, false, [], []],
  [1009, "Toyota", "Tacoma", "TRD Off-Road", 2021, "pickup", 36900, 36300, "gasoline", "4x4", "white", "3.5L V6", false, ["4x4"], []],
  [1010, "Ford", "F-150", null, 2018, "pickup", 31900, 78400, "gasoline", null, "gray", null, false, [], [LEATHER]],
  [1011, "Toyota", "Highlander", null, 2021, "suv", 34900, 47500, "gasoline", null, "silver", "3.5L V6", false, [], []],
  [1012, "Honda", "Pilot", null, 2019, "suv", 27900, 66100, "gasoline", "awd", "black", "3.5L V6", false, ["Tercera fila"], [SUNROOF, LEATHER]],
  [1013, "Honda", "CR-V", "Sport Hybrid", 2023, "suv", 33900, 19400, "hybrid", "awd", "gray", "2.0L Híbrido", false, ["Híbrido"], [SUNROOF]],
  [1014, "Honda", "CR-V", null, 2018, "suv", 21900, 71200, "gasoline", null, "blue", "1.5L Turbo", false, [], [SUNROOF]],
  [1015, "Honda", "Accord", null, 2023, "sedan", 27900, 24300, "gasoline", "fwd", "black", "1.5L Turbo", false, [], [SUNROOF, LEATHER]],
  [1016, "Honda", "Accord", null, 2023, "sedan", 26900, 27100, "gasoline", "fwd", "red", "1.5L Turbo", false, [], [SUNROOF, LEATHER]],
  [1017, "Honda", "Accord", null, 2019, "sedan", 21900, 58400, "gasoline", "fwd", "silver", "1.5L Turbo", false, [], [SUNROOF]],
  [1018, "Toyota", "Corolla", "SE", 2021, "sedan", 19900, 35200, "gasoline", "fwd", "white", "2.0L 4 cil.", false, [], []],
];

const slugify = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const files = await readdir(path.join(root, "images", "vehicles"));

const vehicles = rows.map((r, i) => {
  const [stock, make, model, trim, year, bodyType, price, mileage, fuelType, drivetrain, color, engine, featured, badges, extras] = r;
  const title = [year, make, model, trim].filter(Boolean).join(" ");
  const count = files.filter((f) => new RegExp(`^tm-${stock}-\\d+\\.jpg$`).test(f)).length;
  if (count === 0) throw new Error(`Sin fotos para TM-${stock}`);

  return {
    id: `v-${String(i + 1).padStart(3, "0")}`,
    slug: slugify(`${title}-tm-${stock}`),
    stockNumber: `TM-${stock}`,
    status: "available",
    featured,
    make,
    model,
    ...(trim ? { trim } : {}),
    year,
    bodyType,
    price,
    mileage,
    transmission: "automatic",
    fuelType,
    ...(drivetrain ? { drivetrain } : {}),
    ...(engine ? { engine } : {}),
    exteriorColor: color,
    badges,
    features: [...BASE, ...extras],
    description: `${title} con historial verificado e inspección mecánica completa de 150 puntos.`,
    images: Array.from({ length: count }, (_, k) => ({
      src: `images/vehicles/tm-${stock}-${k + 1}.jpg`,
      alt: k === 0 ? title : `${title} – foto ${k + 1}`,
    })),
    publishedAt: new Date(Date.UTC(2026, 9, 12 - i)).toISOString(),
  };
});

await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(
  path.join(root, "data", "vehicles.json"),
  JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), vehicles }, null, 2) + "\n",
);

console.log(`Seeded ${vehicles.length} vehicles in ${root}`);
