import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = { title: "Admin · Login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-svh items-center justify-center bg-surface px-5 py-16">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card ring-1 ring-navy-100">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-16" />
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Panel de inventario</h1>
          <p className="mt-1 text-sm text-navy-500">Solo personal autorizado</p>
        </div>
        {params.error === "not_configured" && (
          <p className="mb-4 rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-700">
            Primero configurá el proyecto de Supabase (ver <code>supabase/schema.sql</code> y{" "}
            <code>.env.example</code>).
          </p>
        )}
        <LoginForm configured={configured} />
      </div>
    </div>
  );
}
