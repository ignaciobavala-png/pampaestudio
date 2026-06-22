"use client";

import { useState, useEffect } from "react";
import { ClientCard } from "@/components/admin/client-card";
import { ClientDetailModal } from "@/components/admin/client-detail-modal";
import { fetchClients } from "./actions";
import type { AdminClient } from "@/lib/admin-types";

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);

  useEffect(() => {
    fetchClients().then((data) => {
      setClients(data);
      setLoading(false);
    });
  }, []);

  const q = search.toLowerCase();
  const filtered = clients.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.pack.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Clientes</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          {loading ? "Cargando..." : `${filtered.length} alumnas`}
        </p>
      </div>

      <div className="mb-[18px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-[14px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
          placeholder="Buscar por nombre o pack..."
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-ink-dim">Cargando...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-ink-dim">
          {search ? "Sin resultados para esa búsqueda." : "Todavía no hay alumnas registradas."}
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
