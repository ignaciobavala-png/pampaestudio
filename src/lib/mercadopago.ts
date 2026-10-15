import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Cliente mínimo de Mercado Pago (Checkout Pro) para el servidor.
 *
 * Solo hace falta el Access Token: el redirect a Checkout Pro no usa la public
 * key. Nunca importar este módulo desde un componente cliente.
 */

const MP_API = "https://api.mercadopago.com";

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("Falta MERCADOPAGO_ACCESS_TOKEN");

  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago ${res.status} en ${path}: ${detail.slice(0, 500)}`);
  }
  return (await res.json()) as T;
}

export interface MpPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface CreatePreferenceInput {
  /** Id de nuestra fila en `payments`. Vuelve en el pago como `external_reference`. */
  externalReference: string;
  title: string;
  /** En pesos (no centavos): es lo que espera Mercado Pago. */
  unitPrice: number;
  payerEmail?: string;
  /** Origen público del sitio, sin barra final. */
  siteUrl: string;
}

export async function createPreference(input: CreatePreferenceInput): Promise<MpPreference> {
  const { siteUrl } = input;
  // Mercado Pago rechaza auto_return con back_urls que no son https (localhost),
  // y no puede notificar a una URL que no es pública.
  const isPublic = siteUrl.startsWith("https://");
  const back = (status: string) => `${siteUrl}/pago/resultado?ref=${input.externalReference}&status=${status}`;

  return mpFetch<MpPreference>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify({
      items: [
        {
          id: input.externalReference,
          title: input.title,
          quantity: 1,
          currency_id: "ARS",
          unit_price: input.unitPrice,
        },
      ],
      payer: input.payerEmail ? { email: input.payerEmail } : undefined,
      external_reference: input.externalReference,
      back_urls: { success: back("success"), pending: back("pending"), failure: back("failure") },
      ...(isPublic
        ? { auto_return: "approved", notification_url: `${siteUrl}/api/mercadopago/webhook` }
        : {}),
      statement_descriptor: "PAMPA ESTUDIO",
      // La reserva vence a los 30 min, igual que el checkout.
      expires: true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    }),
  });
}

export interface MpPayment {
  id: number;
  status: string;
  transaction_amount: number;
  currency_id: string;
  external_reference: string | null;
}

/** Fuente de verdad del estado de un pago: se consulta a la API, no se confía en el body del webhook. */
export function getPayment(id: string | number): Promise<MpPayment> {
  return mpFetch<MpPayment>(`/v1/payments/${encodeURIComponent(String(id))}`);
}

/**
 * Valida la firma `x-signature` de un webhook. Solo corre si hay
 * `MERCADOPAGO_WEBHOOK_SECRET`: el webhook igual vuelve a consultar el pago a la
 * API, así que la firma es endurecimiento, no lo que habilita la acreditación.
 */
export function verifyWebhookSignature(opts: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string | null;
}): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (!secret) return true;
  const { signatureHeader, requestId, dataId } = opts;
  if (!signatureHeader || !dataId) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    })
  ) as Record<string, string>;
  if (!parts.ts || !parts.v1) return false;

  // Los ids alfanuméricos van en minúscula en el manifiesto.
  const manifest = `id:${/^[a-z0-9]+$/i.test(dataId) ? dataId.toLowerCase() : dataId};request-id:${requestId ?? ""};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && timingSafeEqual(a, b);
}
