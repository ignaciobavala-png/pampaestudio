"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, getServiceClient } from "@/lib/supabase/admin-guard";
import { deleteClassTemplate } from "../actions";

/**
 * Catálogos del estudio: profesoras, salas y tipos de clase.
 *
 * Antes vivían hardcodeados en el front (y las salas, además, en un CHECK
 * constraint), así que agregar una profe era tocar código y deployar.
 */

export type CatalogKind = "teachers" | "rooms" | "class_types";

export interface CatalogItem {
  id: string;
  name: string;
  isActive: boolean;
  /** Cuántas clases activas la usan: si es > 0 no se puede borrar. */
  inUse: number;
}

export interface Catalogs {
  teachers: CatalogItem[];
  rooms: CatalogItem[];
  class_types: CatalogItem[];
}

/** En `teachers` la columna se llama `full_name`; en las otras dos, `name`. */
function nameColumn(kind: CatalogKind): "full_name" | "name" {
  return kind === "teachers" ? "full_name" : "name";
}

/** La FK de `class_templates` que apunta a cada catálogo. */
function templateColumn(kind: CatalogKind): "teacher_id" | "room_id" | "class_type_id" {
  if (kind === "teachers") return "teacher_id";
  if (kind === "rooms") return "room_id";
  return "class_type_id";
}

async function fetchCatalog(kind: CatalogKind): Promise<CatalogItem[]> {
  const client = getServiceClient();
  const col = nameColumn(kind);

  const { data } = await client
    .from(kind)
    .select(`id, ${col}, is_active, sort_order`)
    .order("sort_order")
    .order(col);

  const rows = (data ?? []) as unknown as Record<string, string | number | boolean>[];
  if (rows.length === 0) return [];

  const { data: templates } = await client
    .from("class_templates")
    .select(templateColumn(kind))
    .eq("is_active", true);

  const usage = new Map<string, number>();
  for (const t of (templates ?? []) as unknown as Record<string, string>[]) {
    const id = t[templateColumn(kind)];
    usage.set(id, (usage.get(id) ?? 0) + 1);
  }

  return rows.map((r) => ({
    id: r.id as string,
    name: r[col] as string,
    isActive: r.is_active as boolean,
    inUse: usage.get(r.id as string) ?? 0,
  }));
}

export async function fetchCatalogs(): Promise<Catalogs> {
  await assertAdmin();
  const [teachers, rooms, class_types] = await Promise.all([
    fetchCatalog("teachers"),
    fetchCatalog("rooms"),
    fetchCatalog("class_types"),
  ]);
  return { teachers, rooms, class_types };
}

export type CatalogResult = { ok: true } | { ok: false; error: string };

export async function createCatalogItem(
  kind: CatalogKind,
  name: string
): Promise<CatalogResult> {
  await assertAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "El nombre no puede estar vacío" };

  // Cada rama va explícita: con `kind` genérico, el tipo del insert es la unión
  // de las tres tablas y TypeScript exige las columnas de todas a la vez.
  const client = getServiceClient();
  const { error } =
    kind === "teachers"
      ? await client.from("teachers").insert({ full_name: clean })
      : kind === "rooms"
        ? await client.from("rooms").insert({ name: clean })
        : await client.from("class_types").insert({ name: clean });

  if (error) {
    // El unique constraint es la defensa real contra duplicados por tildes.
    if (error.code === "23505") return { ok: false, error: `"${clean}" ya existe` };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/nueva-clase");
  return { ok: true };
}

export async function renameCatalogItem(
  kind: CatalogKind,
  id: string,
  name: string
): Promise<CatalogResult> {
  await assertAdmin();
  const clean = name.trim();
  if (!clean) return { ok: false, error: "El nombre no puede estar vacío" };

  const client = getServiceClient();
  const { error } =
    kind === "teachers"
      ? await client.from("teachers").update({ full_name: clean }).eq("id", id)
      : kind === "rooms"
        ? await client.from("rooms").update({ name: clean }).eq("id", id)
        : await client.from("class_types").update({ name: clean }).eq("id", id);

  if (error) {
    if (error.code === "23505") return { ok: false, error: `"${clean}" ya existe` };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/catalogo");
  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Baja lógica. No borramos nunca: las clases (y sus reservas históricas) siguen
 * apuntando acá, y la FK es `on delete restrict`. Desactivar lo saca de los
 * formularios sin romper nada de lo que ya está cargado.
 */
export async function setCatalogItemActive(
  kind: CatalogKind,
  id: string,
  isActive: boolean
): Promise<CatalogResult> {
  await assertAdmin();

  if (!isActive) {
    const { count } = await getServiceClient()
      .from("class_templates")
      .select("id", { count: "exact", head: true })
      .eq(templateColumn(kind), id)
      .eq("is_active", true);

    if (count && count > 0) {
      return {
        ok: false,
        error: `No se puede desactivar: hay ${count} clase${count === 1 ? "" : "s"} activa${count === 1 ? "" : "s"} usándolo`,
      };
    }
  }

  const { error } = await getServiceClient()
    .from(kind)
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/nueva-clase");
  return { ok: true };
}

export interface CatalogClass {
  id: string;
  name: string;
  /** 0 = lunes. */
  dayOfWeek: number;
  timeStart: string;
  timeEnd: string;
  recurrence: "weekly" | "once";
  specificDate: string | null;
}

/** Las clases activas que usan un instructora / sala / tipo, para reasignarlas. */
export async function fetchCatalogClasses(kind: CatalogKind, id: string): Promise<CatalogClass[]> {
  await assertAdmin();
  const { data } = await getServiceClient()
    .from("class_templates")
    .select("id, name, day_of_week, time_start, time_end, recurrence, specific_date")
    .eq(templateColumn(kind), id)
    .eq("is_active", true)
    .order("day_of_week")
    .order("time_start");

  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    dayOfWeek: t.day_of_week,
    timeStart: t.time_start.slice(0, 5),
    timeEnd: t.time_end.slice(0, 5),
    recurrence: t.recurrence as "weekly" | "once",
    specificDate: t.specific_date,
  }));
}

/** Pasa una clase (`templateId`) o todas las de `fromId` a otro elemento del catálogo. */
export async function reassignClasses(
  kind: CatalogKind,
  toId: string,
  target: { templateId: string } | { fromId: string }
): Promise<CatalogResult & { moved?: number }> {
  await assertAdmin();
  const client = getServiceClient();

  const { data: dest } = await client.from(kind).select("id, is_active").eq("id", toId).single();
  if (!dest?.is_active) return { ok: false, error: "El destino no está disponible" };

  const col = templateColumn(kind);
  const patch =
    kind === "teachers" ? { teacher_id: toId } : kind === "rooms" ? { room_id: toId } : { class_type_id: toId };
  let q = client.from("class_templates").update(patch, { count: "exact" });
  q = "templateId" in target ? q.eq("id", target.templateId) : q.eq(col, target.fromId).eq("is_active", true);
  const { error, count } = await q;
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/admin/semana");
  revalidatePath("/admin/catalogo");
  return { ok: true, moved: count ?? 0 };
}

/** Elimina una clase desde el catálogo (ver `deleteClassTemplate`). */
export async function deleteClassFromCatalog(templateId: string): Promise<CatalogResult> {
  const res = await deleteClassTemplate(templateId);
  return res.ok ? { ok: true } : res;
}

/**
 * "Quitar": si nunca se usó en ninguna clase (ni archivada) se borra de verdad;
 * si tiene historia, se desactiva. Con clases activas no se deja.
 */
export async function removeCatalogItem(
  kind: CatalogKind,
  id: string
): Promise<CatalogResult & { deleted?: boolean }> {
  await assertAdmin();
  const client = getServiceClient();
  const col = templateColumn(kind);

  const { count: active } = await client
    .from("class_templates").select("id", { count: "exact", head: true }).eq(col, id).eq("is_active", true);
  if (active && active > 0) return { ok: false, error: "Todavía tiene clases activas" };

  const { count: any } = await client
    .from("class_templates").select("id", { count: "exact", head: true }).eq(col, id);

  const { error } = any
    ? await client.from(kind).update({ is_active: false }).eq("id", id)
    : await client.from(kind).delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/catalogo");
  revalidatePath("/admin/nueva-clase");
  return { ok: true, deleted: !any };
}
