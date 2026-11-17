import { useId, type InputHTMLAttributes, type Ref } from "react";

import { cn } from "@/lib/format";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** React 19: `ref` es una prop normal; compatible con `{...register("campo")}`. */
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, error, className, id, ref, ...inputProps }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-13 w-full rounded-[0.875rem] border bg-white px-4 text-[0.95rem] font-medium text-navy-900 outline-none transition-shadow placeholder:text-navy-300",
          "focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20",
          error ? "border-[#d4313b]" : "border-[#d5dbe6]",
        )}
        {...inputProps}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-[#d4313b]">
          {error}
        </p>
      )}
    </div>
  );
}
