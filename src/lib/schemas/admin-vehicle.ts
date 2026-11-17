import { z } from "zod";

import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, VEHICLE_STATUSES } from "@/lib/schemas/vehicle";

const optionalText = z.string().trim().optional().or(z.literal(""));

/** Campos del formulario admin (sin fotos: van aparte). */
export const adminVehicleFormSchema = z.object({
  status: z.enum(VEHICLE_STATUSES),
  featured: z.boolean(),
  make: z.string().trim().min(1, "Marca requerida"),
  model: z.string().trim().min(1, "Modelo requerido"),
  year: z.number().int().min(1980).max(2100),
  bodyType: z.enum(BODY_TYPES),
  price: z.number().positive("Precio inválido"),
  mileage: z.number().int().nonnegative(),
  transmission: z.enum(TRANSMISSIONS),
  fuelType: z.enum(FUEL_TYPES),
  exteriorColor: optionalText,
  interiorColor: optionalText,
  vin: z
    .string()
    .trim()
    .refine((v) => !v || v.length === 17, "VIN debe tener 17 caracteres"),
  description: z.string(),
});

export type AdminVehicleFormValues = z.infer<typeof adminVehicleFormSchema>;

export function formToDbPayload(values: AdminVehicleFormValues, slug: string, stockNumber: string) {
  return {
    slug,
    stock_number: stockNumber,
    status: values.status,
    featured: values.featured,
    make: values.make,
    model: values.model,
    trim: null,
    year: values.year,
    body_type: values.bodyType,
    price: values.price,
    mileage: values.mileage,
    transmission: values.transmission,
    fuel_type: values.fuelType,
    drivetrain: null,
    engine: null,
    exterior_color: values.exteriorColor || null,
    interior_color: values.interiorColor || null,
    vin: values.vin || null,
    badges: [] as string[],
    features: [] as string[],
    description: values.description,
    published_at: values.status === "sold" ? null : new Date().toISOString(),
  };
}
