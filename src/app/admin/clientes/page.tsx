"use client";

import { useState, useEffect } from "react";
import { ClientCard } from "@/components/admin/client-card";
import { ClientDetailModal } from "@/components/admin/client-detail-modal";
import { createClient } from "@/lib/supabase/client";
import type { AdminClient } from "@/lib/admin-types";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);

  useEffect(() => {
    const supabase = createClient();

    (async () => {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*, user_packs(id, credits_remaining, packs(name, credits))")
        .eq("role", "client");

      if (!profiles) {
        setLoading(false);
        return;
      }

      const mapped: AdminClient[] = [];

      for (const p of profiles) {
        const profileData = p as unknown as Profile & {
          user_packs: {
            id: string;
            credits_remaining: number;
            packs: { name: string; credits: number } | null;
          }[];
        };

        const activePack = profileData.user_packs?.[0];
        const packName = activePack?.packs?.name || "Sin pack";
        const credits = activePack?.credits_remaining || 0;

        const { count } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("user_id", p.id)
          .eq("status", "confirmed");

        const createdAt = new Date(p.created_at);
        const since = `${
          [
            "Ene", "Feb", "Mar", "Abr", "May", "Jun",
            "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
          ][createdAt.getMonth()]
        } ${createdAt.getFullYear()}`;

        mapped.push({
          name: p.full_name || p.id.slice(0, 8),
          email: p.id.slice(0, 8) + "@...",
          pack: packName,
          credits,
          classes: count || 0,
          av: generateAvColor(p.full_name || p.id),
          ini: getInitials(p.full_name || ""),
          since,
        });
      }

      setClients(mapped);
      setLoading(false);
    })();
  }, []);

  const q = search.toLowerCase();
  const filtered = clients.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.pack.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Clientes</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          {filtered.length} alumnas
        </p>
      </div>

      <div className="mb-[18px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-[14px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
          placeholder="Buscar por nombre o email..."
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-ink-dim">Cargando...</div>
        </div>
      ) : (
        <div
          className="grid gap-3 max-[860px]:grid-cols-1"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {filtered.map((c, i) => (
            <ClientCard
              key={i}
              client={c}
              onClick={() => setSelectedClient(c)}
            />
          ))}
        </div>
      )}

      <ClientDetailModal
        open={selectedClient !== null}
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
