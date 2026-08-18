"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import type { AdminClass, ClientOption, Discipline, TemplateOption } from "@/lib/admin-types";

const DISCIPLINE_COLORS: Record<string, string> = {
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
      .select("*, profiles(full_name, medical_notes, user_packs!user_packs_user_id_fkey(packs(name)))")
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
        id: string;
        user_id: string;
        profiles: { full_name: string; medical_notes: string | null; user_packs: { packs: { name: string } | null }[] | null } | null;
      };
      const name = p.profiles?.full_name || "Sin nombre";
      const pack = p.profiles?.user_packs?.[0]?.packs?.name || "Sin pack";
      return {
        bookingId: p.id,
        userId: p.user_id,
        name,
        pack,
        avColor: generateAvColor(name),
        initials: getInitials(name),
        medicalNotes: p.profiles?.medical_notes || "",
      };
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
      templateId: t.id,
      name: t.name,
      type: t.discipline as Discipline,
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

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

/**
 * Defensa en profundidad: además del middleware que protege /admin, verificamos
 * que el usuario de la sesión sea admin antes de invocar RPC con service_role.
 * Devuelve el id del admin. Lanza si no está autorizado.
 */
async function assertAdmin(): Promise<string> {
  const supabase = await getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Acceso denegado");
  return user.id;
}

export type AdminActionResult = { ok: true; message: string } | { ok: false; error: string };

/** 1.2 — Agrega una alumna a una clase manualmente. */
export async function adminBookSpot(
  userId: string,
  templateId: string,
  date: string
): Promise<AdminActionResult> {
  await assertAdmin();
  const admin = getAdminClient();

  const { data, error } = await admin.rpc("admin_book_spot", {
    p_user_id: userId,
    p_template_id: templateId,
    p_date: date,
  });

  if (error) return { ok: false, error: error.message };
  const res = (data ?? {}) as { error?: string; status?: string; position?: number; credit_used?: boolean };
  if (res.error) return { ok: false, error: res.error };

  revalidatePath("/admin");
  if (res.status === "waitlist") {
    return { ok: true, message: `Agregada a lista de espera · #${res.position}` };
  }
  return {
    ok: true,
    message: res.credit_used ? "Agregada a la clase · 1 crédito descontado" : "Agregada a la clase · sin crédito",
  };
}

/** 1.3 — Cambia de horario a una alumna (mueve su reserva a otra clase/fecha). */
export async function adminRescheduleBooking(
  bookingId: string,
  newTemplateId: string,
  newDate: string
): Promise<AdminActionResult> {
  await assertAdmin();
  const admin = getAdminClient();

  const { data, error } = await admin.rpc("admin_reschedule_booking", {
    p_booking_id: bookingId,
    p_new_template_id: newTemplateId,
    p_new_date: newDate,
  });

  if (error) return { ok: false, error: error.message };
  const res = (data ?? {}) as { error?: string; status?: string; waitlist_position?: number };
  if (res.error) return { ok: false, error: res.error };

  revalidatePath("/admin");
  if (res.status === "waitlist") {
    return { ok: true, message: `Horario cambiado · quedó en espera #${res.waitlist_position}` };
  }
  return { ok: true, message: "Horario cambiado · reserva confirmada" };
}

/** Alumnas aprobadas, para el selector de "agregar a la clase". */
export async function fetchClientOptions(): Promise<ClientOption[]> {
  await assertAdmin();
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "client")
    .eq("is_approved", true)
    .order("full_name");
  return (data ?? []).map((p) => ({ id: p.id, name: p.full_name || "Sin nombre" }));
}

/** Clases activas, para el selector de destino al cambiar de horario. */
export async function fetchTemplateOptions(): Promise<TemplateOption[]> {
  await assertAdmin();
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("class_templates")
    .select("id, name, day_of_week, time_start, discipline")
    .eq("is_active", true)
    .order("day_of_week")
    .order("time_start");
  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    dayOfWeek: t.day_of_week,
    timeStart: t.time_start.slice(0, 5),
    discipline: t.discipline,
  }));
}
