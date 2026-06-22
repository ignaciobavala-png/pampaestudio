"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { AdminClient } from "@/lib/admin-types";

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

export async function fetchClients(): Promise<AdminClient[]> {
  const supabase = await getSupabase();

  type ProfileWithPacks = Database["public"]["Tables"]["profiles"]["Row"] & {
    user_packs: {
      id: string;
      credits_remaining: number;
      packs: { name: string; credits: number } | null;
    }[];
  };

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*, user_packs(id, credits_remaining, packs(name, credits))")
    .eq("role", "client");

  if (!profiles) return [];

  const mapped: AdminClient[] = [];

  for (const p of profiles as unknown as ProfileWithPacks[]) {
    const activePack = p.user_packs?.[0];
    const packName = activePack?.packs?.name || "Sin pack";
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
      name,
      email: p.phone || "",
      pack: packName,
      credits,
      classes: count || 0,
      av: generateAvColor(name),
      ini: getInitials(name),
      since,
    });
  }

  return mapped;
}
