"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { cn } from "@/lib/utils";

interface ClassItem {
  time: string; end: string; name: string; type: string;
  teacher: string; room: string; taken: number; max: number;
}

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const DATA: Record<number, ClassItem[]> = {
  0: [
    { time: "08:00", end: "09:15", name: "Vinyasa Flow", type: "Yoga", teacher: "Valeria Martínez", room: "Sala 1", taken: 7, max: 10 },
    { time: "18:30", end: "19:30", name: "Pilates Reformer", type: "Pilates", teacher: "Sofía Rodríguez", room: "Reformer", taken: 6, max: 6 },
  ],
  3: [
    { time: "07:30", end: "08:30", name: "Pilates Mat", type: "Pilates", teacher: "Sofía Rodríguez", room: "Sala 2", taken: 5, max: 10 },
    { time: "19:00", end: "20:15", name: "Yin & Restore", type: "Yoga", teacher: "Camila López", room: "Sala 1", taken: 8, max: 10 },
  ],
  4: [
    { time: "07:00", end: "08:15", name: "Vinyasa Flow Mañana", type: "Yoga", teacher: "Valeria Martínez", room: "Sala 1", taken: 9, max: 10 },
    { time: "08:30", end: "09:30", name: "Pilates Reformer", type: "Pilates", teacher: "Sofía Rodríguez", room: "Reformer", taken: 6, max: 6 },
    { time: "10:00", end: "11:15", name: "Hatha Principiantes", type: "Yoga", teacher: "Camila López", room: "Sala 1", taken: 5, max: 10 },
    { time: "19:00", end: "20:00", name: "Pilates Mat Intensivo", type: "Pilates", teacher: "Sofía Rodríguez", room: "Sala 2", taken: 8, max: 10 },
    { time: "20:30", end: "21:30", name: "Yin & Restore", type: "Yoga", teacher: "Camila López", room: "Sala 1", taken: 4, max: 10 },
  ],
  5: [
    { time: "09:00", end: "10:15", name: "Slow Flow", type: "Yoga", teacher: "Valeria Martínez", room: "Sala 1", taken: 6, max: 10 },
    { time: "11:00", end: "12:00", name: "Pilates Reformer", type: "Pilates", teacher: "Sofía Rodríguez", room: "Reformer", taken: 5, max: 6 },
  ],
};

interface DayItem { wd: string; n: number; today?: boolean }

const WEEK: DayItem[] = [
  { wd: "Lun", n: 9 }, { wd: "Mar", n: 10 }, { wd: "Mié", n: 11 },
  { wd: "Jue", n: 12 }, { wd: "Vie", n: 13, today: true }, { wd: "Sáb", n: 14 }, { wd: "Dom", n: 15 },
];

export default function ClasesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("todos");
  const [selDay, setSelDay] = useState(4);

  const filters = ["todos", "Yoga", "Pilates"];
  const day = WEEK[selDay];
  const list = (DATA[selDay] || []).filter((c) => filter === "todos" || c.type === filter);

  return (
    <AppShell>
      <header className="flex shrink-0 items-start justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <div className="font-serif text-[21px] tracking-[-0.01em] leading-none">
            Pampa<span className="ml-0.5 inline-block size-[5px] rounded-full bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] align-middle" />
          </div>
          <div className="mt-px text-[10px] font-medium tracking-[0.14em] uppercase text-ink-dim">Pilates & Yoga</div>
        </div>
        <button className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]">Entrar</button>
      </header>

      <FunnelSteps current={3} />

      <div className="flex items-baseline justify-between px-[22px] pb-1 pt-[10px]">
        <h2 className="font-serif text-[27px] tracking-[-0.015em]">Clases</h2>
        <span className="text-xs text-muted-foreground">{day.wd} {day.n} jun</span>
      </div>

      <div className="flex gap-[7px] overflow-x-auto px-[22px] pb-1 pt-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("shrink-0 cursor-pointer whitespace-nowrap rounded-[100px] border border-[rgba(26,25,31,.14)] px-[15px] py-2 text-[12.5px] font-medium transition-all",
              filter === f ? "border-foreground bg-foreground text-white" : "bg-transparent text-muted-foreground hover:border-ink-dim")}>
            {f === "todos" ? "Todos" : f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto px-[22px] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WEEK.map((d, i) => (
          <button key={i} onClick={() => setSelDay(i)}
            className={cn("flex w-[50px] shrink-0 cursor-pointer flex-col items-center gap-[5px] rounded-[16px] border border-transparent px-0 py-[9px] transition-all hover:bg-muted",
              i === selDay && "border-foreground bg-foreground", d.today && i !== selDay && "text-primary")}>
            <span className={cn("text-[10px] font-semibold tracking-[0.06em] uppercase", i === selDay ? "text-white/55" : "text-ink-dim")}>{d.wd}</span>
            <span className={cn("font-serif text-[21px] leading-none", i === selDay ? "text-white" : "text-muted-foreground", d.today && i !== selDay && "text-primary")}>{d.n}</span>
            <span className={cn("size-1 rounded-full", i === selDay ? "bg-secondary" : "bg-[#DBDAD6]", !DATA[i]?.length && "opacity-0")} />
          </button>
        ))}
      </div>

      <div className="px-[22px] pb-[2px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">{day.today ? "Hoy · " : ""}{DAY_NAMES[selDay]}</span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-[6px]">
        {list.length === 0 ? (
          <div className="py-[60px] px-[30px] text-center">
            <div className="font-serif italic text-[30px] text-[#DBDAD6]">○</div>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              {DATA[selDay] ? `Sin clases de ${filter} este día.` : "Día de descanso."}
            </p>
          </div>
        ) : (
          list.map((c, idx) => {
            const free = c.max - c.taken;
            const full = free <= 0;
            const pct = Math.round((c.taken / c.max) * 100);
            const isNext = day.today && idx === 0;

            return (
              <div key={`${c.name}-${c.time}`}
                onClick={() => {
                  const sp = new URLSearchParams({ name: c.name, time: c.time, end: c.end, type: c.type, teacher: c.teacher, room: c.room, taken: String(c.taken), max: String(c.max), day: String(selDay), dayN: String(day.n), dayName: DAY_NAMES[selDay] });
                  router.push(`/clases/detalle?${sp.toString()}`);
                }}
                className={cn("relative flex cursor-pointer items-stretch gap-[14px] rounded-[22px] border border-border bg-card p-4 transition-all duration-[160ms] hover:border-[rgba(26,25,31,.14)] active:scale-[.99]",
                  isNext && "shadow-[0_0_0_1.5px_var(--color-primary)] border-transparent")}>
                {isNext && <span className="absolute top-[-1px] right-[14px] -translate-y-1/2 rounded-[100px] bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] px-[9px] py-[3px] text-[9.5px] font-semibold tracking-[0.08em] uppercase text-foreground">Próxima</span>}
                <div className="flex w-[54px] shrink-0 flex-col justify-center border-r border-border pr-[14px]">
                  <span className="font-serif text-xl leading-none">{c.time}</span>
                  <span className="mt-[3px] text-[11px] text-ink-dim">{c.end}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg leading-[1.15]">{c.name}</h3>
                  <p className="mt-[2px] text-[12.5px] text-muted-foreground">{c.teacher} · {c.room}</p>
                  <div className="mt-[7px] flex items-center gap-2">
                    <div className="h-[3px] max-w-[84px] flex-1 overflow-hidden rounded-[2px] bg-[#DBDAD6]">
                      <div className={cn("h-full rounded-[2px] transition-all", full ? "bg-[#DBDAD6]" : "bg-primary")} style={{ width: `${full ? 100 : pct}%` }} />
                    </div>
                    <span className={cn("text-[11.5px] font-medium whitespace-nowrap", full ? "text-primary" : "text-muted-foreground")}>
                      {full ? "Lista de espera" : `${free} lugar${free > 1 ? "es" : ""}`}
                    </span>
                  </div>
                </div>
                <span className="self-center shrink-0 text-base text-ink-dim">›</span>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
