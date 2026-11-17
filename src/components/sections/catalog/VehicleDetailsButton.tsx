"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";
import type { Vehicle } from "@/lib/schemas/vehicle";

// El modal (galería, ficha, cuota) se descarga solo cuando alguien lo abre.
const VehicleModal = dynamic(() => import("./VehicleModal").then((m) => m.VehicleModal), { ssr: false });

interface VehicleDetailsButtonProps {
  vehicle: Vehicle;
  title: string;
  currency: CurrencyFormat;
  loan: SiteConfig["loan"];
  whatsapp: string;
}

/** Botón "Me interesa" de la tarjeta: abre el modal de detalle del vehículo. */
export function VehicleDetailsButton({ vehicle, title, currency, loan, whatsapp }: VehicleDetailsButtonProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="glow-cta mt-1 w-full cursor-pointer"
        aria-label={`Ver detalles: ${title}`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Ver detalles
      </button>
      {open && (
        <VehicleModal vehicle={vehicle} currency={currency} loan={loan} whatsapp={whatsapp} onClose={close} />
      )}
    </>
  );
}
