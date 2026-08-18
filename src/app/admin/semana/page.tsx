"use client";

import { useState, useEffect } from "react";
import { WeekCalendar } from "@/components/admin/week-calendar";
import { fetchWeekData } from "./actions";
import type { WeekEvent } from "./actions";
import { toLocalDateStr } from "@/lib/utils";

function getWeekDays(date: Date) {
  const todayDow = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - todayDow);

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const today = new Date();
    return {
      wd: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][i],
      n: d.getDate(),
      date: toLocalDateStr(d),
      today: d.toDateString() === today.toDateString(),
    };
  });
}

export default function SemanaPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - dow);
    return d;
  });
  const [data, setData] = useState<Record<number, WeekEvent[]>>({});
  const [loadedWeek, setLoadedWeek] = useState<number | null>(null);

  const days = getWeekDays(weekStart);

  // Cambiar de semana rápido puede dejar llegando dos respuestas; el flag
  // descarta la vieja para que no pise a la nueva.
  useEffect(() => {
    let cancelled = false;
    const weekDays = getWeekDays(weekStart);
    fetchWeekData(weekDays.map((d, i) => ({ di: i, date: d.date }))).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoadedWeek(weekStart.getTime());
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const loading = loadedWeek !== weekStart.getTime();

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 5);

  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2.5">
        <div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Semana</h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            {days[0].n} – {days[5].n}{" "}
            {months[weekEnd.getMonth()]} {weekEnd.getFullYear()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevWeek}
            className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]"
          >
            ‹ Anterior
          </button>
          <button
            onClick={nextWeek}
            className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]"
          >
            Siguiente ›
          </button>
        </div>
      </div>

      <div data-tour="week">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-ink-dim">Cargando...</div>
          </div>
        ) : (
          <WeekCalendar days={days} data={data} />
        )}
      </div>
    </div>
  );
}
