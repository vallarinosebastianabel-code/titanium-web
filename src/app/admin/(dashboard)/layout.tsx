import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";
import { Logo } from "@/components/ui/Logo";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  let email: string | undefined;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email;
  }

  return (
    <div className="min-h-svh bg-surface">
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Admin inicio">
              <Logo className="h-10" />
            </Link>
            <nav className="hidden items-center gap-4 text-sm font-semibold sm:flex">
              <Link href="/admin" className="text-navy-700 hover:text-accent-600">
                Inventario
              </Link>
              <Link href="/admin/vehicles/new" className="text-navy-700 hover:text-accent-600">
                Nuevo carro
              </Link>
              <Link href="/" className="text-navy-400 hover:text-navy-700">
                Ver sitio →
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-navy-500 sm:inline">{email}</span>
            <form action={logoutAction}>
              <button type="submit" className="rounded-lg border border-navy-200 px-3 py-1.5 font-semibold hover:bg-navy-50">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">{children}</div>
    </div>
  );
}
