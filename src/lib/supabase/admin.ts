import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceRoleKey, getSupabaseUrl, isSupabaseConfigured } from "@/lib/supabase/env";

/** Cliente con service role (solo scripts / tareas de servidor privilegiadas). */
export function createAdminClient() {
  if (!isSupabaseConfigured() || !getSupabaseServiceRoleKey()) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / ANON_KEY / SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
