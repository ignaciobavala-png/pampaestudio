import type { AdminClient } from "@/lib/admin-types";

interface ClientCardProps {
  client: AdminClient;
  onClick: () => void;
}

export function ClientCard({ client, onClick }: ClientCardProps) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer text-left rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-4 transition-all hover:border-[rgba(26,25,31,.14)] hover:shadow-[0_4px_18px_rgba(26,25,31,.06)]"
    >
      {/* Top: avatar + name/email */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="flex size-[38px] shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ background: client.av }}
        >
          {client.ini}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{client.name}</div>
          <div className="text-[11px] text-ink-dim mt-0.5">{client.email || client.phone}</div>
        </div>
      </div>
      {/* Stats rows */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-xs">
          <span className="text-ink-dim">Pack</span>
          <span className="font-medium flex items-center gap-1.5">
            {client.pack}
            <span className="rounded-[100px] bg-bordo-surface px-2 py-0.5 text-[10px] font-semibold text-primary">
              {client.credits} creditos
            </span>
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-dim">Clases tomadas</span>
          <span className="font-medium">{client.classes}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-ink-dim">Desde</span>
          <span className="font-medium">{client.since}</span>
        </div>
      </div>
    </button>
  );
}
