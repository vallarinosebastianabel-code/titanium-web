import Link from "next/link";
import { notFound } from "next/navigation";

import { VehicleForm } from "@/components/admin/VehicleForm";
import { vehicleTitle } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getVehicleById } from "@/services/dataService";

export const metadata = { title: "Admin · Editar carro" };

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await getVehicleById(id);
  if (!vehicle) notFound();

  let images: Array<{ id: string; storage_path: string; alt: string; sort_order: number }> = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("vehicle_images")
      .select("id, storage_path, alt, sort_order")
      .eq("vehicle_id", id)
      .order("sort_order");
    images = (data ?? []) as typeof images;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-navy-500">
        <Link href="/admin" className="hover:text-accent-600">
          ← Inventario
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{vehicleTitle(vehicle)}</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <VehicleForm vehicle={vehicle} images={images} />
      </div>
    </div>
  );
}
