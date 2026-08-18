"use server";

import { revalidatePath } from "next/cache";
import { assertAdmin, getServiceClient } from "@/lib/supabase/admin-guard";

/**
 * ABM de packs.
 *
 * Hasta ahora los packs solo se podían leer (para asignárselos a una alumna) y
 * la tabla estaba vacía en producción, así que la home mostraba "No hay packs
 * disponibles". Sin esta pantalla el estudio no tenía forma de cargar su oferta.
 *
 * `packs.price` está en centavos; la pantalla trabaja en pesos.
 */

export interface ClassTypeOption {
  id: string;
  name: string;
}

export interface PackFormData {
  name: string;
  eyebrow: string;
  description: string;
  /** En pesos, tal como lo tipea Violeta. Se convierte a centavos al guardar. */
  priceArs: number;
  period: "monthly" | "per_class";
  credits: number;
  /** Días de vigencia; null = sin vencimiento. */
  durationDays: number | null;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  /**
   * Tipos de clase que habilita el pack. Una clase cuyo tipo no esté en ningún
   * pack activo es una "clase suelta" y se paga aparte.
   */
  classTypeIds: string[];
}

export interface AdminPackRow extends PackFormData {
  id: string;
  /** Cuántas alumnas lo tienen activo ahora. */
  activeUsers: number;
}

export type PackResult = { ok: true; id?: string } | { ok: false; error: string };

function toCents(priceArs: number): number {
  return Math.round(priceArs * 100);
}

function validate(data: PackFormData): string | null {
  if (!data.name.trim()) return "El nombre es obligatorio";
  if (!Number.isFinite(data.priceArs) || data.priceArs < 0)
    return "El precio no puede ser negativo";
  if (!Number.isInteger(data.credits) || data.credits < 1)
    return "El pack tiene que tener al menos 1 crédito";
  if (
    data.durationDays !== null &&
    (!Number.isInteger(data.durationDays) || data.durationDays < 1)
  )
    return "La vigencia tiene que ser de al menos 1 día";
  if (data.classTypeIds.length === 0)
    return "Elegí al menos un tipo de clase, si no el pack no habilita nada";
  return null;
}

/** Tipos de clase activos, para armar la cobertura de cada pack. */
export async function fetchClassTypeOptions(): Promise<ClassTypeOption[]> {
  await assertAdmin();
  const { data } = await getServiceClient()
    .from("class_types")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  return data ?? [];
}

export async function fetchAdminPacks(): Promise<AdminPackRow[]> {
  await assertAdmin();
  const client = getServiceClient();

  const { data } = await client
    .from("packs")
    .select("*")
    .order("sort_order")
    .order("created_at");

  const packs = data ?? [];
  if (packs.length === 0) return [];

  const [{ data: userPacks }, { data: coverage }] = await Promise.all([
    client.from("user_packs").select("pack_id").eq("status", "active"),
    client.from("pack_class_types").select("pack_id, class_type_id"),
  ]);

  const types = new Map<string, string[]>();
  for (const row of coverage ?? []) {
    types.set(row.pack_id, [...(types.get(row.pack_id) ?? []), row.class_type_id]);
  }

  const usage = new Map<string, number>();
  for (const up of userPacks ?? []) {
    usage.set(up.pack_id, (usage.get(up.pack_id) ?? 0) + 1);
  }

  return packs.map((p) => ({
    id: p.id,
    name: p.name,
    eyebrow: p.eyebrow,
    description: p.description,
    priceArs: p.price / 100,
    period: p.period as "monthly" | "per_class",
    credits: p.credits,
    durationDays: p.duration_days,
    features: Array.isArray(p.features) ? (p.features as string[]) : [],
    isFeatured: p.is_featured,
    isActive: p.is_active,
    sortOrder: p.sort_order,
    classTypeIds: types.get(p.id) ?? [],
    activeUsers: usage.get(p.id) ?? 0,
  }));
}

function toRow(data: PackFormData) {
  return {
    name: data.name.trim(),
    eyebrow: data.eyebrow.trim(),
    description: data.description.trim(),
    price: toCents(data.priceArs),
    period: data.period,
    credits: data.credits,
    duration_days: data.durationDays,
    features: data.features.filter((f) => f.trim()),
    is_featured: data.isFeatured,
    is_active: data.isActive,
    sort_order: data.sortOrder,
  };
}

/**
 * Reemplaza la cobertura del pack. Se borra y se reinserta en vez de calcular
 * el diff: son un puñado de filas y así no quedan estados intermedios raros.
 */
async function saveCoverage(packId: string, classTypeIds: string[]) {
  const client = getServiceClient();
  await client.from("pack_class_types").delete().eq("pack_id", packId);
  if (classTypeIds.length === 0) return;
  await client
    .from("pack_class_types")
    .insert(classTypeIds.map((id) => ({ pack_id: packId, class_type_id: id })));
}

function revalidatePacks() {
  revalidatePath("/admin/packs");
  revalidatePath("/admin/clientes");
  revalidatePath("/");
}

export async function createPack(data: PackFormData): Promise<PackResult> {
  await assertAdmin();
  const invalid = validate(data);
  if (invalid) return { ok: false, error: invalid };

  const { data: inserted, error } = await getServiceClient()
    .from("packs")
    .insert(toRow(data))
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  if (inserted?.id) await saveCoverage(inserted.id, data.classTypeIds);

  revalidatePacks();
  return { ok: true, id: inserted?.id };
}

export async function updatePack(id: string, data: PackFormData): Promise<PackResult> {
  await assertAdmin();
  const invalid = validate(data);
  if (invalid) return { ok: false, error: invalid };

  const { error } = await getServiceClient().from("packs").update(toRow(data)).eq("id", id);
  if (error) return { ok: false, error: error.message };
  await saveCoverage(id, data.classTypeIds);

  revalidatePacks();
  return { ok: true };
}

/**
 * Baja lógica. `user_packs.pack_id` es `on delete restrict`, así que un pack que
 * alguna alumna compró alguna vez no se puede borrar sin perder su historial.
 */
export async function setPackActive(id: string, isActive: boolean): Promise<PackResult> {
  await assertAdmin();
  const { error } = await getServiceClient()
    .from("packs")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePacks();
  return { ok: true };
}

/** Borrado real, solo para packs que nunca se le asignaron a nadie. */
export async function deletePack(id: string): Promise<PackResult> {
  await assertAdmin();
  const client = getServiceClient();

  const { count } = await client
    .from("user_packs")
    .select("id", { count: "exact", head: true })
    .eq("pack_id", id);

  if (count && count > 0) {
    return {
      ok: false,
      error: `No se puede borrar: ${count} alumna${count === 1 ? "" : "s"} lo tiene${count === 1 ? "" : "n"} en su historial. Desactivalo en su lugar.`,
    };
  }

  const { error } = await client.from("packs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePacks();
  return { ok: true };
}
