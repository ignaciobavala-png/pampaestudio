"use server";

import { headers } from "next/headers";
import { getServerSupabase, getServiceClient } from "@/lib/supabase/admin-guard";
import { createPreference, isMercadoPagoConfigured } from "@/lib/mercadopago";
import { syncMercadoPagoPayment } from "@/lib/payments";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getSiteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * Crea la orden de pago y la preferencia de Checkout Pro.
 *
 * El precio sale de la base, nunca del cliente: la pantalla de /pago solo manda
 * el id del pack. La orden queda `pending`; el pack se acredita recién cuando
 * Mercado Pago confirma el pago (webhook o pantalla de retorno).
 */
export async function startMercadoPagoCheckout(
  packId: string
): Promise<{ url: string } | { error: string }> {
  if (!UUID.test(packId)) return { error: "Pack inválido." };
  if (!isMercadoPagoConfigured()) {
    return { error: "El pago con Mercado Pago todavía no está disponible." };
  }

  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tenés que iniciar sesión para pagar." };

  const svc = getServiceClient();
  const { data: pack } = await svc
    .from("packs")
    .select("id, name, price, credits, is_active")
    .eq("id", packId)
    .maybeSingle();
  if (!pack || !pack.is_active) return { error: "Ese pack ya no está disponible." };

  const { data: payment, error: insertError } = await svc
    .from("payments")
    .insert({
      user_id: user.id,
      pack_id: pack.id,
      amount: pack.price,
      method: "mercadopago",
    })
    .select("id")
    .single();
  if (insertError || !payment) {
    console.error("[pago] no se pudo crear la orden", insertError);
    return { error: "No pudimos iniciar el pago. Probá de nuevo." };
  }

  try {
    const preference = await createPreference({
      externalReference: payment.id,
      title: `Pack ${pack.name} · Pampa Estudio`,
      unitPrice: pack.price / 100,
      payerEmail: user.email ?? undefined,
      siteUrl: await getSiteUrl(),
    });
    await svc.from("payments").update({ mp_preference_id: preference.id }).eq("id", payment.id);
    return { url: preference.init_point };
  } catch (err) {
    console.error("[pago] no se pudo crear la preferencia", err);
    await svc.from("payments").update({ status: "cancelled" }).eq("id", payment.id);
    return { error: "No pudimos conectar con Mercado Pago. Probá de nuevo en un rato." };
  }
}

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled" | "refunded" | "review";

/**
 * Estado de una orden de la alumna que está mirando. Si sigue pendiente y
 * Mercado Pago ya devolvió un `payment_id`, lo consulta y lo aplica: así la
 * acreditación no depende solo del webhook (en local, por ejemplo, nunca llega).
 */
export async function refreshPaymentStatus(
  ref: string,
  mpPaymentId?: string
): Promise<{ status: PaymentStatus; packName: string | null } | { error: string }> {
  if (!UUID.test(ref)) return { error: "Orden inválida." };

  const supabase = await getServerSupabase();
  const read = () =>
    supabase.from("payments").select("status, packs(name)").eq("id", ref).maybeSingle();

  // RLS: solo devuelve la orden si es de quien está logueada.
  let { data } = await read();
  if (!data) return { error: "No encontramos esa orden." };

  if (data.status === "pending" && mpPaymentId && /^\d+$/.test(mpPaymentId)) {
    try {
      await syncMercadoPagoPayment(mpPaymentId, ref);
      ({ data } = await read());
    } catch (err) {
      console.error("[pago] no se pudo consultar el pago", err);
    }
  }
  if (!data) return { error: "No encontramos esa orden." };

  const pack = data.packs as unknown as { name: string } | null;
  return { status: data.status as PaymentStatus, packName: pack?.name ?? null };
}
