import { getTranslations } from "next-intl/server";

import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteConfig } from "@/lib/schemas/site";

export async function AboutSection({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("About");
  const { address } = business;
  const place = [address.street, address.city, address.state].filter(Boolean).join(", ");

  return (
    <section id="quienes-somos" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description", { place })}
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          <Reveal animation="fade-in-left">
            <article className="h-full rounded-3xl bg-navy-950 p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-400">{t("dealerLabel")}</p>
              <h3 className="mt-3 text-2xl font-extrabold">{t("dealerTitle")}</h3>
              <p className="mt-3 leading-relaxed text-white/80">
                {t("dealerBody", { voiceName: business.voiceName })}
              </p>
            </article>
          </Reveal>
          <Reveal animation="fade-in-right" delay={2}>
            <article className="h-full rounded-3xl border border-navy-100 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">{t("contactLabel")}</p>
              <h3 className="mt-3 text-2xl font-extrabold">{business.contactName}</h3>
              <p className="mt-3 leading-relaxed text-navy-600">{t("contactBody", { phone: business.phone })}</p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}