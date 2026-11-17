import { GlowButton } from "@/components/ui/GlowButton";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { kikoWhatsApp } from "@/lib/brand";
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
            description={`${place}. Financiamiento propio para hispanos que necesitan moverse.`}
          />
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-4xl gap-5 sm:grid-cols-2">
          <Reveal animation="fade-in-left">
            <article className="h-full rounded-3xl bg-navy-950 p-7 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-400">Dealer</p>
              <h3 className="mt-3 text-2xl font-extrabold">Titanium South Florida</h3>
              <p className="mt-3 leading-relaxed text-white/80">
                El negocio que respalda: carros listos para rodar, título limpio y reglas claras. Resistente, simple y
                de largo plazo.
              </p>
            </article>
          </Reveal>
          <Reveal animation="fade-in-right" delay={2}>
            <article className="h-full rounded-3xl border border-navy-100 bg-white p-7">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">Broker</p>
              <h3 className="mt-3 text-2xl font-extrabold">Sebastián - Lobo</h3>
              <p className="mt-3 leading-relaxed text-navy-600">
                La cara cercana. {business.contactName} te atiende por WhatsApp y por teléfono: {business.phone}.
              </p>
            </article>
          </Reveal>
        </div>

        <div className="mt-10 flex justify-center">
          <GlowButton href={kikoWhatsApp(business)} target="_blank" rel="noopener noreferrer" size="lg">
            <WhatsAppIcon width={20} height={20} />
            Habla con {business.contactName}
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
