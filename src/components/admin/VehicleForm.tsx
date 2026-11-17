"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  deleteVehicleAction,
  deleteVehicleImageAction,
  saveVehicleAction,
  uploadVehicleImagesAction,
} from "@/app/admin/actions";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { BODY_LABEL } from "@/lib/vehicle-filters";
import {
  adminVehicleFormSchema,
  type AdminVehicleFormValues,
} from "@/lib/schemas/admin-vehicle";
import { BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, VEHICLE_STATUSES, type Vehicle } from "@/lib/schemas/vehicle";
import { storagePublicUrl } from "@/lib/supabase/map-vehicle";
import { cn, formatCurrency, vehicleTitle } from "@/lib/format";

interface ImageRow {
  id: string;
  storage_path: string;
  alt: string;
  sort_order: number;
}

interface VehicleFormProps {
  vehicle?: Vehicle;
  images?: ImageRow[];
}

const STATUS_LABEL: Record<(typeof VEHICLE_STATUSES)[number], string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
};

const FUEL_LABEL: Record<(typeof FUEL_TYPES)[number], string> = {
  gasoline: "Gasolina",
  diesel: "Diésel",
  hybrid: "Híbrido",
  electric: "Eléctrico",
};

function defaultsFromVehicle(v?: Vehicle): AdminVehicleFormValues {
  if (!v) {
    return {
      status: "available",
      featured: false,
      make: "",
      model: "",
      year: new Date().getFullYear(),
      bodyType: "suv",
      price: 10000,
      mileage: 0,
      transmission: "automatic",
      fuelType: "gasoline",
      exteriorColor: "",
      interiorColor: "",
      vin: "",
      description: "",
    };
  }
  return {
    status: v.status,
    featured: v.featured,
    make: v.make,
    model: v.model,
    year: v.year,
    bodyType: v.bodyType,
    price: v.price,
    mileage: v.mileage,
    transmission: v.transmission,
    fuelType: v.fuelType,
    exteriorColor: v.exteriorColor ?? "",
    interiorColor: v.interiorColor ?? "",
    vin: v.vin ?? "",
    description: v.description,
  };
}

export function VehicleForm({ vehicle, images = [] }: VehicleFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminVehicleFormValues>({
    resolver: zodResolver(adminVehicleFormSchema),
    defaultValues: defaultsFromVehicle(vehicle),
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveVehicleAction(vehicle?.id ?? null, values);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (!vehicle && result.id) {
        router.replace(`/admin/vehicles/${result.id}`);
        return;
      }
      setMessage("Guardado");
      router.refresh();
    });
  });

  const onUpload = (files: FileList | null) => {
    if (!vehicle || !files?.length) return;
    setError(null);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    startTransition(async () => {
      const result = await uploadVehicleImagesAction(vehicle.id, fd);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const onDeleteImage = (imageId: string) => {
    if (!vehicle) return;
    startTransition(async () => {
      const result = await deleteVehicleImageAction(imageId, vehicle.id);
      if (!result.ok) setError(result.error);
      else router.refresh();
    });
  };

  const onDeleteVehicle = () => {
    if (!vehicle) return;
    if (!confirm(`¿Borrar ${vehicleTitle(vehicle)}? Esta acción no se puede deshacer.`)) return;
    startTransition(async () => {
      const result = await deleteVehicleAction(vehicle.id);
      if (!result.ok) setError(result.error);
      else router.push("/admin");
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField label="Marca" error={errors.make?.message} {...register("make")} />
        <TextField label="Modelo" error={errors.model?.message} {...register("model")} />
        <TextField label="Año" type="number" error={errors.year?.message} {...register("year", { valueAsNumber: true })} />
        <TextField
          label="Precio a financiar"
          type="number"
          error={errors.price?.message}
          {...register("price", { valueAsNumber: true })}
        />
        <TextField
          label="Millaje"
          type="number"
          error={errors.mileage?.message}
          {...register("mileage", { valueAsNumber: true })}
        />
        <TextField label="Color exterior" {...register("exteriorColor")} />
        <TextField label="Color interior" {...register("interiorColor")} />
        <TextField
          label="VIN (opcional)"
          error={errors.vin?.message}
          {...register("vin")}
        />

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">Tipo</label>
          <select className="h-13 w-full rounded-[0.875rem] border border-[#d5dbe6] bg-white px-4 font-medium" {...register("bodyType")}>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>
                {BODY_LABEL[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">Estado</label>
          <select className="h-13 w-full rounded-[0.875rem] border border-[#d5dbe6] bg-white px-4 font-medium" {...register("status")}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">Transmisión</label>
          <select className="h-13 w-full rounded-[0.875rem] border border-[#d5dbe6] bg-white px-4 font-medium" {...register("transmission")}>
            {TRANSMISSIONS.map((t) => (
              <option key={t} value={t}>
                {t === "automatic" ? "Automático" : "Manual"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-navy-500">Combustible</label>
          <select className="h-13 w-full rounded-[0.875rem] border border-[#d5dbe6] bg-white px-4 font-medium" {...register("fuelType")}>
            {FUEL_TYPES.map((f) => (
              <option key={f} value={f}>
                {FUEL_LABEL[f]}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold">
          <input type="checkbox" className="size-5 accent-accent-500" {...register("featured")} />
          Destacado en la home
        </label>
      </div>

      <TextArea label="Descripción" rows={3} {...register("description")} />

      {vehicle && (
        <section className="space-y-4 rounded-2xl border border-navy-100 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold">Fotos</h2>
            <label className="cursor-pointer rounded-xl bg-navy-900 px-4 py-2 text-sm font-bold text-white hover:bg-navy-800">
              Subir fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={pending}
                onChange={(e) => {
                  onUpload(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {images.length === 0 ? (
            <p className="text-sm text-navy-500">Todavía no hay fotos. Subí al menos una para que se vea en el catálogo.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img) => (
                <li key={img.id} className="relative overflow-hidden rounded-xl border border-navy-100">
                  <div className="relative aspect-4/3 bg-navy-50">
                    <Image src={storagePublicUrl(img.storage_path)} alt={img.alt} fill className="object-cover" sizes="240px" />
                  </div>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onDeleteImage(img.id)}
                    className="absolute right-2 top-2 rounded-lg bg-white/95 px-2 py-1 text-xs font-bold text-[#d4313b] shadow"
                  >
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {!vehicle && (
        <p className="rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-600">
          Guardá primero los datos del carro. Después vas a poder subir las fotos.
        </p>
      )}

      {error && <p className="text-sm font-semibold text-[#d4313b]">{error}</p>}
      {message && <p className="text-sm font-semibold text-accent-600">{message}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "rounded-xl bg-accent-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-600",
            pending && "opacity-60",
          )}
        >
          {pending ? "Guardando…" : vehicle ? "Guardar cambios" : "Crear carro"}
        </button>
        {vehicle && (
          <button
            type="button"
            disabled={pending}
            onClick={onDeleteVehicle}
            className="rounded-xl border border-[#d4313b]/40 px-6 py-3 text-sm font-bold text-[#d4313b] hover:bg-[#d4313b]/5"
          >
            Borrar carro
          </button>
        )}
        {vehicle && (
          <p className="self-center text-sm text-navy-500">
            {vehicleTitle(vehicle)} · {formatCurrency(vehicle.price, { locale: "es-US", currency: "USD" })}
          </p>
        )}
      </div>
    </form>
  );
}
