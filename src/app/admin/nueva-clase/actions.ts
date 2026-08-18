"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, getServerSupabase, getServiceClient } from "@/lib/supabase/admin-guard";

export interface CatalogOption {
  id: string;
  name: string;
}

export interface NewClassCatalogs {
  teachers: CatalogOption[];
  rooms: CatalogOption[];
  classTypes: CatalogOption[];
}

/** Opciones activas para los selectores del formulario. */
export async function fetchNewClassCatalogs(): Promise<NewClassCatalogs> {
  await assertAdmin();
  const client = getServiceClient();

  const [teachers, rooms, classTypes] = await Promise.all([
    client.from("teachers").select("id, full_name").eq("is_active", true).order("sort_order").order("full_name"),
    client.from("rooms").select("id, name").eq("is_active", true).order("sort_order").order("name"),
    client.from("class_types").select("id, name").eq("is_active", true).order("sort_order").order("name"),
  ]);

  return {
    teachers: (teachers.data ?? []).map((t) => ({ id: t.id, name: t.full_name })),
    rooms: (rooms.data ?? []).map((r) => ({ id: r.id, name: r.name })),
    classTypes: (classTypes.data ?? []).map((c) => ({ id: c.id, name: c.name })),
  };
}

export interface NewClassData {
  name: string;
  teacher_id: string;
  room_id: string;
  class_type_id: string;
  day_of_week: number;
  time_start: string;
  time_end: string;
  max_capacity: number;
  description: string | null;
  /** `weekly` se repite todas las semanas; `once` pasa solo en `specific_date`. */
  recurrence: "weekly" | "once";
  specific_date: string | null;
  /** Fuerza que la clase sea suelta aunque su tipo esté dentro de un pack. */
  is_standalone: boolean;
  /** Precio individual en centavos. Solo se cobra si la clase termina siendo suelta. */
  price: number | null;
}

export async function createClassTemplate(data: NewClassData) {
  const supabase = await getServerSupabase();

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return { error: "No autenticado" };
  }

  if (data.recurrence === "once" && !data.specific_date) {
    return { error: "Una clase única necesita una fecha." };
  }

  const { error } = await supabase.from("class_templates").insert({
    ...data,
    // El estudio es solo Pilates; la columna queda por las clases archivadas.
    discipline: "Pilates",
    specific_date: data.recurrence === "once" ? data.specific_date : null,
    created_by: userData.user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/semana");
  return { error: null };
}
