import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { assetUrl } from "@/lib/assets";
import { formatCurrency, formatNumber, vehicleTitle } from "@/lib/format";
import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";
import type { BodyType, Vehicle } from "@/lib/schemas/vehicle";
import { BODY_LABEL } from "@/lib/vehicle-filters";

import { VehicleDetailsButton } from "./VehicleDetailsButton";

interface VehicleCardProps {
  vehicle: Vehicle;
  currency: CurrencyFormat;
  loan: SiteConfig["loan"];
  whatsapp: string;
  /** Las primeras tarjetas visibles se cargan con prioridad. */
  priority?: boolean;
}

function bodyTypeLabel(type: BodyType, t: Awaited<ReturnType<typeof getTranslations<"Catalog">>>): string {
  switch (type) {
    case "van":
      return t("minivan");
    case "sedan":
    case "suv":
    case "pickup":
      return t(type);
    default:
      return BODY_LABEL[type];
  }
}

/**
 * Tarjeta de vehículo. Debe ser hijo DIRECTO de <GlowGroup> (usa `.glow-card`),
 * y no lleva utilidades de fondo ni de borde para no pisar el overlay del hover.
 */
export async function VehicleCard({ vehicle, currency, loan, whatsapp, priority }: VehicleCardProps) {
  const t = await getTranslations("Catalog");
  const title = vehicleTitle(vehicle);
  const image = vehicle.images[0];
  const transmission = vehicle.transmission === "automatic" ? t("automatic") : t("manual");

  return (
    <article className="glow-card gap-4 p-3 sm:p-4">
      <div className="glow-media relative aspect-4/3 overflow-hidden rounded-xl bg-white">
        <Image
          src={`${assetUrl(image.src)}?v=6`}
          alt={image.alt}
          fill
          priority={priority}
          unoptimized
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-contain object-center"
        />
      </div>

      <div className="px-1">
        <h3 className="truncate text-lg font-extrabold leading-snug" title={title}>
          {title}
        </h3>
        <p className="mt-1 truncate text-sm text-navy-500">
          {bodyTypeLabel(vehicle.bodyType, t)} · {formatNumber(vehicle.mileage, currency.locale)} mi · {transmission}
        </p>
      </div>

      <div className="px-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">{t("priceLabel")}</p>
        <p className="text-2xl font-extrabold tracking-tight">{formatCurrency(vehicle.price, currency)}</p>
      </div>

      <VehicleDetailsButton
        vehicle={vehicle}
        title={title}
        currency={currency}
        loan={loan}
        whatsapp={whatsapp}
      />
    </article>
  );
}