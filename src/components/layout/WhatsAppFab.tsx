import { getTranslations } from "next-intl/server";

import { WhatsAppIcon } from "@/components/ui/icons";
import { kikoWhatsApp } from "@/lib/brand";
import type { SiteConfig } from "@/lib/schemas/site";

/** Botón flotante de WhatsApp, fijo abajo a la derecha en toda la web. */
export async function WhatsAppFab({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("Fab");
  return (
    <a
      href={kikoWhatsApp(business)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("aria")}
      title={t("title")}
      className="fixed bottom-5 right-5 z-40 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 transition duration-200 hover:scale-110 hover:bg-[#20bd5a] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#128C7E] sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon width={30} height={30} />
    </a>
  );
}
