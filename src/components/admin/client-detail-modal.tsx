"use client";

import { useCallback } from "react";
import type { AdminClient } from "@/lib/admin-types";

interface ClientDetailModalProps {
  open: boolean;
  client: AdminClient | null;
  onClose: () => void;
}

const MOCK_HISTORY = [
  { date: "13 jun", class: "Hatha Principiantes", status: "asistio", color: "text-primary" },
  { date: "11 jun", class: "Vinyasa Flow", status: "asistio", color: "text-primary" },
  { date: "09 jun", class: "Pilates Mat", status: "cancelo", color: "text-amber-text" },
  { date: "06 jun", class: "Yin & Restore", status: "asistio", color: "text-primary" },
];

export function ClientDetailModal({ open, client, onClose }: ClientDetailModalProps) {
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  if (!open || !client) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="w-[560px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <span className="text-[15px] font-semibold">{client.name}</span>
          <button
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            x
          </button>
        </div>
        <div className="px-5 py-[18px]">
          {/* Client header */}
          <div className="flex items-center gap-[14px] mb-4 pb-4 border-b border-[rgba(26,25,31,.085)]">
            <div
              className="flex size-[50px] shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ background: client.av }}
            >
              {client.ini}
            </div>
            <div>
              <div className="font-serif text-[22px]">{client.name}</div>
              <div className="text-xs text-ink-dim mt-0.5">{client.phone}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="rounded-[12px] bg-[#EFEFED] p-3 text-center">
              <div className="font-serif text-[26px]">{client.classes}</div>
              <div className="text-[10px] text-ink-dim mt-[3px] tracking-[0.04em]">Clases totales</div>
            </div>
            <div className="rounded-[12px] bg-[#EFEFED] p-3 text-center">
              <div className="font-serif text-[26px]">{client.credits}</div>
              <div className="text-[10px] text-ink-dim mt-[3px] tracking-[0.04em]">Creditos</div>
            </div>
            <div className="rounded-[12px] bg-[#EFEFED] p-3 text-center">
              <div className="font-serif text-[26px]">{Math.round(client.classes / 6)}</div>
              <div className="text-[10px] text-ink-dim mt-[3px] tracking-[0.04em]">Meses activa</div>
            </div>
          </div>

          {/* Active pack */}
          <div className="mb-[14px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Pack activo
            </div>
            <div className="flex items-center justify-between rounded-[12px] bg-[#EFEFED] px-[14px] py-[13px]">
              <div>
                <div className="text-sm font-semibold">Pack {client.pack}</div>
                <div className="text-xs text-ink-dim mt-0.5">Desde {client.since}</div>
              </div>
              <button className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
                Cambiar
              </button>
            </div>
          </div>

          {/* History */}
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Historial reciente
          </div>
          <div className="border-t border-[rgba(26,25,31,.085)]">
            {MOCK_HISTORY.map((h) => (
              <div
                key={h.date + h.class}
                className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] py-[11px] text-[13px]"
              >
                <span className="text-ink-dim">
                  {h.date} · {h.class}
                </span>
                <span className={`font-semibold ${h.color}`}>
                  {h.status === "asistio" ? "Asistio" : "Cancelo"}
                </span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] py-[11px] text-center text-[12.5px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
              Enviar mensaje
            </button>
            <button className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] py-[11px] text-center text-[12.5px] font-medium text-destructive transition-colors hover:bg-naranja-soft">
              Pausar membresia
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
