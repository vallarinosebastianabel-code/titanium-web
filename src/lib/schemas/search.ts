import { z } from "zod";

/** Valores de <select> siempre son string; "" significa "sin filtro". */
export const vehicleSearchSchema = z.object({
  make: z.string(),
  model: z.string(),
  maxPrice: z.string().regex(/^\d*$/, "Presupuesto inválido"),
});

export type VehicleSearchValues = z.infer<typeof vehicleSearchSchema>;
