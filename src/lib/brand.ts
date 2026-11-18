import { whatsappLink } from "@/lib/format";
import type { SiteConfig } from "@/lib/schemas/site";

/** Mensajes de WhatsApp con nombre de persona, como pide el brief. */
export function kikoWhatsApp(business: SiteConfig["business"], message?: string) {
  const text = message ?? `Hola ${business.contactName}, vi la web de ${business.name} y quiero un carro.`;
  return whatsappLink(business.whatsapp, text);
}

export function vehicleWhatsApp(
  whatsapp: string,
  title: string,
  stockNumber: string,
  message?: string,
) {
  return whatsappLink(
    whatsapp,
    message ??
      `Hola Sebastián, me interesa el ${title} (Stock ${stockNumber}). ¿Me confirmás inicial y si está disponible?`,
  );
}
