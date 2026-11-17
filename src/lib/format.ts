import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";

type Address = SiteConfig["business"]["address"];

/** Líneas para mostrar la dirección física (calle, ciudad/estado/ZIP, referencia). */
export function addressLines(address: Address): string[] {
  const lines: string[] = [];
  if (address.street) lines.push(address.street);
  const cityState = [address.city, address.state].filter(Boolean).join(", ");
  const cityLine = address.zip ? `${cityState} ${address.zip}` : cityState;
  if (cityLine) lines.push(cityLine);
  if (address.landmark) lines.push(address.landmark);
  return lines;
}

export function mapsQuery(address: Address): string {
  return [address.street, address.city, address.state, address.zip].filter(Boolean).join(", ");
}

export function formatCurrency(
  value: number,
  { locale, currency }: CurrencyFormat,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
    ...options,
  }).format(value);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function vehicleTitle(v: { year: number; make: string; model: string }) {
  return [v.year, v.make, v.model].filter(Boolean).join(" ");
}

export function whatsappLink(phoneDigits: string, message?: string) {
  const base = `https://wa.me/${phoneDigits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Concatena clases condicionalmente (sin dependencias extra). */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
