import { PlusIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { whatsappLink } from "@/lib/format";
import type { FaqItem } from "@/lib/schemas/content";

const CATEGORY_LABEL: Record<FaqItem["category"], string> = {
  financiamiento: "Financiamiento",
  requisitos: "Requisitos",
  inventario: "Inventario",
};

interface FaqSectionProps {
  faqs: FaqItem[];
  whatsapp: string;
}

/**
 * Acordeón 100% servidor: usa <details name="faq"> (accordion exclusivo nativo),
 * sin JavaScript de hidratación. El contenido abre con una animación de Animista.
 */
export function FaqSection({ faqs, whatsapp }: FaqSectionProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <section id="faq" className="bg-white py-24 sm:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-3xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Preguntas frecuentes"
            title="Lo que más nos preguntan"
            description="Sin SSN, inicial, título limpio y cómo salir manejando. En pocas palabras."
          />
        </Reveal>

        <Reveal delay={2} className="mt-12">
          <div className="divide-y divide-navy-100 overflow-hidden rounded-3xl bg-white shadow-card">
            {faqs.map((faq) => (
              <details key={faq.id} name="faq" className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left font-bold marker:hidden hover:bg-navy-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500 sm:px-8 [&::-webkit-details-marker]:hidden">
                  <span>
                    <span className="mb-0.5 block text-xs font-bold uppercase tracking-wider text-accent-600">
                      {CATEGORY_LABEL[faq.category]}
                    </span>
                    {faq.question}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy-50 text-navy-700 transition-transform duration-300 group-open:rotate-45 group-open:bg-accent-500 group-open:text-white">
                    <PlusIcon width={18} height={18} />
                  </span>
                </summary>
                <p className="fade-in-top px-6 pb-6 leading-relaxed text-navy-600 sm:px-8">{faq.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>

        <p className="mt-10 text-center text-navy-600">
          ¿No encontrás tu respuesta?{" "}
          <a
            href={whatsappLink(whatsapp, "Hola Sebastián, tengo una pregunta sobre un carro.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-accent-600 underline-offset-4 hover:underline"
          >
            Escribime a Sebastián por WhatsApp
          </a>
        </p>
      </div>
    </section>
  );
}
