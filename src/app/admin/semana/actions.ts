"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export interface WeekEvent {
  time: string;
  end: string;
  name: string;
  type: "Yoga" | "Pilates";
  teacher: string;
  taken: number;
  max: number;
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

export async function fetchWeekData(
  weekDates: { di: number; date: string }[]
): Promise<Record<number, WeekEvent[]>> {
  const supabase = await getSupabase();
  const result: Record<number, WeekEvent[]> = {};

  for (const { di, date } of weekDates) {
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
        p_date: date,
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

  return result;
}
