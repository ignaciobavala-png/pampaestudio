"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

const CDESC: Record<string, string> = {
  Yoga: "Práctica de respiración y movimiento fluido. Mat incluido.",
  Pilates: "Trabajo de core y postura. Apto para todos los niveles.",
};

function DetalleContent() {
  const params = useSearchParams();
  const router = useRouter();
  const name = params.get("name") || "";
  const time = params.get("time") || "";
  const end = params.get("end") || "";
  const type = params.get("type") || "";
  const teacher = params.get("teacher") || "";
  const room = params.get("room") || "";
  const taken = parseInt(params.get("taken") || "0");
  const max = parseInt(params.get("max") || "10");
  const dayN = params.get("dayN") || "";
  const dayName = params.get("dayName") || "";
  const free = max - taken;
  const full = free <= 0;

  return (
    <AppShell>
      <header className="flex shrink-0 items-start justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <div className="font-serif text-[21px] tracking-[-0.01em] leading-none">
            Pampa<span className="ml-0.5 inline-block size-[5px] rounded-full bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] align-middle" />
          </div>
          <div className="mt-px text-[10px] font-medium tracking-[0.14em] uppercase text-ink-dim">Pilates & Yoga</div>
        </div>
        <button onClick={() => router.back()} className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]">← Volver</button>
      </header>

      <div className="px-6 pt-2 pb-6">
        <div className="mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">{type} · {room}</div>
        <h1 className="font-serif text-[28px] leading-[1.08] tracking-[-0.02em] mb-3">{name}</h1>

        <div className="my-[14px] border-t border-border">
          {[
            ["Instructora", teacher],
            ["Día", `${dayName} ${dayN} jun`],
            ["Horario", `${time} – ${end}`],
            ["Sala", room],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between border-b border-border py-3">
              <span className="text-[13px] text-muted-foreground">{k}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="my-[14px] flex items-center gap-[13px] rounded-[14px] bg-muted px-4 py-[14px]">
          <div className="font-serif text-[32px] leading-none">{taken}<span className="text-base text-ink-dim">/{max}</span></div>
          <div className="text-[13px] text-muted-foreground leading-relaxed">
            {full ? <>Clase completa. <b className="text-primary font-semibold">Sumate a la lista de espera</b> y te avisamos al instante.</> : <><b className="text-primary font-semibold">{free} lugar{free > 1 ? "es" : ""} disponible{free > 1 ? "s" : ""}</b><br />Reservá para asegurar el tuyo.</>}
          </div>
        </div>

        <p className="mb-4 text-[13.5px] text-muted-foreground leading-relaxed">{CDESC[type] || ""}</p>

        <Button className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold" onClick={() => router.push(full ? "/confirmacion?wl=true" : "/confirmacion")}>
          {full ? "Unirme a la lista de espera" : "Reservar mi lugar"}
        </Button>
      </div>
    </AppShell>
  );
}

export default function DetallePage() {
  return <Suspense fallback={<div className="p-6 text-muted-foreground">Cargando...</div>}><DetalleContent /></Suspense>;
}
