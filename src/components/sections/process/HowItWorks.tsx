import { GlowButton } from "@/components/ui/GlowButton";
import { WhatsAppIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { kikoWhatsApp } from "@/lib/brand";
import type { SiteConfig } from "@/lib/schemas/site";

const STEPS = [
  {
    n: "1",
    title: "Elige tu carro",
    text: "Sedán, SUV, pickup o minivan. Todos con título limpio.",
  },
  {
    n: "2",
    title: "Trae pasaporte y licencia",
    text: "Pocos papeles. Sin vueltas.",
  },
  {
    n: "3",
    title: "Sal manejando",
    text: "El mismo día, sujeto a aprobación.",
  },
];

export function HowItWorks({ business }: { business: SiteConfig["business"] }) {
  return (
    <section id="como-funciona" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Cómo funciona" title="Tres pasos. Sin letra chica escondida." />
        </Reveal>

        <ol className="mt-14 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={(i + 1) as 1 | 2 | 3 | 4} animation="fade-in-bottom">
              <li className="h-full rounded-3xl border border-navy-100 bg-surface p-6">
                <span className="grid size-10 place-items-center rounded-full bg-navy-900 text-sm font-extrabold text-white">
                  {step.n}
                </span>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-navy-600">{step.text}</p>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12 flex justify-center">
          <GlowButton href={kikoWhatsApp(business)} target="_blank" rel="noopener noreferrer" variant="accent" size="lg">
            <WhatsAppIcon width={20} height={20} />
            Escríbenos
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
