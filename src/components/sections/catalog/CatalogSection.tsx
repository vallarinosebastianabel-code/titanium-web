import { GlowButton } from "@/components/ui/GlowButton";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";
import type { Vehicle, VehicleSearchEntry } from "@/lib/schemas/vehicle";

import { VehicleGrid } from "./VehicleGrid";
import { VehicleSearchBar } from "./VehicleSearchBar";

interface CatalogSectionProps {
  vehicles: Vehicle[];
  searchIndex: VehicleSearchEntry[];
  currency: CurrencyFormat;
  loan: SiteConfig["loan"];
  whatsapp: string;
}

export function CatalogSection({ vehicles, searchIndex, currency, loan, whatsapp }: CatalogSectionProps) {
  return (
    <section id="inventario" className="bg-surface py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="Inventario" title="Carros listos para rodar" />
        </Reveal>

        <Reveal className="mt-10" delay={1} animation="fade-in-bottom">
          <VehicleSearchBar index={searchIndex} />
        </Reveal>

        <Reveal className="mt-10" delay={2} animation="fade-in-bottom">
          <VehicleGrid vehicles={vehicles} currency={currency} loan={loan} whatsapp={whatsapp} />
        </Reveal>

        <div className="mt-14 flex justify-center">
          <GlowButton href="/inventario" size="lg">
            Ver todo el inventario
            <ArrowRightIcon width={20} height={20} />
          </GlowButton>
        </div>
      </div>
    </section>
  );
}
