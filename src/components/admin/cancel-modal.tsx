"use client";

import { useCallback } from "react";

interface CancelModalProps {
  open: boolean;
  className: string;
  taken: number;
  time: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CancelModal({ open, className, taken, time, onClose, onConfirm }: CancelModalProps) {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  if (!open) return null;

  return (
    <div onClick={handleOverlayClick} className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5">
      <div className="w-[460px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <span className="text-[15px] font-semibold">Cancelar clase</span>
          <button onClick={onClose} className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
            ×
          </button>
        </div>
        <div className="px-5 py-[18px]">
          <div className="mb-4 flex items-center justify-between rounded-[11px] border border-[rgba(26,25,31,.085)] bg-[#F7F7F6] px-[15px] py-[13px]">
            <div>
              <div className="text-sm font-semibold">{className}</div>
              <div className="mt-0.5 text-[11px] text-ink-dim">Vie · {time} · {taken} alumnas</div>
            </div>
            <div className="text-right">
              <div className="font-serif text-[26px] leading-none text-destructive">{taken}</div>
              <div className="mt-0.5 text-[9px] uppercase tracking-[0.07em] text-ink-dim">a notificar</div>
            </div>
          </div>
          <div className="mb-[13px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">Motivo</div>
            <div className="flex gap-[5px]">
              {["Instructora", "Fuerza mayor", "Mantenimiento"].map((m) => (
                <button key={m} className="flex-1 cursor-pointer rounded-lg border border-[rgba(26,25,31,.14)] bg-white py-2 text-xs text-ink-dim transition-colors hover:bg-[#EFEFED]">
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-[13px]">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">Mensaje (opcional)</div>
            <textarea className="h-[65px] w-full resize-none rounded-[10px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-3 py-2.5 font-sans text-[13px] text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white" placeholder="Ej: Creditos devueltos automaticamente..." />
          </div>
        </div>
        <div className="flex gap-[7px] border-t border-[rgba(26,25,31,.085)] px-5 py-[13px]">
          <button onClick={onClose} className="flex-1 cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white py-2.5 text-[13px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
            Volver
          </button>
          <button onClick={onConfirm} className="flex-[2] cursor-pointer rounded-[10px] bg-naranja-soft py-2.5 text-[13px] font-semibold text-destructive border-none transition-colors hover:bg-[#f3d9d6]">
            Cancelar y notificar
          </button>
        </div>
      </div>
    </div>
  );
}
