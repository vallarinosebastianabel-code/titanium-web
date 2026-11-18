import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { GlowButton } from "@/components/ui/GlowButton";
import { ArrowRightIcon, CheckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { assetUrl } from "@/lib/assets";
import { kikoWhatsApp } from "@/lib/brand";
import type { SiteConfig } from "@/lib/schemas/site";

import { HeroCarousel } from "./HeroCarousel";
import { HeroVideo } from "./HeroVideo";

interface HeroProps {
  hero: SiteConfig["hero"];
  business: SiteConfig["business"];
}

/**
 * Server Component: el copy y el póster salen en el HTML inicial (SSR/SEO/LCP).
 * Solo el video es Client Component.
 */
export async function Hero({ hero, business }: HeroProps) {
  const t = await getTranslations("Hero");
  const tWa = await getTranslations("WhatsApp");
  const { media } = hero;
  const highlights = [t("highlight1"), t("highlight2"), t("highlight3")];

  return (
    <section id="inicio" className="relative isolate flex min-h-svh items-center overflow-hidden bg-navy-950 text-white">
      {media.poster && (
        <Image
          src={assetUrl(media.poster)}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-30 object-cover"
        />
      )}
      <HeroVideo
        mp4={media.mp4 && assetUrl(media.mp4)}
        webm={media.webm && assetUrl(media.webm)}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100"
      />

      <div className="absolute inset-0 -z-10 bg-linear-to-b from-navy-950/88 via-navy-950/72 to-navy-950/86" />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pb-12 pt-28 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {t("headline")}
          </h1>

          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-semibold text-white/90">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-accent-500 text-white">
                  <CheckIcon width={12} height={12} strokeWidth={3.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
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
              {t("ctaWhatsApp")}
            </GlowButton>
            <GlowButton href="/inventario" variant="light" size="lg">
              {t("ctaInventory")}
              <ArrowRightIcon width={20} height={20} />
            </GlowButton>
          </div>
        </div>

        <div>
          <HeroCarousel deliveries={hero.deliveries} />
        </div>
      </div>
    </section>
  );
}
