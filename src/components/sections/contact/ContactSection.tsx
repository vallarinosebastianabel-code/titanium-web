import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { ClockIcon, MapPinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { kikoWhatsApp } from "@/lib/brand";
import { addressLines, mapsQuery } from "@/lib/format";
import type { SiteConfig } from "@/lib/schemas/site";

function InfoRow({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white/60">{title}</p>
        <div className="mt-0.5 font-semibold text-white">{children}</div>
      </div>
    </li>
  );
}

export async function ContactSection({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("Contact");
  const { address } = business;
  const lines = addressLines(address);
  const mapUrl =
    address.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(address))}`;
  const tel = `tel:${business.phone.replace(/[^\d+]/g, "")}`;
  const wa = kikoWhatsApp(business);

  return (
    <section id="contacto" className="bg-navy-950 py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title", { name: business.contactName })}
            description={t("lead")}
            className="[&_h2]:text-white [&_p]:text-white/70 [&_p:first-child]:text-accent-400"
          />
        </Reveal>

        <Reveal className="mt-16">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoRow icon={<WhatsAppIcon />} title={t("phoneTitle")}>
              <p>{business.phone}</p>
              <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
                <a href={wa} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline">
                  {t("whatsapp")}
                </a>
                <a href={tel} className="text-accent-400 hover:underline">
                  {t("call")}
                </a>
              </p>
            </InfoRow>
            <InfoRow icon={<MapPinIcon />} title={t("whereTitle")}>
              <address className="not-italic">
                {lines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-accent-400 hover:underline"
              >
                {t("directions")}
              </a>
            </InfoRow>
            <InfoRow icon={<ClockIcon />} title={t("hoursTitle")}>
              <dl className="mt-1 space-y-2 text-sm">
                {business.hours.map((h) => (
                  <div key={h.days}>
                    <dt className="font-medium text-white/60">{h.days}</dt>
                    <dd className="whitespace-nowrap">{h.hours}</dd>
                  </div>
                ))}
              </dl>
            </InfoRow>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}