"use client";

import { useState, useEffect } from "react";
import { ClientCard } from "@/components/admin/client-card";
import { ClientDetailModal } from "@/components/admin/client-detail-modal";
import { fetchClients } from "./actions";
import type { AdminClient } from "@/lib/admin-types";

function exportCSV(clients: AdminClient[]) {
  const headers = ["Nombre", "Email", "Teléfono", "Pack", "Créditos", "Clases", "Miembro desde"];
  const rows = clients.map((c) => [
    c.name,
    c.email,
    c.phone,
    c.pack,
    c.credits,
    c.classes,
    c.since,
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `alumnas-pampa-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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
      c.email.toLowerCase().includes(q) ||
      c.pack.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Clientes</h1>
          <p className="mt-1 text-[13px] text-ink-dim">
            {loading ? "Cargando..." : `${filtered.length} alumnas`}
          </p>
        </div>

        {!loading && clients.length > 0 && (
          <button
            onClick={() => exportCSV(filtered)}
            className="flex shrink-0 items-center gap-2 rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-4 py-[9px] text-[13px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 6l3 3 3-3M2 10v1.5A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Exportar CSV
          </button>
        )}
      </div>

      <div className="mb-[18px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-[14px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
          placeholder="Buscar por nombre, email o pack..."
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
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}
        >
          {filtered.map((c) => (
            <ClientCard
              key={c.id}
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
        onUpdate={() => {
          setSelectedClient(null);
          fetchClients().then(setClients);
        }}
      />
    </div>
  );
}
