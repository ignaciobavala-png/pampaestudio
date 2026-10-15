import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/mercadopago";
import { syncMercadoPagoPayment } from "@/lib/payments";

/**
 * Webhook de Mercado Pago (la URL viaja en cada preferencia como
 * `notification_url`, no hace falta configurarla en el panel).
 *
 * Nunca confía en el body: toma el id del pago, lo vuelve a consultar a la API y
 * actúa sobre esa respuesta. Un error transitorio devuelve 500 para que Mercado
 * Pago reintente; todo lo demás devuelve 200.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  };

  const dataId = url.searchParams.get("data.id") ?? (body.data?.id != null ? String(body.data.id) : null);
  const type = url.searchParams.get("type") ?? url.searchParams.get("topic") ?? body.type;

  if (
    !verifyWebhookSignature({
      signatureHeader: request.headers.get("x-signature"),
      requestId: request.headers.get("x-request-id"),
      dataId: url.searchParams.get("data.id") ?? dataId,
    })
  ) {
    return NextResponse.json({ error: "firma inválida" }, { status: 401 });
  }

  // Solo nos interesan los pagos (también llegan merchant_order, etc.).
  if (type !== "payment" || !dataId) return NextResponse.json({ ok: true, ignored: true });

  try {
    const result = await syncMercadoPagoPayment(dataId);
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    console.error("[mercadopago] webhook falló", { dataId, err });
    return NextResponse.json({ error: "no se pudo procesar" }, { status: 500 });
  }
}

// MP también hace un GET de verificación al configurar la URL en el panel.
export function GET() {
  return NextResponse.json({ ok: true });
}
