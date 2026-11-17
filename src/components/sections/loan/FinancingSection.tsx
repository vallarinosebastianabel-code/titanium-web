import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";

import { LoanSimulator } from "./LoanSimulator";

interface FinancingSectionProps {
  loan: SiteConfig["loan"];
  currency: CurrencyFormat;
  whatsapp: string;
}

/** Server Component: el encabezado es HTML estático; solo el simulador hidrata. */
export function FinancingSection({ loan, currency, whatsapp }: FinancingSectionProps) {
  return (
    <section id="financiamiento" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal animation="fade-in-bottom">
          <SectionHeading
            eyebrow="Financiamiento"
            title="Mira tu inicial y tu cuota, con reglas claras"
          />
        </Reveal>

        <Reveal animation="fade-in-bottom" delay={2} className="mt-14">
          <LoanSimulator config={loan} currency={currency} whatsapp={whatsapp} />
        </Reveal>
      </div>
    </section>
  );
}
