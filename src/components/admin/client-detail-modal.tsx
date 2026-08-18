"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPacks,
  setApproval,
  assignPack,
  updateClientMedical,
  freezePack,
  unfreezePack,
  fetchClientHistory,
} from "@/app/admin/clientes/actions";
import type { AdminClient, AdminPack, ClientHistoryItem } from "@/lib/admin-types";
import { cn } from "@/lib/utils";
import { formatPhone } from "@/lib/phone";

const HISTORY_STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmada", cls: "text-primary bg-bordo-surface" },
  waitlist: { label: "Espera", cls: "text-amber-text bg-amber-soft" },
  cancelled: { label: "Cancelada", cls: "text-ink-dim bg-[#EFEFED]" },
};

const MONTHS_SHORT = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

interface ClientDetailModalProps {
  open: boolean;
  client: AdminClient | null;
  onClose: () => void;
  onUpdate: () => void;
}

/**
 * El contenido se monta cuando el modal se abre con una alumna, así el estado
 * arranca del cliente actual sin tener que resetearlo con un efecto. La `key`
 * fuerza el remonte si se pasa de una alumna a otra sin cerrar el modal.
 */
export function ClientDetailModal(props: ClientDetailModalProps) {
  if (!props.open || !props.client) return null;
  return <ClientDetailModalContent key={props.client.id} {...props} client={props.client} />;
}

function ClientDetailModalContent({
  client,
  onClose,
  onUpdate,
}: ClientDetailModalProps & { client: AdminClient }) {
  const [packs, setPacks] = useState<AdminPack[]>([]);
  const [showPackPicker, setShowPackPicker] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState<string | null>(client.packId);
  const [loading, setLoading] = useState<"approve" | "pack" | "freeze" | "medical" | null>(null);
  const [history, setHistory] = useState<ClientHistoryItem[]>([]);
  const [editMedical, setEditMedical] = useState(false);
  const [medNotes, setMedNotes] = useState(client.medicalNotes);
  const [medLevel, setMedLevel] = useState(client.experienceLevel ?? "");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPacks(), fetchClientHistory(client.id)]).then(([p, h]) => {
      if (cancelled) return;
      setPacks(p);
      setHistory(h);
    });
    return () => {
      cancelled = true;
    };
  }, [client.id]);

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

  const handleFreeze = async () => {
    if (!client?.userPackId) return;
    setLoading("freeze");
    if (client.packStatus === "frozen") {
      await unfreezePack(client.userPackId);
    } else {
      await freezePack(client.userPackId);
    }
    setLoading(null);
    onUpdate();
  };

  const handleSaveMedical = async () => {
    if (!client) return;
    setLoading("medical");
    await updateClientMedical(client.id, medNotes, medLevel || null);
    setLoading(null);
    setEditMedical(false);
    onUpdate();
  };

  const selectedPack = packs.find((p) => p.id === selectedPackId);

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="flex max-h-[90vh] w-[560px] max-w-full flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
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

        <div className="overflow-y-auto px-5 py-[18px]">
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
              <div className="text-xs text-ink-dim mt-0.5">{client.email || formatPhone(client.phone)}</div>
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
              <div className="rounded-[12px] bg-[#EFEFED] px-[14px] py-[13px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{client.pack}</span>
                      {client.packStatus === "frozen" && (
                        <span className="rounded-[100px] bg-[#E0EAF2] px-[7px] py-px text-[10px] font-semibold text-[#2C5A7A]">
                          Congelado
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-dim mt-0.5">
                      {client.packExpiresAt
                        ? `Vence ${new Date(client.packExpiresAt).getDate()} ${MONTHS_SHORT[new Date(client.packExpiresAt).getMonth()]}`
                        : `Desde ${client.since}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPackPicker(true)}
                    className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-white"
                  >
                    Cambiar
                  </button>
                </div>
                {client.userPackId && client.packId && (
                  <button
                    onClick={handleFreeze}
                    disabled={loading === "freeze"}
                    className="mt-2.5 w-full cursor-pointer rounded-[8px] border border-[rgba(26,25,31,.14)] bg-white py-[7px] text-[11.5px] font-medium text-foreground transition-colors hover:bg-[#F7F7F6] disabled:opacity-50"
                  >
                    {loading === "freeze"
                      ? "Procesando..."
                      : client.packStatus === "frozen"
                        ? "Reanudar membresía"
                        : "Congelar membresía (vacaciones)"}
                  </button>
                )}
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

          {/* Perfil médico / observaciones */}
          <div className="mb-[14px]">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
                Perfil médico / observaciones
              </span>
              {!editMedical && (
                <button
                  onClick={() => setEditMedical(true)}
                  className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
                >
                  Editar
                </button>
              )}
            </div>
            {!editMedical ? (
              <div className="rounded-[12px] bg-[#EFEFED] px-[14px] py-[13px]">
                {client.experienceLevel && (
                  <div className="mb-1 text-xs">
                    <span className="text-ink-dim">Nivel: </span>
                    <span className="font-medium">{client.experienceLevel}</span>
                  </div>
                )}
                <div className="text-[13px] leading-snug whitespace-pre-wrap">
                  {client.medicalNotes || <span className="text-ink-dim">Sin observaciones cargadas.</span>}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  value={medLevel}
                  onChange={(e) => setMedLevel(e.target.value)}
                  className="w-full rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[13px] py-[9px] text-sm outline-none focus:border-primary"
                  placeholder="Nivel (principiante / intermedio / avanzado)"
                />
                <textarea
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[13px] py-[9px] text-sm outline-none focus:border-primary"
                  placeholder="Lesiones, embarazo, recomendaciones para la profe..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditMedical(false); setMedNotes(client.medicalNotes); setMedLevel(client.experienceLevel ?? ""); }}
                    className="flex-1 cursor-pointer rounded-[9px] border border-[rgba(26,25,31,.14)] bg-white py-[9px] text-[12.5px] font-medium text-ink-dim transition-colors hover:bg-[#EFEFED]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveMedical}
                    disabled={loading === "medical"}
                    className="flex-1 cursor-pointer rounded-[9px] bg-primary py-[9px] text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-50"
                  >
                    {loading === "medical" ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Historial de clases */}
          <div className="mb-[14px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Historial de clases
            </div>
            {history.length === 0 ? (
              <div className="rounded-[12px] bg-[#EFEFED] px-[14px] py-3 text-[13px] text-ink-dim">
                Sin clases registradas.
              </div>
            ) : (
              <div className="max-h-[200px] overflow-y-auto rounded-[12px] border border-[rgba(26,25,31,.085)]">
                {history.map((h) => {
                  const d = new Date(h.date + "T12:00:00");
                  const st = HISTORY_STATUS[h.status] || { label: h.status, cls: "text-ink-dim bg-[#EFEFED]" };
                  return (
                    <div key={h.id} className="flex items-center justify-between border-b border-[rgba(26,25,31,.06)] px-[14px] py-2.5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 shrink-0 text-center">
                          <div className="font-serif text-[16px] leading-none">{d.getDate()}</div>
                          <div className="text-[9px] uppercase tracking-[0.06em] text-ink-dim">{MONTHS_SHORT[d.getMonth()]}</div>
                        </div>
                        <div>
                          <div className="text-[13px] font-medium">{h.className}</div>
                          <div className="text-[11px] text-ink-dim">{h.time}</div>
                        </div>
                      </div>
                      <span className={cn("rounded-[100px] px-[9px] py-[3px] text-[10px] font-semibold", st.cls)}>
                        {st.label}
                      </span>
                    </div>
                  );
                })}
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
