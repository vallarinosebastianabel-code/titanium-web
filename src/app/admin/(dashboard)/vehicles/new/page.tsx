import Link from "next/link";

import { VehicleForm } from "@/components/admin/VehicleForm";

export const metadata = { title: "Admin · Nuevo carro" };

export default function NewVehiclePage() {
  return (
    <div>
      <p className="text-sm font-semibold text-navy-500">
        <Link href="/admin" className="hover:text-accent-600">
          ← Inventario
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Nuevo carro</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm">
        <VehicleForm />
      </div>
    </div>
  );
}
