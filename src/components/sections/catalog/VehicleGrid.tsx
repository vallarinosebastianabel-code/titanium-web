import { GlowGroup } from "@/components/ui/GlowGroup";
import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";
import type { Vehicle } from "@/lib/schemas/vehicle";

import { VehicleCard } from "./VehicleCard";

interface VehicleGridProps {
  vehicles: Vehicle[];
  currency: CurrencyFormat;
  loan: SiteConfig["loan"];
  whatsapp: string;
}

export function VehicleGrid({ vehicles, currency, loan, whatsapp }: VehicleGridProps) {
  return (
    <GlowGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          currency={currency}
          loan={loan}
          whatsapp={whatsapp}
          priority={index < 3}
        />
      ))}
    </GlowGroup>
  );
}
