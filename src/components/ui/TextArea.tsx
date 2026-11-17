import { useId, type Ref, type TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/format";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ label, error, className, id, ref, ...props }: TextAreaProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "w-full resize-y rounded-[0.875rem] border bg-white px-4 py-3 text-[0.95rem] font-medium text-navy-900 outline-none transition-shadow placeholder:text-navy-300",
          "focus:border-accent-500 focus:ring-4 focus:ring-accent-500/20",
          error ? "border-[#d4313b]" : "border-[#d5dbe6]",
        )}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-sm font-medium text-[#d4313b]">
          {error}
        </p>
      )}
    </div>
  );
}
