import { whatsappLink } from "@/lib/format";
import type { SiteConfig } from "@/lib/schemas/site";

/** Mensajes de WhatsApp con nombre de persona, como pide el brief. */
export function kikoWhatsApp(business: SiteConfig["business"], message?: string) {
  const text = message ?? `Hola ${business.contactName}, vi la web de ${business.name} y quiero un carro.`;
  return whatsappLink(business.whatsapp, text);
}

export function vehicleWhatsApp(whatsapp: string, title: string, stockNumber: string) {
  return whatsappLink(
    whatsapp,
    `Hola Sebastián, me interesa el ${title} (Stock ${stockNumber}). ¿Me confirmas inicial y si está disponible?`,
  );
}
