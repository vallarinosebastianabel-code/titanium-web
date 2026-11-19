"use client";

import { useId, type CSSProperties } from "react";

import { clamp } from "@/lib/finance";

interface MoneyRangeFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  min: number;
  max: number;
  step: number;
  /** Símbolo decorativo (ej. "$") — reservado por compatibilidad. */
  symbol?: string;
  hint?: string;
  error?: string;
  formatBound: (value: number) => string;
}

/** Slider de monto con extremos visibles (sin input numérico). */
export function MoneyRangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  hint,
  error,
  formatBound,
}: MoneyRangeFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const safeMax = Math.max(max, min);
  const sliderValue = clamp(Number.isNaN(value) ? min : value, min, safeMax);
  const progress = safeMax === min ? 0 : ((sliderValue - min) / (safeMax - min)) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-bold text-navy-900">
          {label}
        </label>
        <p className="text-lg font-extrabold tabular-nums text-navy-900">{formatBound(sliderValue)}</p>
      </div>

      <input
        id={id}
        type="range"
        aria-label={label}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
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
