import { getServiceClient } from "@/lib/supabase/admin-guard";
import { getPayment } from "@/lib/mercadopago";

export interface ApplyResult {
  status?: string;
  error?: string;
  ignored?: boolean;
  duplicate_payment?: boolean;
  user_pack_id?: string;
}

/**
 * Consulta el pago a Mercado Pago y aplica su estado a nuestra orden. Lo usan el
 * webhook y la pantalla de retorno: es idempotente (la RPC bloquea la fila), así
 * que da igual cuál llegue primero o si llegan los dos.
 *
 * Devuelve `null` si el pago es de otra orden (no tiene nuestro
 * `external_reference`).
 */
export async function syncMercadoPagoPayment(
  mpPaymentId: string,
  expectedRef?: string
): Promise<ApplyResult | null> {
  const mp = await getPayment(mpPaymentId);
  const ref = mp.external_reference;
  if (!ref) return null;
  // Desde la pantalla de retorno el id viene de la URL: tiene que ser de la orden que se mira.
  if (expectedRef && ref !== expectedRef) return null;

  const { data, error } = await getServiceClient().rpc("apply_mp_payment", {
    p_payment_id: ref,
    p_mp_payment_id: String(mp.id),
    p_mp_status: mp.status,
    p_amount: mp.transaction_amount,
  });
  if (error) throw new Error(`apply_mp_payment: ${error.message}`);

  const result = (data ?? {}) as ApplyResult;
  // Estos tres son plata que se movió sin que la app quede en orden: que se vean en los logs.
  if (result.error || result.duplicate_payment) {
    console.error("[mercadopago] pago a revisar", { ref, mpPaymentId: mp.id, result });
  }
  return result;
}
