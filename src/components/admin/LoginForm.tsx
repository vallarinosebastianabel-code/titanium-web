"use client";

import { useActionState } from "react";

import { loginAction, type ActionResult } from "@/app/admin/actions";
import { TextField } from "@/components/ui/TextField";

const initial: ActionResult | null = null;

export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => loginAction(formData),
    initial,
  );

  return (
    <form action={formAction} className="space-y-4">
      {!configured && (
        <p className="rounded-xl bg-[#d4313b]/10 px-4 py-3 text-sm font-medium text-[#d4313b]">
          Falta configurar Supabase en <code>.env</code> (
          <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>).
        </p>
      )}
      <TextField label="Email" name="email" type="email" autoComplete="username" required disabled={!configured || pending} />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        disabled={!configured || pending}
      />
      {state && !state.ok && <p className="text-sm font-semibold text-[#d4313b]">{state.error}</p>}
      <button
        type="submit"
        disabled={!configured || pending}
        className="w-full rounded-xl bg-navy-900 px-5 py-3 text-sm font-bold text-white hover:bg-navy-800 disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
