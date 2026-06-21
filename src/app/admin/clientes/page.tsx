"use client";

import { useState } from "react";
import { ClientCard } from "@/components/admin/client-card";
import { ClientDetailModal } from "@/components/admin/client-detail-modal";
import type { AdminClient } from "@/lib/admin-types";

const MOCK_CLIENTS: AdminClient[] = [
  { name: "Lucia Fernandez", email: "lucia@email.com", pack: "Fusion", credits: 8, classes: 14, av: "#5B4BE0", ini: "LF", since: "Mar 2025" },
  { name: "Martina Gomez", email: "martina@email.com", pack: "Esencia", credits: 2, classes: 6, av: "#7C6FF2", ini: "MG", since: "Abr 2025" },
  { name: "Sofia Perez", email: "sofia@email.com", pack: "Libre", credits: 3, classes: 9, av: "#6E63C8", ini: "SP", since: "Ene 2026" },
  { name: "Valentina Ruiz", email: "valen@email.com", pack: "Fusion", credits: 10, classes: 22, av: "#5E6BD6", ini: "VR", since: "Jun 2024" },
  { name: "Camila Torres", email: "cami@email.com", pack: "Studio", credits: 5, classes: 18, av: "#4E7C9E", ini: "CT", since: "Sep 2025" },
  { name: "Isabella Lopez", email: "isa@email.com", pack: "Fusion", credits: 7, classes: 11, av: "#8A6FD0", ini: "IL", since: "Feb 2026" },
  { name: "Ana Garcia", email: "ana@email.com", pack: "Esencia", credits: 1, classes: 4, av: "#5B7C8A", ini: "AG", since: "May 2026" },
  { name: "Maria Laura Gomez", email: "mlaura@email.com", pack: "Studio", credits: 4, classes: 16, av: "#7355C8", ini: "ML", since: "Oct 2025" },
  { name: "Andrea Navarro", email: "andrea@email.com", pack: "Fusion", credits: 9, classes: 28, av: "#6E6D78", ini: "AN", since: "Mar 2024" },
  { name: "Julieta Moreno", email: "juli@email.com", pack: "Studio", credits: 6, classes: 13, av: "#5B4BE0", ini: "JM", since: "Dic 2025" },
  { name: "Carolina Rios", email: "caro@email.com", pack: "Fusion", credits: 11, classes: 31, av: "#7C6FF2", ini: "CR", since: "Ago 2024" },
  { name: "Daniela Castro", email: "dani@email.com", pack: "Studio", credits: 3, classes: 7, av: "#6E63C8", ini: "DC", since: "Abr 2026" },
];

export default function ClientesPage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<AdminClient | null>(null);

  const q = search.toLowerCase();
  const filtered = MOCK_CLIENTS.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Clientes</h1>
        <p className="mt-1 text-[13px] text-ink-dim">{filtered.length} alumnas</p>
      </div>

      <div className="mb-[18px]">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[12px] border border-[rgba(26,25,31,.14)] bg-white px-[14px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary"
          placeholder="Buscar por nombre o email..."
        />
      </div>

      <div className="grid gap-3 max-[860px]:grid-cols-1" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filtered.map((c, i) => (
          <ClientCard key={i} client={c} onClick={() => setSelectedClient(c)} />
        ))}
      </div>

      <ClientDetailModal
        open={selectedClient !== null}
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    </div>
  );
}
