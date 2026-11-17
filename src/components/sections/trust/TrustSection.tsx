import { StarIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { assetUrl } from "@/lib/assets";
import type { Testimonial } from "@/lib/schemas/content";
import type { SiteConfig } from "@/lib/schemas/site";

import { TestimonialCarousel, type TestimonialView } from "./TestimonialCarousel";

interface TrustSectionProps {
  trust: SiteConfig["trust"];
  testimonials: Testimonial[];
}

export function TrustSection({ trust, testimonials }: TrustSectionProps) {
  const items: TestimonialView[] = testimonials.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    vehicle: t.vehicle,
    quote: t.quote,
    rating: t.rating,
    photoUrl: assetUrl(t.photo.src),
    photoAlt: t.photo.alt,
  }));

  const { rating, stats } = trust;

  return (
    <section id="clientes" className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Clientes felices"
            title="Familias reales que ya estrenaron su auto con nosotros"
            description="Historias reales de personas que llegaron con dudas y se fueron manejando."
          />
          <p className="mt-6 flex items-center justify-center gap-3 text-sm font-semibold text-navy-600">
            <span className="flex gap-0.5 text-accent-500" aria-hidden>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} width={20} height={20} />
              ))}
            </span>
            <span>
              <strong className="text-navy-900">{rating.score.toFixed(1)}</strong> de 5 · {rating.count} reseñas en{" "}
              {rating.source}
            </span>
          </p>
        </Reveal>

        <Reveal delay={2} className="mt-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-navy-100 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-6 py-8 text-center">
                <dd className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{stat.value}</dd>
                <dt className="mt-1 text-sm font-semibold text-navy-500">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={3} animation="fade-in-bottom" className="mt-14">
          <TestimonialCarousel items={items} />
        </Reveal>
      </div>
    </section>
  );
}
