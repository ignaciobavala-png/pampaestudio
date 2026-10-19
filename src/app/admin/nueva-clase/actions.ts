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

/** Datos de una clase existente para precargar el formulario de edición. */
export async function fetchClassForEdit(id: string): Promise<NewClassData | null> {
  await assertAdmin();
  const { data } = await getServiceClient()
    .from("class_templates")
    .select(
      "name, teacher_id, room_id, class_type_id, day_of_week, time_start, time_end, max_capacity, description, recurrence, specific_date, is_standalone, price"
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  return {
    name: data.name,
    teacher_id: data.teacher_id ?? "",
    room_id: data.room_id ?? "",
    class_type_id: data.class_type_id ?? "",
    day_of_week: data.day_of_week,
    time_start: data.time_start.slice(0, 5),
    time_end: data.time_end.slice(0, 5),
    max_capacity: data.max_capacity,
    description: data.description,
    recurrence: data.recurrence as "weekly" | "once",
    specific_date: data.specific_date,
    is_standalone: data.is_standalone,
    price: data.price,
  };
}

/** Cambia horario, instructora, sala, cupo, etc. de una clase existente. */
export async function updateClassTemplate(id: string, data: NewClassData) {
  await assertAdmin();

  if (data.recurrence === "once" && !data.specific_date) {
    return { error: "Una clase única necesita una fecha." };
  }

  const { error } = await getServiceClient()
    .from("class_templates")
    .update({
      ...data,
      specific_date: data.recurrence === "once" ? data.specific_date : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/semana");
  revalidatePath("/clases");
  return { error: null };
}
