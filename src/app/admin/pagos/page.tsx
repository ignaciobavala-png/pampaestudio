"use client";

import { useEffect, useState } from "react";
import {
  clearMpSecret,
  fetchMpStatus,
  saveMpCredentials,
  testMpConnection,
  type MpResult,
  type MpStatus,
  type SecretStatus,
} from "./actions";
import type { MpSecretKey } from "@/lib/mercadopago";

const labelCls = "text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim";
const fieldCls =
  "w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-mono text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white";
const btnCls =
  "cursor-pointer rounded-[10px] px-4 py-2 text-[13px] font-semibold disabled:cursor-default disabled:opacity-50";

function Badge({ status }: { status: SecretStatus }) {
  if (!status.source) {
    return <span className="rounded-full bg-naranja-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-destructive">Falta</span>;
  }
  return (
    <span className="rounded-full bg-[#E6F2EA] px-2.5 py-0.5 text-[11.5px] font-semibold text-[#2E6B45]">
      Cargada {status.hint} · {status.source === "panel" ? "desde el panel" : "desde Vercel"}
    </span>
  );
}

function SecretField({
  title,
  hint,
  placeholder,
  status,
  value,
  onChange,
  onClear,
  busy,
}: {
  title: string;
  hint: string;
  placeholder: string;
  status: SecretStatus;
  value: string;
  onChange: (v: string) => void;
  onClear: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className={labelCls}>{title}</span>
        <Badge status={status} />
        {status.source === "panel" && (
          <button type="button" disabled={busy} onClick={onClear} className="cursor-pointer text-[12px] text-destructive hover:underline">
            Quitar
          </button>
        )}
      </div>
      <input
        type="password"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={status.source ? "Pegá una nueva para reemplazarla" : placeholder}
        className={fieldCls}
      />
      <p className="text-[12px] text-ink-dim">{hint}</p>
    </div>
  );
}

export default function PagosPage() {
  const [status, setStatus] = useState<MpStatus | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [accessToken, setAccessToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MpResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchMpStatus().then((data) => {
      if (!cancelled) setStatus(data);
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const run = async (action: () => Promise<MpResult>, reload = true) => {
    setBusy(true);
    setResult(null);
    const res = await action();
    setBusy(false);
    setResult(res);
    if (res.ok && reload) setRefreshKey((k) => k + 1);
    return res;
  };

  const save = async () => {
    const res = await run(() => saveMpCredentials({ accessToken, webhookSecret }));
    if (res.ok) {
      setAccessToken("");
      setWebhookSecret("");
    }
  };

  const clear = (key: MpSecretKey) => run(() => clearMpSecret(key));

  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-semibold">Cobros con Mercado Pago</h1>
        <p className="mt-1 text-[13.5px] text-ink-dim">
          Cargá acá las claves de tu cuenta de Mercado Pago. Se guardan en forma privada y se usan
          enseguida, sin tocar nada más.
        </p>
      </div>

      {status === null ? (
        <p className="text-[13px] text-ink-dim">Cargando…</p>
      ) : (
        <div className="flex flex-col gap-5 rounded-[16px] bg-white p-5">
          <SecretField
            title="Access Token"
            hint="En Mercado Pago: Tu negocio → Configuración → Credenciales de producción. Empieza con APP_USR-. Lo verificamos con Mercado Pago antes de guardarlo."
            placeholder="APP_USR-…"
            status={status.accessToken}
            value={accessToken}
            onChange={setAccessToken}
            onClear={() => clear("mercadopago_access_token")}
            busy={busy}
          />
          <SecretField
            title="Clave secreta del webhook (opcional)"
            hint="Refuerza la seguridad de los avisos de pago. Sin ella igual funciona."
            placeholder="Clave secreta"
            status={status.webhookSecret}
            value={webhookSecret}
            onChange={setWebhookSecret}
            onClear={() => clear("mercadopago_webhook_secret")}
            busy={busy}
          />

          <div className="flex flex-wrap gap-2">
            <button
              disabled={busy || (!accessToken.trim() && !webhookSecret.trim())}
              onClick={save}
              className={`${btnCls} bg-primary text-white`}
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
            <button
              disabled={busy || !status.accessToken.source}
              onClick={() => run(testMpConnection, false)}
              className={`${btnCls} bg-[#F1F1EF]`}
            >
              Probar conexión
            </button>
          </div>

          {result && (
            <p className={`text-[13px] ${result.ok ? "text-[#2E6B45]" : "text-destructive"}`}>
              {result.ok ? result.message : result.error}
            </p>
          )}

          <div className="border-t border-[rgba(26,25,31,.085)] pt-4">
            <span className={labelCls}>URL de avisos (webhook)</span>
            <p className="mt-1 break-all font-mono text-[12.5px]">{status.webhookUrl}</p>
            <p className="mt-1 text-[12px] text-ink-dim">
              Informativa: cada cobro ya la envía sola, no hace falta cargarla en Mercado Pago.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
