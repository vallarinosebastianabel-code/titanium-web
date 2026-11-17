import Image from "next/image";
import Link from "next/link";

import { formatCurrency, vehicleTitle } from "@/lib/format";
import { assetUrl } from "@/lib/assets";
import { getAllVehiclesForAdmin } from "@/services/dataService";

export const metadata = { title: "Admin · Inventario" };

const STATUS: Record<string, string> = {
  available: "Disponible",
  reserved: "Reservado",
  sold: "Vendido",
};

export default async function AdminHomePage() {
  const vehicles = await getAllVehiclesForAdmin();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Inventario</h1>
          <p className="mt-1 text-navy-500">{vehicles.length} carros en total</p>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="rounded-xl bg-accent-500 px-5 py-3 text-sm font-bold text-white hover:bg-accent-600"
        >
          + Nuevo carro
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy-100 bg-navy-50 text-xs font-bold uppercase tracking-wider text-navy-500">
            <tr>
              <th className="px-4 py-3">Carro</th>
              <th className="hidden px-4 py-3 sm:table-cell">Stock</th>
              <th className="px-4 py-3">Precio</th>
              <th className="hidden px-4 py-3 md:table-cell">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const img = v.images[0];
              return (
                <tr key={v.id} className="border-b border-navy-50 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                        {img && (
                          <Image
                            src={assetUrl(img.src)}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{vehicleTitle(v)}</p>
                        {v.featured && <p className="text-xs font-semibold text-accent-600">Destacado</p>}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-medium text-navy-600 sm:table-cell">{v.stockNumber}</td>
                  <td className="px-4 py-3 font-extrabold">
                    {formatCurrency(v.price, { locale: "es-US", currency: "USD" })}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-bold text-navy-700">
                      {STATUS[v.status] ?? v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/vehicles/${v.id}`} className="font-bold text-accent-600 hover:underline">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {vehicles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-navy-500">
                  No hay carros.{" "}
                  <Link href="/admin/vehicles/new" className="font-bold text-accent-600 hover:underline">
                    Creá el primero
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
