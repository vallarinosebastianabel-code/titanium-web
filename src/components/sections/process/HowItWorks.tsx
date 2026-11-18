import { getTranslations } from "next-intl/server";

import { GlowButton } from "@/components/ui/GlowButton";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { kikoWhatsApp } from "@/lib/brand";
import type { SiteConfig } from "@/lib/schemas/site";

const STEP_KEYS = [
  { n: "1", title: "step1Title", text: "step1Text" },
  { n: "2", title: "step2Title", text: "step2Text" },
  { n: "3", title: "step3Title", text: "step3Text" },
] as const;

export async function HowItWorks({ business }: { business: SiteConfig["business"] }) {
  const t = await getTranslations("HowItWorks");
  const tWa = await getTranslations("WhatsApp");

  return (
    <section id="como-funciona" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow={t("eyebrow")} title={t("title")} />
        </Reveal>

        <ol className="mt-14 grid gap-5 sm:grid-cols-3">
          {STEP_KEYS.map((step, i) => (
            <Reveal key={step.n} delay={(i + 1) as 1 | 2 | 3 | 4} animation="fade-in-bottom">
              <li className="h-full rounded-3xl border border-navy-100 bg-surface p-6">
                <span className="grid size-10 place-items-center rounded-full bg-navy-900 text-sm font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight">{t(step.title)}</h3>
                <p className="mt-2 leading-relaxed text-navy-600">{t(step.text)}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <GlowButton
            href={kikoWhatsApp(
              business,
              tWa("default", { name: business.contactName, business: business.name }),
            )}
            target="_blank"
            rel="noopener noreferrer"
            variant="accent"
            size="lg"
          >
            <WhatsAppIcon width={20} height={20} />
            {t("cta")}
          </GlowButton>
        </div>
      </div>
    </section>
  );
}