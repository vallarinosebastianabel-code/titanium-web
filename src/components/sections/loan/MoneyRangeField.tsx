"use client";

import { useId, type ChangeEvent, type CSSProperties } from "react";

import { clamp } from "@/lib/finance";
import { cn } from "@/lib/format";

interface MoneyRangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  /** Límites del slider (los del input los valida zod). */
  min: number;
  max: number;
  step: number;
  /** Símbolo decorativo (ej. "$"). */
  symbol: string;
  /** Texto formateado de apoyo (límites, porcentaje...). */
  hint?: string;
  error?: string;
  /** Formatea los extremos bajo el slider. */
  formatBound: (value: number) => string;
}

/**
 * Campo numérico + slider sincronizados. El input admite cualquier valor (para que zod
 * lo valide en tiempo real); el slider se mantiene acotado a [min, max].
 */
export function MoneyRangeField({
  label,
  value,
  onChange,
  onBlur,
  min,
  max,
  step,
  symbol,
  hint,
  error,
  formatBound,
}: MoneyRangeFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const safeMax = Math.max(max, min);
  const sliderValue = clamp(Number.isNaN(value) ? min : value, min, safeMax);
  const progress = safeMax === min ? 0 : ((sliderValue - min) / (safeMax - min)) * 100;

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    onChange(digits === "" ? Number.NaN : Number(digits));
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={id} className="text-sm font-bold text-navy-900">
          {label}
        </label>
        <div
          className={cn(
            "flex h-12 w-40 items-center rounded-xl border bg-white px-3 transition-shadow focus-within:border-accent-500 focus-within:ring-4 focus-within:ring-accent-500/20",
            error ? "border-[#d4313b]" : "border-[#d5dbe6]",
          )}
        >
          <span className="mr-1 font-semibold text-navy-400" aria-hidden>
            {symbol}
          </span>
          <input
            id={id}
            inputMode="numeric"
            autoComplete="off"
            value={Number.isNaN(value) ? "" : String(value)}
            onChange={handleInput}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className="w-full bg-transparent text-right text-lg font-extrabold tabular-nums text-navy-900 outline-none"
          />
        </div>
      </div>

      <input
        type="range"
        aria-label={`${label} (control deslizante)`}
        className="range mt-3"
        min={min}
        max={safeMax}
        step={step}
        value={sliderValue}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--progress": `${progress}%` } as CSSProperties}
      />

      <div className="mt-1 flex justify-between text-xs font-medium text-navy-400">
        <span>{formatBound(min)}</span>
        {hint && !error && <span className="text-navy-500">{hint}</span>}
        <span>{formatBound(safeMax)}</span>
      </div>

      {error && (
        <p id={errorId} role="alert" className="shake-horizontal mt-2 text-sm font-semibold text-[#d4313b]">
          {error}
        </p>
      )}
    </div>
  );
}
