"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminVehicleFormSchema, formToDbPayload, type AdminVehicleFormValues } from "@/lib/schemas/admin-vehicle";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { slugifyVehicle } from "@/lib/supabase/map-vehicle";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  if (!isSupabaseConfigured()) throw new Error("Supabase no está configurado");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") throw new Error("Sin permiso de administrador");
  return supabase;
}

/** Siguiente código TM-XXXX a partir de los stock numbers existentes. */
async function nextStockNumber(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("vehicles").select("stock_number");
  if (error) throw new Error(error.message);

  let max = 999; // el primero será TM-1000
  for (const row of data ?? []) {
    const match = String(row.stock_number ?? "").match(/^TM-(\d+)$/i);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return `TM-${max + 1}`;
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase no está configurado. Revisá .env" };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email y contraseña requeridos" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = (user?.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "admin") {
    await supabase.auth.signOut();
    return { ok: false, error: "Esta cuenta no tiene rol admin" };
  }

  redirect("/admin");
}

export async function logoutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function saveVehicleAction(
  id: string | null,
  values: AdminVehicleFormValues,
): Promise<ActionResult & { id?: string }> {
  try {
    const parsed = adminVehicleFormSchema.safeParse(values);
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };

    const supabase = await requireAdmin();

    let stockNumber: string;
    if (id) {
      const { data: existing, error: existingError } = await supabase
        .from("vehicles")
        .select("stock_number")
        .eq("id", id)
        .single();
      if (existingError || !existing?.stock_number) {
        return { ok: false, error: existingError?.message ?? "Vehículo no encontrado" };
      }
      stockNumber = existing.stock_number as string;
    } else {
      stockNumber = await nextStockNumber(supabase);
    }

    const slug = slugifyVehicle({
      year: parsed.data.year,
      make: parsed.data.make,
      model: parsed.data.model,
      stockNumber,
    });
    const payload = formToDbPayload(parsed.data, slug, stockNumber);

    if (id) {
      const { error } = await supabase.from("vehicles").update(payload).eq("id", id);
      if (error) return { ok: false, error: error.message };
      revalidatePath("/");
      revalidatePath("/inventario");
      revalidatePath("/admin");
      return { ok: true, id };
    }

    const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath("/admin");
    return { ok: true, id: data.id as string };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al guardar" };
  }
}

export async function deleteVehicleAction(id: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: images } = await supabase.from("vehicle_images").select("storage_path").eq("vehicle_id", id);
    const paths = (images ?? []).map((i) => i.storage_path as string).filter(Boolean);
    if (paths.length) await supabase.storage.from("vehicles").remove(paths);
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al borrar" };
  }
}

export async function setVehicleStatusAction(
  id: string,
  status: "available" | "reserved" | "sold",
): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { error } = await supabase.from("vehicles").update({ status }).eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al actualizar" };
  }
}

export async function uploadVehicleImagesAction(vehicleId: string, formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (files.length === 0) return { ok: false, error: "No hay archivos" };

    const { data: existing } = await supabase
      .from("vehicle_images")
      .select("sort_order")
      .eq("vehicle_id", vehicleId)
      .order("sort_order", { ascending: false })
      .limit(1);
    let nextOrder = (existing?.[0]?.sort_order as number | undefined) ?? -1;

    for (const file of files) {
      nextOrder += 1;
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${vehicleId}/${Date.now()}-${nextOrder}.${ext}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: upErr } = await supabase.storage.from("vehicles").upload(path, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
      if (upErr) return { ok: false, error: upErr.message };

      const { error: rowErr } = await supabase.from("vehicle_images").insert({
        vehicle_id: vehicleId,
        storage_path: path,
        alt: file.name,
        sort_order: nextOrder,
      });
      if (rowErr) return { ok: false, error: rowErr.message };
    }

    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath(`/admin/vehicles/${vehicleId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al subir" };
  }
}

export async function deleteVehicleImageAction(imageId: string, vehicleId: string): Promise<ActionResult> {
  try {
    const supabase = await requireAdmin();
    const { data: image, error: findErr } = await supabase
      .from("vehicle_images")
      .select("storage_path")
      .eq("id", imageId)
      .single();
    if (findErr) return { ok: false, error: findErr.message };
    if (image?.storage_path) await supabase.storage.from("vehicles").remove([image.storage_path as string]);
    const { error } = await supabase.from("vehicle_images").delete().eq("id", imageId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/admin/vehicles/${vehicleId}`);
    revalidatePath("/");
    revalidatePath("/inventario");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Error al borrar foto" };
  }
}
