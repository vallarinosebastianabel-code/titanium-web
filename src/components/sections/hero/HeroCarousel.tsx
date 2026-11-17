import Image from "next/image";

import { assetUrl } from "@/lib/assets";
import type { SiteConfig } from "@/lib/schemas/site";

type Delivery = SiteConfig["hero"]["deliveries"][number];

function DeliveryCard({ delivery, clone }: { delivery: Delivery; clone?: boolean }) {
  return (
    <figure
      data-marquee-clone={clone ? "" : undefined}
      aria-hidden={clone ? true : undefined}
      className="relative h-56 w-42 shrink-0 overflow-hidden rounded-2xl bg-navy-900 shadow-float ring-1 ring-white/15 sm:h-64 sm:w-48"
    >
      <Image
        src={assetUrl(delivery.src)}
        alt={clone ? "" : delivery.alt}
        fill
        sizes="(min-width: 640px) 192px, 168px"
        quality={90}
        className="object-cover object-[50%_60%]"
      />
    </figure>
  );
}

/**
 * Carrusel continuo con clientes recibiendo sus llaves. Server Component: solo CSS
 * (se pausa al pasar el cursor y se vuelve desplazable con `prefers-reduced-motion`).
 */
export function HeroCarousel({ deliveries }: { deliveries: Delivery[] }) {
  if (deliveries.length === 0) return null;

  return (
    <section aria-label="Clientes felices recibiendo sus llaves" className="marquee -mx-5 lg:-mx-8">
      <div className="marquee__track px-2">
        {deliveries.map((d) => (
          <DeliveryCard key={d.src} delivery={d} />
        ))}
        {deliveries.map((d) => (
          <DeliveryCard key={`${d.src}-clone`} delivery={d} clone />
        ))}
      </div>
    </section>
  );
}
