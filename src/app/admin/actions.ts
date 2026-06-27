"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { AdminClass } from "@/lib/admin-types";

const DISCIPLINE_COLORS: Record<string, string> = {
  Yoga: "var(--color-primary)",
  Pilates: "#9A7B2E",
};

function generateAvColor(name: string): string {
  const colors = [
    "#490419", "#7C6FF2", "#6E63C8", "#5E6BD6",
    "#4E7C9E", "#8A6FD0", "#5B7C8A", "#7355C8",
    "#6E6D78", "#9A7B2E",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
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

export type AdminDayResult = {
  classes: AdminClass[];
  maxes: number[];
  kpis: { total: number; ocupacion: number; espera: number };
};

export async function fetchAdminDay(
  dayIndex: number,
  date: string
): Promise<AdminDayResult> {
  const supabase = await getSupabase();

  const { data: templates } = await supabase
    .from("class_templates")
    .select("*")
    .eq("day_of_week", dayIndex)
    .eq("is_active", true)
    .order("time_start");

  if (!templates || templates.length === 0) {
    return { classes: [], maxes: [], kpis: { total: 0, ocupacion: 0, espera: 0 } };
  }

  const classesData: AdminClass[] = [];
  const maxes: number[] = [];
  let totalConfirmed = 0;
  let totalWL = 0;
  let totalCapacity = 0;

  for (const t of templates) {
    const { data: confirmed } = await supabase
      .from("bookings")
      .select("*, profiles(full_name, user_packs(packs(name)))")
      .eq("template_id", t.id)
      .eq("date", date)
      .eq("status", "confirmed")
      .order("created_at");

    const { data: waitlist } = await supabase
      .from("bookings")
      .select("*, profiles(full_name)")
      .eq("template_id", t.id)
      .eq("date", date)
      .eq("status", "waitlist")
      .order("waitlist_position");

    const att: AdminClass["att"] = (confirmed || []).map((b) => {
      const p = b as unknown as {
        profiles: { full_name: string; user_packs: { packs: { name: string } | null }[] | null } | null;
      };
      const name = p.profiles?.full_name || "Sin nombre";
      const pack = p.profiles?.user_packs?.[0]?.packs?.name || "Sin pack";
      return [name, pack, generateAvColor(name), getInitials(name)];
    });

    const wl: AdminClass["wl"] = (waitlist || []).map((b) => {
      const p = b as unknown as { profiles: { full_name: string } | null };
      const name = p.profiles?.full_name || "Sin nombre";
      const since = b.created_at
        ? new Date(b.created_at).toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      return [name, generateAvColor(name), getInitials(name), since];
    });

    const taken = (confirmed || []).length;
    totalConfirmed += taken;
    totalWL += (waitlist || []).length;
    totalCapacity += t.max_capacity;

    classesData.push({
      name: t.name,
      type: t.discipline as "Yoga" | "Pilates",
      room: t.room,
      teacher: t.teacher,
      time: t.time_start.slice(0, 5),
      end: t.time_end.slice(0, 5),
      taken,
      max: t.max_capacity,
      color: DISCIPLINE_COLORS[t.discipline] || "var(--color-primary)",
      att,
      wl,
    });
    maxes.push(t.max_capacity);
  }

  return {
    classes: classesData,
    maxes,
    kpis: {
      total: templates.length,
      ocupacion: totalCapacity > 0 ? Math.round((totalConfirmed / totalCapacity) * 100) : 0,
      espera: totalWL,
    },
  };
}

export async function updateClassMaxCapacity(
  className: string,
  dayIndex: number,
  newMax: number
): Promise<void> {
  const supabase = await getSupabase();
  const { data: template } = await supabase
    .from("class_templates")
    .select("id")
    .eq("name", className)
    .eq("day_of_week", dayIndex)
    .single();

  if (template) {
    await supabase
      .from("class_templates")
      .update({ max_capacity: newMax })
      .eq("id", template.id);
  }
  revalidatePath("/admin");
}

export async function cancelClass(
  className: string,
  dayIndex: number,
  date: string
): Promise<{ creditsRestored: number }> {
  const supabase = await getSupabase();
  const { data: template } = await supabase
    .from("class_templates")
    .select("id")
    .eq("name", className)
    .eq("day_of_week", dayIndex)
    .single();

  if (!template) return { creditsRestored: 0 };

  const { data: result } = await supabase.rpc("admin_cancel_class", {
    p_template_id: template.id,
    p_date: date,
  });

  revalidatePath("/admin");
  const res = result as { credits_restored?: number };
  return { creditsRestored: res?.credits_restored ?? 0 };
}
