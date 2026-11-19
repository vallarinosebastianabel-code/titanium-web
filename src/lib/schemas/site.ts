import { z } from "zod";

const creditProfileSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  /** APR anual en porcentaje (ej. 7.9). */
  apr: z.number().min(0).max(60),
});

export const loanConfigSchema = z.object({
  price: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    step: z.number().positive(),
    default: z.number().positive(),
  }),
  downPayment: z.object({
    /** Monto mínimo de inicial (USD). */
    minAmount: z.number().nonnegative(),
    step: z.number().positive(),
    /** Inicial por defecto al elegir un carro. */
    defaultAmount: z.number().nonnegative(),
  }),
  /** Plazos disponibles, en meses. */
  terms: z.array(z.number().int().positive()).min(2),
  defaultTerm: z.number().int().positive(),
  creditProfiles: z.array(creditProfileSchema).min(1),
  defaultCreditProfile: z.string().min(1),
  disclaimer: z.string(),
});

export const siteConfigSchema = z.object({
  business: z.object({
    name: z.string(),
    tagline: z.string(),
    /** Nombre de la persona de contacto (WhatsApp y llamada). */
    contactName: z.string().min(1),
    /** Cómo se presenta la voz cercana (Kiko). */
    voiceName: z.string().min(1),
    phone: z.string(),
    /** Solo dígitos con código de país, para wa.me. */
    whatsapp: z.string().regex(/^\d{8,15}$/),
    email: z.string().email().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string(),
      state: z.string(),
      zip: z.string().optional(),
      area: z.string().optional(),
      /** Referencia local (ej. "Esquina"). */
      landmark: z.string().optional(),
      mapUrl: z.string().url().optional(),
    }),
    hours: z.array(z.object({ days: z.string(), hours: z.string() })),
  }),
  locale: z.object({
    /** BCP-47, p. ej. "es-US". */
    code: z.string(),
    currency: z.string().length(3),
  }),
  hero: z.object({
    headline: z.string(),
    media: z.object({
      /** Rutas relativas al bucket. */
      mp4: z.string().optional(),
      webm: z.string().optional(),
      poster: z.string().optional(),
    }),
    highlights: z.array(z.string()),
    /** Fotos de clientes recibiendo sus llaves (carrusel del hero). */
    deliveries: z
      .array(z.object({ src: z.string().min(1), alt: z.string().min(1), caption: z.string().optional() }))
      .default([]),
    /** Presupuestos máximos ofrecidos en el buscador. */
    budgetOptions: z.array(z.number().positive()).min(1),
  }),
  trust: z.object({
    rating: z.object({
      score: z.number().min(0).max(5),
      count: z.number().int().nonnegative(),
      source: z.string(),
    }),
    stats: z.array(z.object({ value: z.string(), label: z.string() })).min(1),
  }),
  loan: loanConfigSchema,
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
export type LoanConfig = z.infer<typeof loanConfigSchema>;
export type CurrencyFormat = { locale: string; currency: string };
