"use client";

import SlimSelect from "slim-select";
import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/format";

export interface SelectOption {
  value: string;
  text: string;
  disabled?: boolean;
}

interface SlimSelectFieldProps {
  label: string;
  placeholder: string;
  options: SelectOption[];
  /** "" = sin selección. */
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Muestra el buscador interno (útil con listas largas). */
  searchable?: boolean;
  /** Oculta el label visual (se mantiene accesible vía aria-label). */
  hideLabel?: boolean;
  /** Reemplaza el estilo por defecto del label. */
  labelClassName?: string;
  className?: string;
}

const buildData = (options: SelectOption[], value: string, placeholder: string) => [
  { text: placeholder, value: "", placeholder: true },
  ...options.map((o) => ({
    text: o.text,
    value: o.value,
    disabled: o.disabled,
    selected: o.value === value,
  })),
];

/**
 * Wrapper controlado de `slim-select` (única librería de dropdowns del proyecto).
 * Compatible con react-hook-form vía <Controller /> o value/onChange.
 *
 * Nota: slim-select reescribe los <option> del <select>. Por eso React solo renderiza
 * una opción estática (fallback pre-hidratación) que nunca cambia, y todas las
 * actualizaciones pasan por la API de slim-select (setData / setSelected).
 */
export function SlimSelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  name,
  id,
  disabled,
  invalid,
  searchable = false,
  hideLabel,
  labelClassName,
  className,
}: SlimSelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const selectRef = useRef<HTMLSelectElement>(null);
  const instanceRef = useRef<SlimSelect | null>(null);
  const [staticPlaceholder] = useState(placeholder);

  // Referencia a las últimas props, para que la instancia (creada una vez) nunca quede obsoleta.
  const latest = useRef({ options, value, placeholder, onChange, label, searchable });
  useEffect(() => {
    latest.current = { options, value, placeholder, onChange, label, searchable };
  });

  const optionsKey = options.map((o) => `${o.value}:${o.text}:${o.disabled ? 1 : 0}`).join("|");
  const syncedKey = useRef(optionsKey);

  // Crear / destruir (seguro con React StrictMode).
  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;
    const props = latest.current;

    const instance = new SlimSelect({
      select: el,
      data: buildData(props.options, props.value, props.placeholder),
      settings: {
        showSearch: props.searchable,
        searchPlaceholder: "Buscar…",
        searchText: "Sin resultados",
        searchingText: "Buscando…",
        placeholderText: props.placeholder,
        ariaLabel: props.label,
        allowDeselect: true,
        deselectText: "Quitar selección",
        contentPosition: "absolute",
      },
      events: {
        afterChange: (selected) => {
          const first = selected[0];
          latest.current.onChange(first && !first.placeholder ? first.value : "");
        },
      },
    });

    instanceRef.current = instance;
    syncedKey.current = optionsKey;

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
    // Instancia única por montaje; los cambios se sincronizan en los efectos de abajo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cambia la lista de opciones (p. ej. modelos según la marca elegida).
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || syncedKey.current === optionsKey) return;
    syncedKey.current = optionsKey;
    const { options: opts, value: current, placeholder: ph } = latest.current;
    instance.setData(buildData(opts, current, ph));
  }, [optionsKey]);

  // Valor controlado desde fuera (reset del formulario, selección de marca, etc.).
  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    if ((instance.getSelected()[0] ?? "") !== value) instance.setSelected(value, false);
  }, [value]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    if (disabled) instance.disable();
    else instance.enable();
  }, [disabled]);

  return (
    <div className={cn("slim-field min-w-0", className)} data-slim-invalid={invalid ? "true" : undefined}>
      <label
        htmlFor={selectId}
        className={cn(
          labelClassName ?? "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <select
        ref={selectRef}
        id={selectId}
        name={name}
        disabled={disabled}
        defaultValue=""
        aria-invalid={invalid || undefined}
      >
        <option value="">{staticPlaceholder}</option>
      </select>
    </div>
  );
}
