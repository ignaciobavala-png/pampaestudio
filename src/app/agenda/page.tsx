"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import Link from "next/link";

const MNAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const DAYS = ["L","M","X","J","V","S","D"];

interface Booking { dayLabel: string; name: string; time: string; teacher: string; room: string; status: "ok" | "wl" | "done" | "missed"; pos?: number }

const myBookings: Booking[] = [
  { dayLabel: "Vie 13 jun", name: "Hatha Principiantes", time: "10:00", teacher: "Camila L.", room: "Sala 1", status: "ok" },
  { dayLabel: "Vie 13 jun", name: "Pilates Reformer", time: "08:30", teacher: "Sofía R.", room: "Reformer", status: "wl", pos: 2 },
];

const statusLabels: Record<string, { label: string; cls: string }> = {
  ok: { label: "Confirmada", cls: "text-primary bg-bordo-surface" },
  wl: { label: "Lista de espera", cls: "text-amber-text bg-amber-soft" },
  done: { label: "Asistió", cls: "text-accent bg-sage-soft" },
  missed: { label: "Ausente", cls: "text-muted-foreground bg-muted" },
};

export default function AgendaPage() {
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(5);

  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const isToday = (d: number) => calYear === 2026 && calMonth === 5 && d === 13;
  const hasBooking = (d: number) => myBookings.some(b => b.status === "ok" && b.dayLabel.includes(`${d}`));
  const hasWL = (d: number) => myBookings.some(b => b.status === "wl" && b.dayLabel.includes(`${d}`));

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`e${i}`} className="cday" />);
  for (let d = 1; d <= daysInMonth; d++) {
    const today = isToday(d);
    const hb = hasBooking(d);
    const hwl = hasWL(d) && !hb;
    cells.push(
      <div key={d} className={cn("flex aspect-square cursor-pointer flex-col items-center justify-center rounded-[11px] text-[13px] transition-all hover:bg-muted relative",
        today && "bg-foreground text-white font-semibold", !today && "text-muted-foreground")}>
        {d}
        {(hb || hwl) && <span className={cn("absolute bottom-1 size-1 rounded-full", today ? "bg-secondary" : hb ? "bg-primary" : "bg-[#C8960A]")} />}
      </div>
    );
  }

  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
            <img src="/assets/logo-pilates.png" alt="Pampa Estudio" className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3" />
        </div>
        <Link href="/login" className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]">Entrar</Link>
      </header>

      <div className="flex items-center justify-between px-[22px] pb-1 pt-[10px]">
        <h2 className="font-serif text-[22px] tracking-[-0.01em]">{MNAMES[calMonth]} {calYear}</h2>
        <div className="flex gap-1">
          <button onClick={() => calMonth === 0 ? (setCalMonth(11), setCalYear(y => y - 1)) : setCalMonth(m => m - 1)} className="flex size-8 items-center justify-center rounded-[10px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]">‹</button>
          <button onClick={() => calMonth === 11 ? (setCalMonth(0), setCalYear(y => y + 1)) : setCalMonth(m => m + 1)} className="flex size-8 items-center justify-center rounded-[10px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]">›</button>
        </div>
      </div>

      <div className="px-[22px] pb-[2px] pt-[6px]">
        <div className="grid grid-cols-7 gap-[2px] mb-1">
          {DAYS.map(d => <div key={d} className="py-1 text-center text-[10px] font-semibold tracking-[0.05em] uppercase text-ink-dim">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {cells}
        </div>
      </div>

      <div className="mx-[22px] my-[10px] h-px bg-border" />

      <div className="mx-4 mb-2 rounded-[14px] border border-border bg-card px-4 py-[13px] flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">Créditos disponibles</div>
          <div className="text-[11px] text-ink-dim mt-px">Pack Fusión · $62.000</div>
        </div>
        <div className="font-serif text-[22px]">2<span className="text-sm text-ink-dim font-sans"> / 12</span></div>
      </div>

      <div className="px-[22px] py-[10px] pb-[6px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">Próximas reservas</span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {myBookings.map((b, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-[14px] transition-all hover:border-[rgba(26,25,31,.14)] cursor-pointer">
            <div className="w-11 shrink-0 text-center border-r border-border pr-3">
              <div className="font-serif text-[21px] leading-none">{b.dayLabel.split(" ")[0].replace(/\D/g,"")}</div>
              <div className="mt-[2px] text-[10px] font-semibold tracking-[0.08em] uppercase text-ink-dim">{b.dayLabel.split(" ")[1].slice(0,3)}</div>
            </div>
            <div className="flex-1">
              <div className="font-serif text-base">{b.name}</div>
              <div className="mt-[2px] text-xs text-muted-foreground">{b.time} · {b.teacher} · {b.room}</div>
            </div>
            <span className={cn("shrink-0 rounded-[100px] px-[9px] py-1 text-[11px] font-semibold whitespace-nowrap", statusLabels[b.status].cls)}>
              {statusLabels[b.status].label}{b.pos ? ` #${b.pos}` : ""}
            </span>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
