"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { AdminClient, AdminPack } from "@/lib/admin-types";

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

function getAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function fetchClients(): Promise<AdminClient[]> {
  const supabase = await getSupabase();
  const adminClient = getAdminClient();

  type ProfileWithPacks = Database["public"]["Tables"]["profiles"]["Row"] & {
    user_packs: {
      id: string;
      pack_id: string;
      credits_remaining: number;
      packs: { name: string; credits: number } | null;
    }[];
  };

  const [{ data: profiles }, { data: authData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*, user_packs(id, pack_id, credits_remaining, packs(name, credits))")
      .eq("role", "client"),
    adminClient.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (!profiles) return [];

  const emailMap = new Map<string, string>(
    (authData?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const mapped: AdminClient[] = [];

  for (const p of profiles as unknown as ProfileWithPacks[]) {
    const activePack = p.user_packs?.[0];
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
      credits,
      classes: count || 0,
      av: generateAvColor(name),
      ini: getInitials(name),
      since,
      isApproved: p.is_approved,
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

export async function setApproval(userId: string, approved: boolean): Promise<void> {
  const adminClient = getAdminClient();
  await adminClient
    .from("profiles")
    .update({ is_approved: approved })
    .eq("id", userId);
}

export async function assignPack(userId: string, packId: string): Promise<void> {
  const adminClient = getAdminClient();

  const { data: pack } = await adminClient
    .from("packs")
    .select("credits")
    .eq("id", packId)
    .single();

  if (!pack) return;

  // Expire existing active packs
  await adminClient
    .from("user_packs")
    .update({ status: "expired" })
    .eq("user_id", userId)
    .eq("status", "active");

  // Assign new pack
  await adminClient.from("user_packs").insert({
    user_id: userId,
    pack_id: packId,
    credits_remaining: pack.credits,
    status: "active",
    starts_at: new Date().toISOString(),
    assigned_by: userId,
  });
}
