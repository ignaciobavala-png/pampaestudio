"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { refreshPaymentStatus, type PaymentStatus } from "../actions";

const MAX_ATTEMPTS = 8;
const POLL_MS = 2500;

type Loaded = { key: string; status: PaymentStatus | "error"; packName: string | null };

function ResultadoContent() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? "";
  // Mercado Pago agrega payment_id / collection_id al volver.
  const mpPaymentId = params.get("payment_id") ?? params.get("collection_id") ?? undefined;
  const key = `${ref}:${mpPaymentId ?? ""}`;

  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    refreshPaymentStatus(ref, mpPaymentId).then((res) => {
      if (cancelled) return;
      if ("error" in res) {
        setLoaded({ key, status: "error", packName: null });
        return;
      }
      setLoaded({ key, status: res.status, packName: res.packName });
      // Los medios diferidos (efectivo, transferencia) tardan: seguimos mirando un rato.
      if (res.status === "pending" && attempt < MAX_ATTEMPTS) {
        timer = setTimeout(() => setAttempt((a) => a + 1), POLL_MS);
      }
    });
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [ref, mpPaymentId, key, attempt]);

  const status = loaded?.key === key ? loaded.status : null;
  const stillWaiting = status === "pending" && attempt >= MAX_ATTEMPTS;

  const view = (() => {
    if (status === null || (status === "pending" && !stillWaiting))
      return { icon: "⏳", title: "Confirmando tu pago…", body: "Esto tarda unos segundos. No cierres la pantalla.", cta: null };
    if (status === "approved")
      return {
        icon: "✅",
        title: "¡Pago acreditado!",
        body: `Tu pack ${loaded?.packName ?? ""} ya está activo. Ya podés reservar tu primera clase.`,
        cta: { href: "/clases", label: "Elegir una clase" },
      };
    if (stillWaiting)
      return {
        icon: "🕒",
        title: "Tu pago está pendiente",
        body: "Mercado Pago todavía no lo acreditó. Apenas llegue, el pack se activa solo y te avisamos.",
        cta: { href: "/agenda", label: "Ir a mi agenda" },
      };
    if (status === "rejected" || status === "cancelled")
      return {
        icon: "⚠️",
        title: "No se pudo completar el pago",
        body: "No se te cobró nada. Podés intentar de nuevo con otro medio de pago.",
        cta: { href: "/", label: "Volver a los packs" },
      };
    if (status === "review")
      return {
        icon: "🔎",
        title: "Estamos revisando tu pago",
        body: "Recibimos tu pago pero necesitamos verificarlo a mano. Te escribimos por WhatsApp.",
        cta: { href: "/agenda", label: "Ir a mi agenda" },
      };
    if (status === "refunded")
      return { icon: "↩️", title: "Pago reembolsado", body: "El pago fue devuelto.", cta: { href: "/", label: "Volver a los packs" } };
    return {
      icon: "⚠️",
      title: "No encontramos tu orden",
      body: "Si pagaste, no te preocupes: el pack se activa solo cuando Mercado Pago confirme el pago.",
      cta: { href: "/agenda", label: "Ir a mi agenda" },
    };
  })();

  return (
    <AppShell>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-[20px] bg-bordo-surface text-[32px]">{view.icon}</div>
        <h1 className="font-serif text-2xl tracking-[-0.01em]">{view.title}</h1>
        <p className="max-w-[300px] text-[13px] leading-relaxed text-muted-foreground">{view.body}</p>
        {view.cta && (
          <Link href={view.cta.href} className="mt-2 w-full max-w-[300px]">
            <Button className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold">{view.cta.label}</Button>
          </Link>
        )}
      </div>
    </AppShell>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={<div className="p-6 text-muted-foreground">Cargando...</div>}>
      <ResultadoContent />
    </Suspense>
  );
}
