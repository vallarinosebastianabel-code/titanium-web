"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { GlowButton } from "@/components/ui/GlowButton";
import { CheckIcon, WhatsAppIcon } from "@/components/ui/icons";
import { TextField } from "@/components/ui/TextField";
import { whatsappLink } from "@/lib/format";
import { leadSchema, type LeadInput } from "@/lib/schemas/lead";

interface PrequalifyFormProps {
  simulation: NonNullable<LeadInput["simulation"]>;
  whatsapp: string;
  onCancel: () => void;
}

type Status = "idle" | "sent" | "error";

export function PrequalifyForm({ simulation, whatsapp, onCancel }: PrequalifyFormProps) {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      consent: false,
      source: "prequalify",
      simulation,
      website: "",
    },
  });

  const onSubmit = async (values: LeadInput) => {
    setStatus("idle");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `simulation` se re-inyecta desde props por si cambió el simulador tras abrir el formulario.
        body: JSON.stringify({ ...values, simulation }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="scale-in-center rounded-2xl bg-white p-6 text-center text-navy-900" role="status">
        <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon width={26} height={26} strokeWidth={3} />
        </span>
        <h3 className="text-lg font-extrabold">¡Solicitud recibida!</h3>
        <p className="mt-1 text-sm text-navy-600">
          Sebastián te escribe para confirmar inicial y papeles.
        </p>
        <a
          href={whatsappLink(whatsapp, "Hola Sebastián, acabo de dejar mis datos en la web.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent-600 hover:underline"
        >
          <WhatsAppIcon width={18} height={18} /> Escribile a Sebastián por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="scale-in-ver-top rounded-2xl bg-white p-5 text-navy-900 sm:p-6"
      aria-label="Dejar datos de contacto"
    >
      <h3 className="text-lg font-extrabold">Último paso</h3>
      <p className="mb-4 text-sm text-navy-600">Te escribimos por WhatsApp. Sujeto a aprobación.</p>

      <div className="space-y-3">
        <TextField label="Nombre completo" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <TextField
          label="Teléfono"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        {/* Honeypot: invisible para personas, los bots lo rellenan. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Sitio web
            <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-navy-600">
          <input
            type="checkbox"
            className="mt-0.5 size-5 shrink-0 accent-accent-500"
            aria-invalid={errors.consent ? true : undefined}
            {...register("consent")}
          />
          <span>Acepto ser contactado por teléfono, WhatsApp o correo sobre mi solicitud.</span>
        </label>
        {errors.consent && (
          <p role="alert" className="text-sm font-medium text-[#d4313b]">
            {errors.consent.message}
          </p>
        )}
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          No pudimos enviar tu solicitud. Inténtalo de nuevo o escríbenos por WhatsApp.
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <GlowButton type="submit" variant="dark" size="lg" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Enviando…" : "Enviar solicitud"}
        </GlowButton>
        <button type="button" onClick={onCancel} className="text-sm font-semibold text-navy-500 hover:text-navy-900">
          Volver
        </button>
      </div>
    </form>
  );
}
