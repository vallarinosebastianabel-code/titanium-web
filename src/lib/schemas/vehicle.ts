import { z } from "zod";

export const BODY_TYPES = ["sedan", "suv", "pickup", "hatchback", "coupe", "van"] as const;
export const TRANSMISSIONS = ["automatic", "manual"] as const;
export const FUEL_TYPES = ["gasoline", "diesel", "hybrid", "electric"] as const;
export const VEHICLE_STATUSES = ["available", "reserved", "sold"] as const;

export const vehicleImageSchema = z.object({
  /** Ruta relativa al bucket (ej. "images/vehicles/v-001.jpg") o URL absoluta. */
  src: z.string().min(1),
  alt: z.string().min(1),
});

export const vehicleSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  stockNumber: z.string().min(1),
  status: z.enum(VEHICLE_STATUSES),
  featured: z.boolean().default(false),

  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  year: z.number().int().min(1980).max(2100),
  bodyType: z.enum(BODY_TYPES),

  price: z.number().positive(),
  mileage: z.number().int().nonnegative(),
  transmission: z.enum(TRANSMISSIONS),
  fuelType: z.enum(FUEL_TYPES),
  drivetrain: z.enum(["fwd", "rwd", "awd", "4x4"]).optional(),
  engine: z.string().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  vin: z.string().length(17).optional(),

  badges: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  description: z.string().default(""),
  images: z.array(vehicleImageSchema).min(1),

  publishedAt: z.string().optional(),
});

/** Archivo `data/vehicles.json` completo. */
export const vehicleCatalogSchema = z.object({
  /** Se incrementa al publicar; útil para invalidar cachés. */
  version: z.number().int().default(1),
  updatedAt: z.string().optional(),
  vehicles: z.array(vehicleSchema),
});

export type Vehicle = z.infer<typeof vehicleSchema>;
export type VehicleCatalog = z.infer<typeof vehicleCatalogSchema>;
export type BodyType = (typeof BODY_TYPES)[number];

/** Subconjunto mínimo que viaja al cliente para el buscador. */
export type VehicleSearchEntry = Pick<Vehicle, "make" | "model" | "trim" | "year" | "price" | "bodyType">;
