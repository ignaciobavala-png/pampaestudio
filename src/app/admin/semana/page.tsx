"use client";

import { useState, useEffect, useCallback } from "react";
import { WeekCalendar } from "@/components/admin/week-calendar";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type ClassTemplate = Database["public"]["Tables"]["class_templates"]["Row"];

interface WeekEvent {
  time: string;
  end: string;
  name: string;
  type: "Yoga" | "Pilates";
  teacher: string;
  taken: number;
  max: number;
}

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
      date: d.toISOString().slice(0, 10),
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
  const [loading, setLoading] = useState(true);

  const days = getWeekDays(weekStart);

  const fetchWeek = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const weekDays = getWeekDays(weekStart);

    const result: Record<number, WeekEvent[]> = {};

    for (let di = 0; di < 6; di++) {
      const { data: templates } = await supabase
        .from("class_templates")
        .select("*")
        .eq("day_of_week", di)
        .eq("is_active", true)
        .order("time_start");

      if (!templates) {
        result[di] = [];
        continue;
      }

      const events: WeekEvent[] = [];

      for (const t of templates) {
        const { data: count } = await supabase.rpc("count_confirmed", {
          p_template_id: t.id,
          p_date: weekDays[di].date,
        });

        events.push({
          time: t.time_start.slice(0, 5),
          end: t.time_end.slice(0, 5),
          name: t.name,
          type: t.discipline as "Yoga" | "Pilates",
          teacher: t.teacher.split(" ").slice(0, 2).join(" ").replace(/\.$/, "") + ".",
          taken: (count as number) || 0,
          max: t.max_capacity,
        });
      }

      result[di] = events;
    }

    setData(result);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    fetchWeek();
  }, [fetchWeek]);

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

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-ink-dim">Cargando...</div>
        </div>
      ) : (
        <WeekCalendar days={days} data={data} />
      )}
    </div>
  );
}
