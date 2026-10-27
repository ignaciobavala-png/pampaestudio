"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { assertAdmin, getServiceClient } from "@/lib/supabase/admin-guard";
import { fetchMpAccount, getMpSecret, type MpSecretKey } from "@/lib/mercadopago";

/**
 * Credenciales de Mercado Pago cargadas por la dueña desde el panel.
 *
 * Los valores nunca vuelven al navegador: la pantalla solo ve de dónde sale la
 * credencial y sus últimos 4 caracteres.
 */

export interface SecretStatus {
  /** `panel` = cargada acá, `env` = variable de entorno de Vercel, `null` = falta. */
  source: "panel" | "env" | null;
  hint: string | null;
}

export interface MpStatus {
  accessToken: SecretStatus;
  webhookSecret: SecretStatus;
  webhookUrl: string;
}

const ENV_NAMES: Record<MpSecretKey, string> = {
  mercadopago_access_token: "MERCADOPAGO_ACCESS_TOKEN",
  mercadopago_webhook_secret: "MERCADOPAGO_WEBHOOK_SECRET",
};

const last4 = (value: string) => `…${value.slice(-4)}`;

async function secretStatus(key: MpSecretKey, stored: string | undefined): Promise<SecretStatus> {
  if (stored) return { source: "panel", hint: last4(stored) };
  const env = process.env[ENV_NAMES[key]];
  return env ? { source: "env", hint: last4(env) } : { source: null, hint: null };
}

async function siteUrl(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function fetchMpStatus(): Promise<MpStatus> {
  await assertAdmin();
  const { data } = await getServiceClient().from("app_secrets").select("key, value");
  const stored = new Map((data ?? []).map((r) => [r.key, r.value]));

  return {
    accessToken: await secretStatus("mercadopago_access_token", stored.get("mercadopago_access_token")),
    webhookSecret: await secretStatus("mercadopago_webhook_secret", stored.get("mercadopago_webhook_secret")),
    webhookUrl: `${await siteUrl()}/api/mercadopago/webhook`,
  };
}

export type MpResult = { ok: true; message: string } | { ok: false; error: string };

/** Guarda lo que venga completo; el Access Token se valida contra Mercado Pago antes. */
export async function saveMpCredentials(input: {
  accessToken?: string;
  webhookSecret?: string;
}): Promise<MpResult> {
  const adminId = await assertAdmin();
  const accessToken = input.accessToken?.trim();
  const webhookSecret = input.webhookSecret?.trim();
  if (!accessToken && !webhookSecret) return { ok: false, error: "No hay nada para guardar." };

  const rows: { key: MpSecretKey; value: string; updated_by: string }[] = [];
  let account = "";

  if (accessToken) {
    if (/\s/.test(accessToken)) return { ok: false, error: "El Access Token no puede tener espacios." };
    const res = await fetchMpAccount(accessToken);
    if (!res.ok) return { ok: false, error: res.error };
    account = res.nickname;
    rows.push({ key: "mercadopago_access_token", value: accessToken, updated_by: adminId });
  }
  if (webhookSecret) {
    rows.push({ key: "mercadopago_webhook_secret", value: webhookSecret, updated_by: adminId });
  }

  const { error } = await getServiceClient()
    .from("app_secrets")
    .upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })));
  if (error) {
    console.error("[pagos] no se pudo guardar", error);
    return { ok: false, error: "No se pudo guardar. Probá de nuevo." };
  }

  revalidatePath("/admin/pagos");
  return {
    ok: true,
    message: account ? `Guardado. Cuenta de Mercado Pago: ${account}.` : "Guardado.",
  };
}

/** Consulta a Mercado Pago con la credencial que está en uso hoy. */
export async function testMpConnection(): Promise<MpResult> {
  await assertAdmin();
  const token = await getMpSecret("mercadopago_access_token");
  if (!token) return { ok: false, error: "Todavía no hay un Access Token cargado." };
  const res = await fetchMpAccount(token);
  if (!res.ok) return { ok: false, error: res.error };
  return { ok: true, message: `Conexión correcta. Cuenta: ${res.nickname}${res.email ? ` (${res.email})` : ""}.` };
}

/** Borra la credencial del panel; si hay una variable de entorno, vuelve a usarse esa. */
export async function clearMpSecret(key: MpSecretKey): Promise<MpResult> {
  await assertAdmin();
  const { error } = await getServiceClient().from("app_secrets").delete().eq("key", key);
  if (error) return { ok: false, error: "No se pudo quitar." };
  revalidatePath("/admin/pagos");
  return { ok: true, message: "Quitado." };
}
