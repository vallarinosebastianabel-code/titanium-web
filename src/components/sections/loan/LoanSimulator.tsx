"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useMemo, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { GlowButton } from "@/components/ui/GlowButton";
import { ArrowRightIcon, CarIcon, ShieldIcon } from "@/components/ui/icons";
import { assetUrl } from "@/lib/assets";
import { vehicleWhatsApp } from "@/lib/brand";
import { calculateLoan, defaultDownPayment, downPaymentBounds } from "@/lib/finance";
import { cn, formatCurrency } from "@/lib/format";
import { createLoanFormSchema, type LoanFormValues } from "@/lib/schemas/loan";
import type { CurrencyFormat, LoanConfig } from "@/lib/schemas/site";
import {
  getSelectedVehicleServerSnapshot,
  getSelectedVehicleSnapshot,
  parseSelectedVehicle,
  subscribeSelectedVehicle,
  type SelectedVehicle,
} from "@/lib/selected-vehicle";

import { MoneyRangeField } from "./MoneyRangeField";
import { PrequalifyForm } from "./PrequalifyForm";

interface LoanSimulatorProps {
  config: LoanConfig;
  currency: CurrencyFormat;
  /** Dígitos del WhatsApp del negocio (para el estado de éxito). */
  whatsapp: string;
}

/**
 * El precio NO es editable: sale del auto elegido en el inventario (ver `selected-vehicle`).
 * Sin auto elegido se invita a escoger uno primero.
 */
export function LoanSimulator(props: LoanSimulatorProps) {
  const raw = useSyncExternalStore(
    subscribeSelectedVehicle,
    getSelectedVehicleSnapshot,
    getSelectedVehicleServerSnapshot,
  );
  const vehicle = useMemo(() => parseSelectedVehicle(raw), [raw]);

  if (!vehicle) return <ChooseVehicleFirst />;
  // `key`: al cambiar de auto se reinician pago inicial, plazo y formulario de precalificación.
  return <Calculator key={`${vehicle.id}:${vehicle.price}`} vehicle={vehicle} {...props} />;
}

function ChooseVehicleFirst() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card sm:p-12">
      <span className="grid size-16 place-items-center rounded-2xl bg-accent-500/15 text-accent-600">
        <CarIcon width={32} height={32} />
      </span>
      <h3 className="mt-6 text-2xl font-extrabold tracking-tight">Primero elige tu auto</h3>
      <p className="mt-3 max-w-md leading-relaxed text-navy-500">
        La inicial y la cuota se calculan sobre el precio a financiar de un carro de nuestro inventario. Elige uno y
        vuelve aquí.
      </p>
      <GlowButton href="#inventario" variant="accent" size="lg" className="mt-8">
        Inventario
        <ArrowRightIcon width={20} height={20} />
      </GlowButton>
    </div>
  );
}

function Calculator({ config, currency, whatsapp, vehicle }: LoanSimulatorProps & { vehicle: SelectedVehicle }) {
  const money = (n: number) => formatCurrency(n, currency);
  const currencySymbol = useMemo(
    () => formatCurrency(0, currency, { maximumFractionDigits: 0 }).replace(/[\d\s.,]/g, ""),
    [currency],
  );

  const schema = useMemo(() => createLoanFormSchema(config, currency), [config, currency]);

  const { control } = useForm<LoanFormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      price: vehicle.price,
      downPayment: defaultDownPayment(vehicle.price, config),
      term: config.defaultTerm,
      creditProfile: config.defaultCreditProfile,
    },
  });

  // Errores en tiempo real: se derivan del schema sobre los valores vivos del formulario.
  const watched = useWatch({ control }) as LoanFormValues;
  const values = useMemo<LoanFormValues>(() => ({ ...watched, price: vehicle.price }), [watched, vehicle.price]);
  const validation = useMemo(() => schema.safeParse(values), [schema, values]);
  const fieldErrors = useMemo(() => {
    if (validation.success) return {} as Partial<Record<keyof LoanFormValues, string>>;
    const errors: Partial<Record<keyof LoanFormValues, string>> = {};
    for (const issue of validation.error.issues) {
      const key = issue.path[0] as keyof LoanFormValues;
      errors[key] ??= issue.message;
    }
    return errors;
  }, [validation]);

  const [showLeadForm, setShowLeadForm] = useState(false);

  const profile = config.creditProfiles.find((p) => p.id === values.creditProfile) ?? config.creditProfiles[0];
  const result = validation.success
    ? calculateLoan({
        price: values.price,
        downPayment: values.downPayment,
        term: values.term,
        apr: profile.apr,
      })
    : null;

  // Límites vigentes del slider de pago inicial (según un precio válido).
  const downBounds = downPaymentBounds(vehicle.price, config);
  const downPercent = Number.isFinite(values.downPayment)
    ? Math.round((values.downPayment / vehicle.price) * 100)
    : null;

  const termIndex = Math.max(config.terms.indexOf(values.term), 0);
  const termProgress = (termIndex / (config.terms.length - 1)) * 100;

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
      {/* ------------------------------ Entradas ------------------------------ */}
      <form
        noValidate
        onSubmit={(e) => e.preventDefault()}
        aria-label="Simulador de inicial y cuota"
        className="space-y-9 rounded-3xl bg-white p-6 shadow-card sm:p-9 lg:col-span-7"
      >
        <div className="flex items-center gap-4 rounded-2xl border border-navy-100 bg-surface p-3 sm:gap-5 sm:p-4">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-white sm:h-24 sm:w-36">
            <Image
              src={assetUrl(vehicle.image.src)}
              alt={vehicle.image.alt}
              fill
              quality={90}
              sizes="144px"
              className="object-contain object-center"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
              Auto seleccionado · Stock {vehicle.stockNumber}
            </p>
            <p className="mt-0.5 truncate text-lg font-extrabold tracking-tight">{vehicle.title}</p>
            <p className="mt-0.5 text-sm text-navy-500">
              Precio a financiar:{" "}
              <strong className="text-base font-extrabold tabular-nums text-navy-900">{money(vehicle.price)}</strong>
            </p>
            <a href="#inventario" className="mt-1 inline-block text-sm font-bold text-accent-600 hover:underline">
              Cambiar auto →
            </a>
          </div>
        </div>

        <Controller
          control={control}
          name="downPayment"
          render={({ field }) => (
            <MoneyRangeField
              label="Inicial"
              value={field.value}
              symbol={currencySymbol}
              min={downBounds.min}
              max={downBounds.max}
              step={config.downPayment.step}
              formatBound={money}
              hint={downPercent !== null ? `${downPercent}% del precio` : undefined}
              error={fieldErrors.downPayment}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
          )}
        />

        <Controller
          control={control}
          name="term"
          render={({ field }) => (
            <div>
              <div className="flex items-end justify-between gap-4">
                <label htmlFor="loan-term" className="text-sm font-bold text-navy-900">
                  Plazo
                </label>
                <output htmlFor="loan-term" className="text-lg font-extrabold tabular-nums">
                  {field.value} meses
                  <span className="ml-1 text-sm font-semibold text-navy-400">({field.value / 12} años)</span>
                </output>
              </div>
              <input
                id="loan-term"
                type="range"
                className="range mt-3"
                min={0}
                max={config.terms.length - 1}
                step={1}
                value={termIndex}
                onChange={(e) => field.onChange(config.terms[Number(e.target.value)])}
                onBlur={field.onBlur}
                aria-valuetext={`${field.value} meses`}
                style={{ "--progress": `${termProgress}%` } as CSSProperties}
              />
              <div className="mt-1 flex justify-between text-xs font-medium text-navy-400" aria-hidden>
                {config.terms.map((t) => (
                  <span key={t} className={cn(t === field.value && "font-extrabold text-accent-600")}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        />
      </form>

      {/* ------------------------------ Resultado ------------------------------ */}
      <aside
        aria-label="Resultado de la simulación"
        className="space-y-4 rounded-3xl bg-navy-900 p-6 text-white shadow-float sm:p-9 lg:sticky lg:top-28 lg:col-span-5"
      >
        <div aria-live="polite" aria-atomic="true">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">Tu cuota mensual estimada</p>

          {result ? (
            <>
              <p className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-extrabold tabular-nums tracking-tight sm:text-6xl">
                  {money(result.monthly)}
                </span>
                <span className="text-lg font-semibold text-white/60">/mes</span>
              </p>
              <p className="mt-3 text-sm text-white/70">Estimación. Sujeto a aprobación. No es precio de contado.</p>

              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-6 text-sm">
                <Stat label="Inicial" value={money(values.downPayment)} />
                <Stat label="Monto a financiar" value={money(result.principal)} />
                <Stat label="Plazo" value={`${values.term} meses`} />
                <Stat label="Precio a financiar" value={money(vehicle.price)} />
              </dl>
            </>
          ) : (
            <p className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-relaxed text-white/80">
              Corrige los campos marcados en rojo para ver tu cuota estimada.
            </p>
          )}
        </div>

        {showLeadForm && result ? (
          <PrequalifyForm
            simulation={{
              price: values.price,
              downPayment: values.downPayment,
              term: values.term,
              apr: profile.apr,
              monthly: Math.round(result.monthly),
              vehicle: { stockNumber: vehicle.stockNumber, title: vehicle.title },
            }}
            whatsapp={whatsapp}
            onCancel={() => setShowLeadForm(false)}
          />
        ) : (
          <>
            <GlowButton
              href={vehicleWhatsApp(whatsapp, vehicle.title, vehicle.stockNumber)}
              target="_blank"
              rel="noopener noreferrer"
              variant="accent"
              size="lg"
              className="w-full"
            >
              Escribile a Sebastián por WhatsApp
              <ArrowRightIcon width={20} height={20} />
            </GlowButton>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
              onClick={() => setShowLeadForm(true)}
              disabled={!result}
            >
              O déjanos tus datos
            </button>
            <p className="flex items-center justify-center gap-2 text-center text-xs font-medium text-white/70">
              <ShieldIcon width={16} height={16} />
              Financiamiento propio · Sujeto a aprobación
            </p>
          </>
        )}

        <p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-white/50">{config.disclaimer}</p>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/60">{label}</dt>
      <dd className="mt-0.5 text-base font-bold tabular-nums">{value}</dd>
    </div>
  );
}
