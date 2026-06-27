"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type ClassTemplate = Database["public"]["Tables"]["class_templates"]["Row"];

const DAY_NAMES = [
  "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo",
];

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getWeekDays() {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      wd: DAY_LABELS[i],
      n: d.getDate(),
      date: d.toISOString().slice(0, 10),
      today: d.toDateString() === today.toDateString(),
    };
  });
}

export default function ClasesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<string>("todos");
  const [selDay, setSelDay] = useState(() => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [templates, setTemplates] = useState<ClassTemplate[]>([]);
  const [bookingsMap, setBookingsMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const week = getWeekDays();
  const day = week[selDay];
  const filters = ["todos", "Yoga", "Pilates"];

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const date = week[selDay].date;

    const { data: tmpls } = await supabase
      .from("class_templates")
      .select("*")
      .eq("day_of_week", selDay)
      .eq("is_active", true)
      .order("time_start");

    setTemplates(tmpls || []);

    if (tmpls && tmpls.length > 0) {
      const map: Record<string, number> = {};
      await Promise.all(
        tmpls.map(async (t) => {
          const { data } = await supabase.rpc("count_confirmed", {
            p_template_id: t.id,
            p_date: date,
          });
          map[t.id] = (data as number) || 0;
        })
      );
      setBookingsMap(map);
    }

    setLoading(false);
  }, [selDay]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filtered = templates.filter(
    (t) => filter === "todos" || t.discipline === filter
  );

  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <img
            src="/assets/logo-pilates.png"
            alt="Pampa Estudio"
            className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3"
          />
        </div>
        {!user && (
          <Link
            href="/login"
            className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
          >
            Entrar
          </Link>
        )}
      </header>

      <FunnelSteps current={3} />

      <div className="flex items-baseline justify-between px-[22px] pb-1 pt-[10px]">
        <h2 className="font-serif text-[27px] tracking-[-0.015em]">Clases</h2>
        <span className="text-xs text-muted-foreground">
          {day.wd} {day.n} {MONTHS[new Date(day.date + "T12:00:00").getMonth()]}
        </span>
      </div>

      <div className="flex gap-[7px] overflow-x-auto px-[22px] pb-1 pt-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 cursor-pointer whitespace-nowrap rounded-[100px] border border-[rgba(26,25,31,.14)] px-[15px] py-2 text-[12.5px] font-medium transition-all",
              filter === f
                ? "border-foreground bg-foreground text-white"
                : "bg-transparent text-muted-foreground hover:border-ink-dim"
            )}
          >
            {f === "todos" ? "Todos" : f}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto px-[22px] py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {week.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelDay(i)}
            className={cn(
              "flex w-[50px] shrink-0 cursor-pointer flex-col items-center gap-[5px] rounded-[16px] border border-transparent px-0 py-[9px] transition-all hover:bg-muted",
              i === selDay && "border-foreground bg-foreground",
              d.today && i !== selDay && "text-primary"
            )}
          >
            <span
              className={cn(
                "text-[10px] font-semibold tracking-[0.06em] uppercase",
                i === selDay ? "text-white/55" : "text-ink-dim"
              )}
            >
              {d.wd}
            </span>
            <span
              className={cn(
                "font-serif text-[21px] leading-none",
                i === selDay ? "text-white" : "text-muted-foreground",
                d.today && i !== selDay && "text-primary"
              )}
            >
              {d.n}
            </span>
            <span
              className={cn(
                "size-1 rounded-full",
                i === selDay ? "bg-secondary" : "bg-[#DBDAD6]"
              )}
            />
          </button>
        ))}
      </div>

      <div className="px-[22px] pb-[2px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
          {day.today ? "Hoy · " : ""}
          {DAY_NAMES[selDay]}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-[6px]">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[96px] animate-pulse rounded-[22px] bg-muted"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-[60px] px-[30px] text-center">
            <div className="font-serif italic text-[30px] text-[#DBDAD6]">○</div>
            <p className="mt-2 text-[13px] text-muted-foreground leading-relaxed">
              {templates.length === 0
                ? "Día de descanso."
                : `Sin clases de ${filter} este día.`}
            </p>
          </div>
        ) : (
          filtered.map((c, idx) => {
            const taken = bookingsMap[c.id] || 0;
            const free = c.max_capacity - taken;
            const full = free <= 0;
            const pct =
              c.max_capacity > 0
                ? Math.round((taken / c.max_capacity) * 100)
                : 0;
            const isNext = day.today && idx === 0;

            return (
              <div
                key={c.id}
                onClick={() => {
                  const sp = new URLSearchParams({
                    id: c.id,
                    date: day.date,
                    name: c.name,
                    time: c.time_start.slice(0, 5),
                    end: c.time_end.slice(0, 5),
                    type: c.discipline,
                    teacher: c.teacher,
                    room: c.room,
                    taken: String(taken),
                    max: String(c.max_capacity),
                    day: String(selDay),
                    dayN: String(day.n),
                    dayName: DAY_NAMES[selDay],
                  });
                  router.push(`/clases/detalle?${sp.toString()}`);
                }}
                className={cn(
                  "relative flex cursor-pointer items-stretch gap-[14px] rounded-[22px] border border-border bg-card p-4 transition-all duration-[160ms] hover:border-[rgba(26,25,31,.14)] active:scale-[.99]",
                  isNext &&
                    "shadow-[0_0_0_1.5px_var(--color-primary)] border-transparent"
                )}
              >
                {isNext && (
                  <span className="absolute top-[-1px] right-[14px] -translate-y-1/2 rounded-[100px] bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] px-[9px] py-[3px] text-[9.5px] font-semibold tracking-[0.08em] uppercase text-foreground">
                    Próxima
                  </span>
                )}
                <div className="flex w-[54px] shrink-0 flex-col justify-center border-r border-border pr-[14px]">
                  <span className="font-serif text-xl leading-none">
                    {c.time_start.slice(0, 5)}
                  </span>
                  <span className="mt-[3px] text-[11px] text-ink-dim">
                    {c.time_end.slice(0, 5)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg leading-[1.15]">
                    {c.name}
                  </h3>
                  <p className="mt-[2px] text-[12.5px] text-muted-foreground">
                    {c.teacher} · {c.room}
                  </p>
                  <div className="mt-[7px] flex items-center gap-2">
                    <div className="h-[3px] max-w-[84px] flex-1 overflow-hidden rounded-[2px] bg-[#DBDAD6]">
                      <div
                        className={cn(
                          "h-full rounded-[2px] transition-all",
                          full ? "bg-[#DBDAD6]" : "bg-primary"
                        )}
                        style={{ width: `${full ? 100 : pct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[11.5px] font-medium whitespace-nowrap",
                        full ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {full
                        ? "Lista de espera"
                        : `${free} lugar${free > 1 ? "es" : ""}`}
                    </span>
                  </div>
                </div>
                <span className="self-center shrink-0 text-base text-ink-dim">
                  ›
                </span>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
