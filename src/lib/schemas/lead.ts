import { z } from "zod";

export const LEAD_SOURCES = ["prequalify", "hero"] as const;

/** Compartido entre formularios (cliente) y `/api/leads` (servidor). */
export const leadSchema = z.object({
  name: z.string().trim().min(2, "Ingresa tu nombre").max(80, "Nombre demasiado largo"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{7,20}$/, "Ingresa un teléfono válido"),
  email: z.string().trim().email("Ingresa un correo válido"),
  topic: z.string().max(60).optional(),
  message: z.string().trim().max(1000, "Máximo 1000 caracteres").optional(),
  consent: z.boolean().refine((v) => v === true, "Debes aceptar para continuar"),
  source: z.enum(LEAD_SOURCES),
  /** Resumen de la simulación, si el lead viene del simulador. */
  simulation: z
    .object({
      price: z.number(),
      downPayment: z.number(),
      term: z.number(),
      apr: z.number(),
      monthly: z.number(),
      /** Auto del inventario sobre el que se calculó la cuota. */
      vehicle: z.object({ stockNumber: z.string(), title: z.string() }).optional(),
    })
    .optional(),
  /** Honeypot anti-bots: debe llegar vacío (el servidor lo descarta en silencio si no). */
  website: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
