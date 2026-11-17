import { NextResponse } from "next/server";
import { z } from "zod";

import { leadSchema } from "@/lib/schemas/lead";

/**
 * Endpoint de captura de leads.
 * Valida con el MISMO schema que usan los formularios del cliente.
 *
 * TODO(integración): enviar a CRM / email / Slack aquí. Hoy solo valida y responde 201.
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", details: z.flattenError(parsed.error) }, { status: 422 });
  }

  // Honeypot relleno => bot. Respondemos "ok" para no darle señales.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true }, { status: 202 });
  }

  // No se loguean datos personales.
  console.info("[lead] recibido", { source: parsed.data.source, hasSimulation: Boolean(parsed.data.simulation) });

  return NextResponse.json({ ok: true }, { status: 201 });
}
