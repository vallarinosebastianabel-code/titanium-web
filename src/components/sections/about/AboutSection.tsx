import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteConfig } from "@/lib/schemas/site";

export function AboutSection({ business }: { business: SiteConfig["business"] }) {
  const { address } = business;
  const place = [address.street, address.city, address.state].filter(Boolean).join(", ");

  return (
    <section id="quienes-somos" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Quiénes somos"
            title="Titanium es seriedad."
            description={`${place}. Financiamiento propio sin SSN para quien necesita moverse.`}
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          <Reveal animation="fade-in-left">
            <article className="h-full rounded-3xl bg-navy-950 p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-400">Dealer</p>
              <h3 className="mt-3 text-2xl font-extrabold">Titanium South Florida</h3>
              <p className="mt-3 leading-relaxed text-white/80">
                El negocio que respalda: carros listos para rodar, título limpio y reglas claras. Acá {business.voiceName}{" "}
                te consigue el carro.
              </p>
            </article>
          </Reveal>
          <Reveal animation="fade-in-right" delay={2}>
            <article className="h-full rounded-3xl border border-navy-100 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">WhatsApp</p>
              <h3 className="mt-3 text-2xl font-extrabold">{business.contactName}</h3>
              <p className="mt-3 leading-relaxed text-navy-600">
                Te responde por WhatsApp y por teléfono: {business.phone}. Inicial, papeles y disponibilidad, carro por
                carro.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
