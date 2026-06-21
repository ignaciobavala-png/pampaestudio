"use client";

import { useCallback } from "react";
import { CapacityStepper } from "@/components/admin/capacity-stepper";
import { StudentRow } from "@/components/admin/student-row";
import { WaitlistRow } from "@/components/admin/waitlist-row";
import type { AdminClass } from "@/lib/admin-types";

interface ClassDetailProps {
  cls: AdminClass;
  max: number;
  onClose: () => void;
  onMaxChange: (index: number, newMax: number) => void;
  onCancelClass: () => void;
  index: number;
}

export function ClassDetail({ cls, max, onClose, onMaxChange, onCancelClass, index }: ClassDetailProps) {
  const { name, type, room, teacher, time, end, taken } = cls;
  const free = max - taken;
  const pct = Math.round((taken / max) * 100);
  const full = free <= 0;
  const warn = !full && pct >= 80;

  const barColor = full ? "var(--color-primary)" : warn ? "var(--color-destructive)" : "var(--color-primary)";
  const seatState = full ? "bg-primary" : warn ? "bg-destructive" : "bg-primary";

  const handleMaxChange = useCallback((newMax: number) => {
    onMaxChange(index, newMax);
  }, [index, onMaxChange]);

  return (
    <div className="flex flex-col gap-[13px]">
      {/* Mobile back button */}
      <button onClick={onClose} className="hidden max-[860px]:flex items-center gap-[7px] bg-transparent border-none text-[13px] text-ink-dim cursor-pointer p-0 mb-3 hover:text-foreground">
        ← Clases del dia
      </button>

      {/* Info card */}
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white">
        <div className="px-[22px] py-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-1.5 text-[11px] font-semibold tracking-[0.09em] uppercase text-ink-dim">
                {type} · {room}
              </div>
              <h2 className="pr-9 font-serif text-[28px] leading-[1.05] tracking-[-0.02em]">
                {name}
              </h2>
              <div className="mt-1 mb-4 text-[13px] text-ink-dim">
                {teacher} · {time}–{end} · Vie 13 jun
              </div>
            </div>
            <button onClick={onClose} className="hidden min-[861px]:flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[rgba(26,25,31,.14)] bg-white text-[15px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED] ml-3 mt-1">
              ×
            </button>
          </div>
          <div className="flex flex-wrap gap-[7px]">
            <button className="cursor-pointer rounded-[10px] bg-primary px-[15px] py-2 text-[12.5px] font-medium text-white border-none transition-colors hover:bg-bordo-hover shadow-[inset_0_1px_0_rgba(255,255,255,.22)]">
              Enviar recordatorio
            </button>
            <button className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]">
              Duplicar
            </button>
            <button onClick={onCancelClass} className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-destructive transition-colors hover:bg-naranja-soft hover:border-red-200">
              Cancelar clase
            </button>
          </div>
        </div>
      </div>

      {/* Cupo card */}
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white">
        <div className="px-[22px] py-5">
          <div className="mb-[14px] flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.09em] uppercase text-ink-dim">Cupo</span>
          </div>
          <div className="mb-[14px] flex items-end gap-4">
            <div className="font-serif text-[56px] leading-[0.9] tracking-[-0.02em]">
              {taken}
              <span className="text-[26px] text-ink-dim">/{max}</span>
            </div>
            <div className="pb-[5px]">
              <div className="text-[13px] text-ink-dim">{pct}% ocupado</div>
              <div className="mt-0.5 text-[13px] font-semibold" style={{ color: barColor }}>
                {full ? "Sin lugares · lista activa" : `${free} lugar${free > 1 ? "es" : ""} disponible${free > 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
          <div className="mb-3 h-[6px] overflow-hidden rounded-[3px] bg-[#EFEFED]">
            <div className="h-full rounded-[3px] transition-[width] duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
          </div>
          <div className="mb-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${max > 10 ? 10 : max}, 1fr)` }}>
            {Array.from({ length: max }).map((_, i) => (
              <div key={i} className={i < taken ? `h-7 rounded-[6px] max-[480px]:h-[22px] max-[480px]:rounded-[5px] ${seatState}` : "h-7 rounded-[6px] bg-[#EFEFED] max-[480px]:h-[22px] max-[480px]:rounded-[5px]"} />
            ))}
          </div>
          <CapacityStepper currentMax={max} taken={taken} onSave={handleMaxChange} />
        </div>
      </div>

      {/* Alumnas card */}
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white">
        <div className="px-[22px] py-5">
          <div className="mb-[14px] flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.09em] uppercase text-ink-dim">
              Alumnas reservadas · {taken}
            </span>
            <div className="flex gap-1.5">
              <button className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
                Asistencia
              </button>
              <button className="cursor-pointer rounded-[7px] border border-[rgba(26,25,31,.14)] bg-transparent px-2.5 py-1 text-[11px] font-medium text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
                Exportar
              </button>
            </div>
          </div>
          <div>
            {cls.att.map(([name, pack, avColor, initials]) => (
              <StudentRow key={initials} name={name} pack={pack} avColor={avColor} initials={initials} />
            ))}
          </div>
        </div>
      </div>

      {/* Waitlist card */}
      <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white">
        <div className="px-[22px] py-5">
          <div className="mb-[14px] flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.09em] uppercase text-ink-dim">
              Lista de espera · {cls.wl.length}
            </span>
          </div>
          {cls.wl.length > 0 ? (
            <>
              {cls.wl.map(([name, avColor, initials, since], i) => (
                <WaitlistRow key={initials} position={i + 1} name={name} avColor={avColor} initials={initials} since={since} />
              ))}
              <div className="mt-[14px] flex gap-2 border-t border-[rgba(26,25,31,.085)] pt-[14px]">
                <button className="flex-1 cursor-pointer rounded-[9px] border border-[rgba(26,25,31,.14)] bg-white py-[9px] text-xs font-semibold text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]">
                  Exportar
                </button>
                <button className="flex-1 cursor-pointer rounded-[9px] bg-foreground py-[9px] text-xs font-semibold text-white border-none transition-colors hover:bg-black">
                  Notificar a todas
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-[11px] px-1 py-1.5 text-[13px] text-ink-dim">
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[9px] bg-[#EFEFED] text-[15px] text-ink-dim">✓</span>
              <span>Sin lista de espera — hay lugares disponibles.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
