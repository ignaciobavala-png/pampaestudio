"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchPacks, setApproval, assignPack } from "@/app/admin/clientes/actions";
import type { AdminClient, AdminPack } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

interface ClientDetailModalProps {
  open: boolean;
  client: AdminClient | null;
  onClose: () => void;
  onUpdate: () => void;
}

export function ClientDetailModal({ open, client, onClose, onUpdate }: ClientDetailModalProps) {
  const [packs, setPacks] = useState<AdminPack[]>([]);
  const [showPackPicker, setShowPackPicker] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [loading, setLoading] = useState<"approve" | "pack" | null>(null);

  useEffect(() => {
    if (open) fetchPacks().then(setPacks);
  }, [open]);

  useEffect(() => {
    if (open && client) {
      setSelectedPackId(client.packId);
      setShowPackPicker(false);
    }
  }, [open, client]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleApproval = async (approved: boolean) => {
    if (!client) return;
    setLoading("approve");
    await setApproval(client.id, approved);
    setLoading(null);
    onUpdate();
  };

  const handleAssignPack = async () => {
    if (!client || !selectedPackId) return;
    setLoading("pack");
    await assignPack(client.id, selectedPackId);
    setLoading(null);
    setShowPackPicker(false);
    onUpdate();
  };

  if (!open || !client) return null;

  const selectedPack = packs.find((p) => p.id === selectedPackId);

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="w-[560px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{client.name}</span>
            <span className={cn(
              "rounded-[100px] px-[9px] py-[3px] text-[10px] font-semibold",
              client.isApproved
                ? "bg-[#EEF1EB] text-[#385127]"
                : "bg-amber-soft text-amber-text"
            )}>
              {client.isApproved ? "Aprobada" : "Pendiente"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            ×
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
              <div className="text-xs text-ink-dim mt-0.5">{client.email || client.phone}</div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { val: client.classes, label: "Clases totales" },
              { val: client.credits, label: "Créditos" },
              { val: Math.round(client.classes / 6), label: "Meses activa" },
            ].map(({ val, label }) => (
              <div key={label} className="rounded-[12px] bg-[#EFEFED] p-3 text-center">
                <div className="font-serif text-[26px]">{val}</div>
                <div className="text-[10px] text-ink-dim mt-[3px] tracking-[0.04em]">{label}</div>
              </div>
            ))}
          </div>

          {/* Pack activo */}
          <div className="mb-[14px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Pack activo
            </div>
            {!showPackPicker ? (
              <div className="flex items-center justify-between rounded-[12px] bg-[#EFEFED] px-[14px] py-[13px]">
                <div>
                  <div className="text-sm font-semibold">{client.pack}</div>
                  <div className="text-xs text-ink-dim mt-0.5">Desde {client.since}</div>
                </div>
                <button
                  onClick={() => setShowPackPicker(true)}
                  className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-white"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="rounded-[12px] border border-[rgba(26,25,31,.14)] overflow-hidden">
                {packs.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPackId(p.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between px-[14px] py-[11px] text-left transition-colors border-b border-[rgba(26,25,31,.085)] last:border-0",
                      selectedPackId === p.id
                        ? "bg-bordo-surface"
                        : "bg-white hover:bg-[#FAFAFA]"
                    )}
                  >
                    <div>
                      <span className="text-sm font-medium">{p.name}</span>
                      <span className="ml-2 text-xs text-ink-dim">{p.credits} créditos</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-serif">
                        ${(p.price / 100).toLocaleString("es-AR")}
                        <span className="text-[11px] text-ink-dim font-sans">
                          {p.period === "monthly" ? "/mes" : "/clase"}
                        </span>
                      </span>
                      <div className={cn(
                        "size-[16px] rounded-full border-[1.5px] flex items-center justify-center",
                        selectedPackId === p.id ? "border-primary bg-primary" : "border-[rgba(26,25,31,.2)]"
                      )}>
                        {selectedPackId === p.id && <span className="size-[5px] rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-2 p-3 bg-[#FAFAFA]">
                  <button
                    onClick={() => { setShowPackPicker(false); setSelectedPackId(client.packId); }}
                    className="flex-1 cursor-pointer rounded-[9px] border border-[rgba(26,25,31,.14)] bg-white py-[9px] text-[12.5px] font-medium text-ink-dim transition-colors hover:bg-[#EFEFED]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAssignPack}
                    disabled={loading === "pack" || selectedPackId === client.packId}
                    className="flex-1 cursor-pointer rounded-[9px] bg-primary py-[9px] text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-50"
                  >
                    {loading === "pack" ? "Asignando..." : `Asignar ${selectedPack?.name ?? ""}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {client.isApproved ? (
              <button
                onClick={() => handleApproval(false)}
                disabled={loading === "approve"}
                className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] py-[11px] text-center text-[12.5px] font-medium text-destructive transition-colors hover:bg-naranja-soft disabled:opacity-50"
              >
                {loading === "approve" ? "Procesando..." : "Pausar membresía"}
              </button>
            ) : (
              <button
                onClick={() => handleApproval(true)}
                disabled={loading === "approve"}
                className="flex-1 cursor-pointer rounded-[11px] bg-primary py-[11px] text-center text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-50"
              >
                {loading === "approve" ? "Procesando..." : "Aprobar alumna"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
