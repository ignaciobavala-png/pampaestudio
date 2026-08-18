"use server";

import { getServerSupabase as getSupabase } from "@/lib/supabase/admin-guard";
import {
  CLASS_TEMPLATE_SELECT,
  dayOccurrenceFilter,
  shortTeacherName,
  teacherName,
} from "@/lib/classes";

export interface WeekEvent {
  time: string;
  end: string;
  name: string;
  teacher: string;
  taken: number;
  max: number;
}

export async function fetchWeekData(
  weekDates: { di: number; date: string }[]
): Promise<Record<number, WeekEvent[]>> {
  const supabase = await getSupabase();
  const result: Record<number, WeekEvent[]> = {};

  for (const { di, date } of weekDates) {
    const { data: templates } = await supabase
      .from("class_templates")
      .select(CLASS_TEMPLATE_SELECT)
      .eq("is_active", true)
      .or(dayOccurrenceFilter(di, date))
      .order("time_start");

    if (!templates) {
      result[di] = [];
      continue;
    }

    const events: WeekEvent[] = [];
    for (const t of templates) {
      const { data: count } = await supabase.rpc("count_confirmed", {
        p_template_id: t.id,
        p_date: date,
      });

      events.push({
        time: t.time_start.slice(0, 5),
        end: t.time_end.slice(0, 5),
        name: t.name,
        teacher: shortTeacherName(teacherName(t)),
        taken: (count as number) || 0,
        max: t.max_capacity,
      });
    }

    result[di] = events;
  }

  return result;
}
