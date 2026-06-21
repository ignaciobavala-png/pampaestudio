"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

function ConfirmacionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const isWL = params.get("wl") === "true";

  return (
    <AppShell>
      <header className="flex shrink-0 items-start justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <div className="font-serif text-[21px] tracking-[-0.01em] leading-none">
            Pampa<span className="ml-0.5 inline-block size-[5px] rounded-full bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] align-middle" />
          </div>
          <div className="mt-px text-[10px] font-medium tracking-[0.14em] uppercase text-ink-dim">Pilates & Yoga</div>
        </div>
      </header>

      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-[18px] bg-bordo-surface text-[26px]">{isWL ? "⏳" : "✅"}</div>
          <div>
            <h1 className="font-serif text-[26px] tracking-[-0.01em]">{isWL ? "Estás en lista de espera" : "¡Reserva confirmada!"}</h1>
            <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">{isWL ? "Te avisamos al instante si se libera un lugar." : "Te esperamos. Recordatorio 2 horas antes."}</p>
          </div>

          <div className="rounded-[22px] border border-border bg-muted p-4 text-left">
            <div className="font-serif text-xl mb-2">Vinyasa Flow</div>
            <div className="flex flex-col gap-[5px]">
              {[["Día", "Lunes 23 jun"], ["Horario", "08:00 – 09:15"], ["Instructora", "Valeria Martínez"], ["Sala", "Sala 1"], ...(!isWL ? [["Créditos restantes", "11"]] : [])].map(([k, v]) => (
                <div key={k} className="flex justify-between text-[13px]"><span className="text-muted-foreground">{k}</span><span>{v}</span></div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[9px]">
            <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-[rgba(26,25,31,.14)] bg-card px-[13px] py-[13px] font-sans text-[13.5px] font-medium transition-all hover:bg-[#EFEEEC]">📅 Agregar a Apple Calendar</button>
            <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[13px] border border-[rgba(26,25,31,.14)] bg-card px-[13px] py-[13px] font-sans text-[13.5px] font-medium transition-all hover:bg-[#EFEEEC]">📅 Agregar a Google Calendar</button>
          </div>

          <Button className="h-auto w-full rounded-[13px] py-[13px] text-sm font-semibold" onClick={() => router.push("/agenda")}>Ver mi agenda →</Button>
        </div>
      </div>
    </AppShell>
  );
}

export default function ConfirmacionPage() {
  return <Suspense fallback={<div className="p-6 text-muted-foreground">Cargando...</div>}><ConfirmacionContent /></Suspense>;
}
