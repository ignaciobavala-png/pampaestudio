"use server";

import { normalizePhone } from "@/lib/phone";
import { endOfDayInArgentina, startOfMonthInArgentina } from "@/lib/time";
import type { AdminClient, AdminPack, ClientHistoryItem } from "@/lib/admin-types";
import {
  assertAdmin,
  getServerSupabase as getSupabase,
  getServiceClient as getAdminClient,
} from "@/lib/supabase/admin-guard";
import type { Database } from "@/types/database";

function generateAvColor(name: string): string {
  const colors = [
    "#5B4BE0", "#7C6FF2", "#6E63C8", "#5E6BD6",
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

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export async function fetchClients(): Promise<AdminClient[]> {
  const supabase = await getSupabase();
  const adminClient = getAdminClient();

  type ProfileWithPacks = Database["public"]["Tables"]["profiles"]["Row"] & {
    user_packs: {
      id: string;
      pack_id: string;
      credits_remaining: number;
      status: string;
      expires_at: string | null;
      frozen_at: string | null;
      packs: { name: string; credits: number } | null;
    }[];
  };

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, user_packs!user_packs_user_id_fkey(id, pack_id, credits_remaining, status, expires_at, frozen_at, packs(name, credits))")
      .eq("role", "client"),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (!profiles) return [];

  const emailMap = new Map<string, string>(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const mapped: AdminClient[] = [];

  for (const p of profiles as unknown as ProfileWithPacks[]) {
    // Pack vigente: preferir activo, luego congelado (ignorar expirados)
    const packs = p.user_packs || [];
    const activePack =
      packs.find((up) => up.status === "active") ??
      packs.find((up) => up.status === "frozen") ??
      null;
    const packName = activePack?.packs?.name || "Sin pack";
    const packId = activePack?.pack_id || null;
    const credits = activePack?.credits_remaining || 0;

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("user_id", p.id)
      .eq("status", "confirmed");

    const createdAt = new Date(p.created_at);
    const since = `${MONTHS[createdAt.getMonth()]} ${createdAt.getFullYear()}`;
    const name = p.full_name || "Sin nombre";

    mapped.push({
      id: p.id,
      name,
      email: emailMap.get(p.id) ?? "",
      phone: p.phone || "",
      pack: packName,
      packId,
      userPackId: activePack?.id || null,
      packStatus: activePack?.status || null,
      packExpiresAt: activePack?.expires_at || null,
      credits,
      classes: count || 0,
      av: generateAvColor(name),
      ini: getInitials(name),
      since,
      isApproved: p.is_approved,
      medicalNotes: p.medical_notes || "",
      experienceLevel: p.experience_level || null,
    });
  }

  return mapped;
}

export async function fetchPacks(): Promise<AdminPack[]> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("packs")
    .select("id, name, credits, price, period")
    .eq("is_active", true)
    .order("sort_order");
  return (data as AdminPack[]) || [];
}

/**
 * Defensa en profundidad: verifica que la sesión sea admin antes de operar con
 * service_role. Devuelve el id del admin. Lanza si no está autorizado.
 */
export async function setApproval(userId: string, approved: boolean): Promise<void> {
  await assertAdmin();
  const adminClient = getAdminClient();
  await adminClient
    .from("profiles")
    .update({ is_approved: approved })
    .eq("id", userId);
}

export async function assignPack(userId: string, packId: string): Promise<void> {
  const adminId = await assertAdmin();
  const adminClient = getAdminClient();

  const { data: pack } = await adminClient
    .from("packs")
    .select("credits, duration_days")
    .eq("id", packId)
    .single();

  if (!pack) return;

  // Expire existing active/frozen packs
  await adminClient
    .from("user_packs")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .in("status", ["active", "frozen"]);

  const now = new Date();
  const expiresAt =
    pack.duration_days != null
      ? endOfDayInArgentina(now, pack.duration_days).toISOString()
      : null;

  // Assign new pack
  await adminClient.from("user_packs").insert({
    user_id: userId,
    pack_id: packId,
    credits_remaining: pack.credits,
    status: "active",
    starts_at: now.toISOString(),
    expires_at: expiresAt,
    assigned_by: adminId,
  });
}

/** Perfil médico / observaciones (visible para la profe en la clase). */
export async function updateClientMedical(
  userId: string,
  medicalNotes: string,
  experienceLevel: string | null
): Promise<void> {
  await assertAdmin();
  const adminClient = getAdminClient();
  await adminClient
    .from("profiles")
    .update({
      medical_notes: medicalNotes.trim(),
      experience_level: experienceLevel?.trim() || null,
    })
    .eq("id", userId);
}

/** Congela un pack (vacaciones): guarda el momento de congelamiento. */
export async function freezePack(userPackId: string): Promise<void> {
  await assertAdmin();
  const adminClient = getAdminClient();
  await adminClient
    .from("user_packs")
    .update({ status: "frozen", frozen_at: new Date().toISOString() })
    .eq("id", userPackId)
    .eq("status", "active");
}

/** Descongela un pack: extiende expires_at por el tiempo que estuvo congelado. */
export async function unfreezePack(userPackId: string): Promise<void> {
  await assertAdmin();
  const adminClient = getAdminClient();

  const { data: up } = await adminClient
    .from("user_packs")
    .select("expires_at, frozen_at, status")
    .eq("id", userPackId)
    .single();

  if (!up || up.status !== "frozen") return;

  let newExpires = up.expires_at;
  if (up.expires_at && up.frozen_at) {
    const frozenMs = Date.now() - new Date(up.frozen_at).getTime();
    newExpires = new Date(new Date(up.expires_at).getTime() + frozenMs).toISOString();
  }

  await adminClient
    .from("user_packs")
    .update({ status: "active", frozen_at: null, expires_at: newExpires })
    .eq("id", userPackId);
}

/** Historial de clases de una alumna (pasadas + canceladas), más recientes primero. */
export async function fetchClientHistory(userId: string): Promise<ClientHistoryItem[]> {
  await assertAdmin();
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("bookings")
    .select("id, date, status, class_templates(name, time_start)")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(50);

  return ((data as unknown as {
    id: string;
    date: string;
    status: string;
    class_templates: { name: string; time_start: string } | null;
  }[]) || []).map((b) => ({
    id: b.id,
    date: b.date,
    status: b.status,
    className: b.class_templates?.name || "Clase",
    time: b.class_templates?.time_start?.slice(0, 5) || "",
  }));
}

/** Ingresos del mes actual: suma de precios de packs asignados este mes. */
export async function fetchMonthlyRevenue(): Promise<number> {
  await assertAdmin();
  const supabase = await getSupabase();
  const start = startOfMonthInArgentina().toISOString();

  const { data } = await supabase
    .from("user_packs")
    .select("created_at, packs(price)")
    .gte("created_at", start);

  const rows = (data as unknown as { packs: { price: number } | null }[]) || [];
  const totalCents = rows.reduce((sum, r) => sum + (r.packs?.price || 0), 0);
  return Math.round(totalCents / 100);
}

export type CreateUserResult =
  | { ok: true; message: string; tempPassword?: string }
  | { ok: false; error: string };

/**
 * 1.1a — Alta de alumna SIN acceso a la app (tercero / walk-in).
 * Crea solo un registro en profiles (id propio, sin cuenta de Auth).
 * El admin le reserva las clases; no puede iniciar sesión.
 */
export async function createManagedUser(
  fullName: string,
  phone: string
): Promise<CreateUserResult> {
  await assertAdmin();
  const name = fullName.trim();
  if (!name) return { ok: false, error: "El nombre es obligatorio" };

  const adminClient = getAdminClient();
  const { error } = await adminClient.from("profiles").insert({
    id: crypto.randomUUID(),
    full_name: name,
    role: "client",
    is_approved: true,
    phone: normalizePhone(phone),
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Alumna creada (sin acceso a la app)" };
}

/**
 * 1.1b — Alta de alumna CON acceso a la app.
 * Crea la cuenta en Auth (el trigger handle_new_user genera el profile) y la
 * deja aprobada. Si no se pasa contraseña, se genera una temporal y se devuelve
 * para que el admin la comparta (el SMTP para invitaciones aún no está configurado).
 */
export async function createAuthUser(
  fullName: string,
  email: string,
  phone: string,
  password?: string
): Promise<CreateUserResult> {
  await assertAdmin();
  const name = fullName.trim();
  const mail = email.trim().toLowerCase();
  if (!name) return { ok: false, error: "El nombre es obligatorio" };
  if (!mail) return { ok: false, error: "El email es obligatorio" };

  const adminClient = getAdminClient();
  const generated = !password;
  const pass = password?.trim() || `Pampa${Math.random().toString(36).slice(2, 8)}!`;

  const { data, error } = await adminClient.auth.admin.createUser({
    email: mail,
    password: pass,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error) return { ok: false, error: error.message };
  const newId = data.user?.id;
  if (!newId) return { ok: false, error: "No se pudo crear la cuenta" };

  // El trigger ya creó el profile con full_name; completamos teléfono y aprobación.
  await adminClient
    .from("profiles")
    .update({ is_approved: true, phone: normalizePhone(phone) })
    .eq("id", newId);

  return {
    ok: true,
    message: "Alumna creada con acceso a la app",
    tempPassword: generated ? pass : undefined,
  };
}
