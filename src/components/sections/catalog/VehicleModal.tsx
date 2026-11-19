"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  ShieldIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { useRouter } from "@/i18n/navigation";
import { assetUrl } from "@/lib/assets";
import { vehicleWhatsApp } from "@/lib/brand";
import { defaultDownPayment } from "@/lib/finance";
import { cn, formatCurrency, formatNumber, vehicleTitle } from "@/lib/format";
import type { CurrencyFormat, SiteConfig } from "@/lib/schemas/site";
import { selectVehicle } from "@/lib/selected-vehicle";
import type { Vehicle } from "@/lib/schemas/vehicle";
import { BODY_LABEL } from "@/lib/vehicle-filters";

function bodyTypeLabel(type: Vehicle["bodyType"], tCatalog: ReturnType<typeof useTranslations<"Catalog">>): string {
  switch (type) {
    case "van":
      return tCatalog("minivan");
    case "sedan":
    case "suv":
    case "pickup":
      return tCatalog(type);
    default:
      return BODY_LABEL[type];
  }
}

const COLOR_LABEL: Record<string, string> = {
  white: "Blanco",
  black: "Negro",
  silver: "Plata",
  gray: "Gris",
  blue: "Azul",
  red: "Rojo",
  green: "Verde",
  orange: "Naranja",
  burgundy: "Burdeos",
};

function colorLabel(value?: string) {
  if (!value) return null;
  return COLOR_LABEL[value.toLowerCase()] ?? value;
}

export interface VehicleModalProps {
  vehicle: Vehicle;
  currency: CurrencyFormat;
  loan: SiteConfig["loan"];
  whatsapp: string;
  onClose: () => void;
}

/**
 * Modal de detalle del vehículo: galería (varios ángulos + ampliar), cuota estimada,
 * ficha técnica y CTAs. Usa <dialog> nativo (focus trap, ESC y `inert` del resto de la página).
 * Se monta solo al abrirlo (ver VehicleDetailsButton), por eso puede usar `document` sin guardas.
 */
export function VehicleModal({ vehicle, currency, loan, whatsapp, onClose }: VehicleModalProps) {
  const t = useTranslations("Vehicle");
  const tCatalog = useTranslations("Catalog");
  const tWa = useTranslations("WhatsApp");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);

  const title = vehicleTitle(vehicle);
  const images = vehicle.images;
  const multiple = images.length > 1;
  const current = images[index];

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal() + autofocus desplazan el documento al tope. Fijamos el body
    // en el scroll actual para que el overlay se abra donde está el usuario.
    const scrollY = window.scrollY;
    if (!dialog.open) dialog.showModal();

    const body = document.body;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      if (dialog.open) dialog.close();
      window.scrollTo({ top: scrollY, left: 0, behavior: "instant" });
    };
  }, []);

  // ESC: primero cierra la imagen ampliada, luego el modal.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (zoom) setZoom(false);
      else onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose, zoom]);

  const downPayment = useMemo(() => defaultDownPayment(vehicle.price, loan), [vehicle.price, loan]);

  const exterior = colorLabel(vehicle.exteriorColor);
  const interior = colorLabel(vehicle.interiorColor);

  const specs: Array<[string, string]> = [
    [t("miles"), `${formatNumber(vehicle.mileage, currency.locale)} mi`],
    [t("year"), String(vehicle.year)],
    [t("type"), bodyTypeLabel(vehicle.bodyType, tCatalog)],
    [t("transmission"), vehicle.transmission === "automatic" ? t("automatic") : t("manual")],
    [t("fuel"), t(vehicle.fuelType)],
    ...(exterior ? ([[t("exterior"), exterior]] as Array<[string, string]>) : []),
    ...(interior ? ([[t("interior"), interior]] as Array<[string, string]>) : []),
    ...(vehicle.vin ? ([[t("vin"), vehicle.vin]] as Array<[string, string]>) : []),
  ];

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (!multiple) return;
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  const goToFinancing = () => {
    selectVehicle({
      id: vehicle.id,
      title,
      stockNumber: vehicle.stockNumber,
      price: vehicle.price,
      image: vehicle.images[0],
    });
    onClose();
    window.setTimeout(() => {
      const target = document.getElementById("financiamiento");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      else router.push("/#financiamiento");
    }, 80);
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="vehicle-modal-title"
      onKeyDown={onKeyDown}
      onClick={(e) => {
        // Clic en el backdrop (el <dialog> ocupa solo su caja; el backdrop cuenta como el propio dialog).
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed left-1/2 top-1/2 z-50 m-0 w-[min(1120px,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white p-0 text-navy-900 shadow-float backdrop:bg-navy-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="fade-in-bottom grid max-h-[calc(100svh-1.5rem)] overflow-y-auto lg:h-[min(46rem,calc(100svh-1.5rem))] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:overflow-hidden">
        {/* ------------------------------ Galería ------------------------------ */}
        <div className="p-3 sm:p-5 lg:overflow-y-auto">
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-white">
            <Image
              key={current.src}
              src={assetUrl(current.src)}
              alt={current.alt}
              fill
              priority
              quality={90}
              sizes="(min-width: 1024px) 640px, 100vw"
              className="object-contain object-center"
            />

            {multiple && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t("prev")}
                  className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-navy-900 shadow-card transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
                >
                  <ChevronLeftIcon />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t("next")}
                  className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-navy-900 shadow-card transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
                >
                  <ChevronRightIcon />
                </button>
                <span className="absolute left-3 top-3 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {index + 1} / {images.length}
                </span>
              </>
            )}

            <button
              type="button"
              onClick={() => setZoom(true)}
              className="absolute bottom-3 right-3 rounded-xl bg-white px-4 py-2 text-sm font-bold text-navy-900 shadow-card transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
            >
              {t("zoom")}
            </button>
          </div>

          {multiple && (
            <ul className="mt-3 grid grid-cols-4 gap-2" aria-label={t("gallery")}>
              {images.map((image, i) => (
                <li key={image.src}>
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ver foto ${i + 1} de ${images.length}`}
                    aria-current={i === index}
                    className={cn(
                      "relative block aspect-4/3 w-full overflow-hidden rounded-xl bg-white outline-2 -outline-offset-2 transition",
                      i === index ? "outline-accent-500" : "outline-transparent opacity-80 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={assetUrl(image.src)}
                      alt=""
                      fill
                      quality={90}
                      sizes="160px"
                      className="object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ------------------------------ Detalle ------------------------------ */}
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:overflow-y-auto lg:pl-2">
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl border border-navy-100 bg-white text-navy-700 transition hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          >
            <CloseIcon />
          </button>

          <div className="pr-12">
            {/* <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-600">
              {vehicle.status === "reserved" ? "Reservado" : "Título limpio (Clean Title)"}
            </p> */}
            <h2 id="vehicle-modal-title" className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {title}
            </h2>
          </div>

          {/* <div className="rounded-2xl bg-surface p-5">
            <p className="text-sm text-navy-500">Precio a financiar</p>
            <p className="text-4xl font-extrabold tracking-tight text-navy-900">
              {formatCurrency(vehicle.price, currency)}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-navy-100 pt-3 text-sm">
              <div>
                <dt className="text-navy-500">Inicial estimada (40%)*</dt>
                <dd className="text-lg font-extrabold text-accent-600">{formatCurrency(downPayment, currency)}</dd>
              </div>
              <div>
                <dt className="text-navy-500">Rango de inicial</dt>
                <dd className="text-lg font-extrabold text-navy-900">Desde $2,000*</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-navy-500">{DISCLAIMER_ES}</p>
          </div> */}

          <dl className="grid grid-cols-2 gap-3">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-navy-100 px-4 py-3">
                <dt className="text-[0.68rem] font-bold uppercase tracking-wider text-navy-400">{label}</dt>
                <dd className="mt-0.5 font-bold">{value}</dd>
              </div>
            ))}
          </dl>

          {vehicle.description?.trim() ? (
            <p className="text-sm leading-relaxed text-navy-600">{vehicle.description}</p>
          ) : null}

          <div className="mt-auto grid gap-3 pt-2">
            <button
              type="button"
              onClick={goToFinancing}
              className="flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-4 text-center font-bold text-white transition hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              <ShieldIcon width={20} height={20} />
              {t("seeDown")}
            </button>
            <a
              href={vehicleWhatsApp(
                whatsapp,
                title,
                vehicle.stockNumber,
                tWa("vehicle", { title, stock: vehicle.stockNumber }),
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-4 font-bold text-navy-950 transition hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E]"
            >
              <WhatsAppIcon width={22} height={22} />
              {t("whatsapp")}
            </a>
          </div>
        </div>
      </div>

      {/* ----------------------------- Imagen ampliada ----------------------------- */}
      {zoom && (
        <div
          className="scale-in-center absolute inset-0 z-10 cursor-zoom-out bg-navy-950"
          onClick={() => setZoom(false)}
        >
          <Image
            src={assetUrl(current.src)}
            alt={current.alt}
            fill
            sizes="100vw"
            quality={90}
            className="object-contain object-center"
          />
          <button
            type="button"
            onClick={() => setZoom(false)}
            aria-label={t("closeZoom")}
            autoFocus
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-xl bg-white text-navy-900 shadow-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
          >
            <CloseIcon />
          </button>
          {multiple && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                aria-label={t("prev")}
                className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-navy-900 shadow-card"
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                aria-label={t("next")}
                className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl bg-white text-navy-900 shadow-card"
              >
                <ChevronRightIcon />
              </button>
            </>
          )}
        </div>
      )}
    </dialog>,
    document.body,
  );
}
