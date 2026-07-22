"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTemplateOptions } from "@/app/admin/actions";
import type { TemplateOption } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface RescheduleModalProps {
  open: boolean;
  studentName: string;
  currentTemplateId: string;
  defaultDate: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirm: (newTemplateId: string, newDate: string) => Promise<void>;
}

export function RescheduleModal({
  open,
  studentName,
  currentTemplateId,
  defaultDate,
  onClose,
  onConfirm,
}: RescheduleModalProps) {
  const [options, setOptions] = useState<TemplateOption[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [date, setDate] = useState(defaultDate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTemplateOptions().then(setOptions);
      setDate(defaultDate);
      setTemplateId("");
    }
  }, [open, defaultDate]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  const handleConfirm = async () => {
    if (!templateId) return;
    setLoading(true);
    await onConfirm(templateId, date);
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-200 flex items-center justify-center bg-[rgba(26,25,31,.4)] backdrop-blur-sm p-5"
    >
      <div className="w-[460px] max-w-full overflow-hidden rounded-[20px] bg-white shadow-[0_30px_90px_rgba(26,25,31,.22)]">
        <div className="flex items-center justify-between border-b border-[rgba(26,25,31,.085)] px-5 py-[18px]">
          <span className="text-[15px] font-semibold">Cambiar de horario</span>
          <button
            onClick={onClose}
            className="flex size-7 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            ×
          </button>
        </div>

        <div className="px-5 py-[18px]">
          <p className="mb-4 text-[13px] text-ink-dim">
            Mover la reserva de <span className="font-semibold text-foreground">{studentName}</span> a otra clase.
          </p>

          <div className="mb-3">
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-dim">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[13px] py-[10px] text-sm text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>

          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-dim">
            Clase destino
          </div>
          <div className="max-h-[260px] overflow-y-auto rounded-[12px] border border-[rgba(26,25,31,.14)]">
            {options.length === 0 ? (
              <div className="px-4 py-3 text-[13px] text-ink-dim">Cargando clases...</div>
            ) : (
              options.map((t) => {
                const disabled = t.id === currentTemplateId;
                return (
                  <button
                    key={t.id}
                    disabled={disabled}
                    onClick={() => setTemplateId(t.id)}
                    className={cn(
                      "flex w-full items-center justify-between border-b border-[rgba(26,25,31,.085)] px-[14px] py-[11px] text-left transition-colors last:border-0",
                      disabled
                        ? "cursor-not-allowed opacity-40"
                        : templateId === t.id
                        ? "bg-bordo-surface cursor-pointer"
                        : "cursor-pointer bg-white hover:bg-[#FAFAFA]"
                    )}
                  >
                    <div>
                      <span className="text-sm font-medium">{t.name}</span>
                      <span className="ml-2 text-xs text-ink-dim">
                        {DAY_LABELS[t.dayOfWeek] ?? ""} · {t.timeStart}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "flex size-[16px] items-center justify-center rounded-full border-[1.5px]",
                        templateId === t.id ? "border-primary bg-primary" : "border-[rgba(26,25,31,.2)]"
                      )}
                    >
                      {templateId === t.id && <span className="size-[5px] rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-white py-[11px] text-[12.5px] font-medium text-ink-dim transition-colors hover:bg-[#EFEFED]"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !templateId}
              className="flex-1 cursor-pointer rounded-[11px] bg-primary py-[11px] text-[12.5px] font-semibold text-white transition-opacity disabled:opacity-50"
            >
              {loading ? "Moviendo..." : "Confirmar cambio"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
