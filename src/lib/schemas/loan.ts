import { z } from "zod";
import { downPaymentBounds } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import type { CurrencyFormat, LoanConfig } from "@/lib/schemas/site";

export interface LoanFormValues {
  price: number;
  downPayment: number;
  term: number;
  creditProfile: string;
}

/**
 * El schema se construye a partir de la configuración (site.json), de modo que
 * los límites de negocio viven en el JSON y no hardcodeados en el componente.
 */
export function createLoanFormSchema(config: LoanConfig, currency: CurrencyFormat) {
  const money = (n: number) => formatCurrency(n, currency);
  const { price, downPayment, terms, creditProfiles } = config;

  return z
    .object({
      price: z
        .number({ error: "Ingresa el precio del vehículo" })
        .min(price.min, `El precio mínimo es ${money(price.min)}`)
        .max(price.max, `El precio máximo es ${money(price.max)}`),
      downPayment: z
        .number({ error: "Ingresa tu pago inicial" })
        .min(0, "El pago inicial no puede ser negativo"),
      term: z
        .number({ error: "Selecciona un plazo" })
        .refine((t) => terms.includes(t), "Plazo no disponible"),
      creditProfile: z
        .string()
        .refine((id) => creditProfiles.some((p) => p.id === id), "Selecciona tu perfil de crédito"),
    })
    .superRefine((values, ctx) => {
      if (!Number.isFinite(values.price) || !Number.isFinite(values.downPayment)) return;
      // Si el precio ya es inválido, los límites del pago inicial no tienen sentido: evitamos ruido.
      if (values.price < price.min || values.price > price.max) return;
      const bounds = downPaymentBounds(values.price, config);

      if (values.downPayment < bounds.min) {
        ctx.addIssue({
          code: "custom",
          path: ["downPayment"],
          message: `Pago inicial mínimo: ${money(bounds.min)} (${downPayment.minPercent}%)`,
        });
      } else if (values.downPayment > bounds.max) {
        ctx.addIssue({
          code: "custom",
          path: ["downPayment"],
          message: `Pago inicial máximo: ${money(bounds.max)} (${downPayment.maxPercent}%)`,
        });
      }
    });
}
