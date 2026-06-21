// TODO: Supabase — Reemplazar mock data con queries reales:
//   - KPIs: SELECT COUNT(*) FROM bookings WHERE date = today(), etc.
//   - Clases: class_templates JOIN bookings con COUNT por status
//   - Detail: bookings con user_id → profiles.full_name, user_packs.pack_id → packs.name
//   - Max capacity: UPDATE class_templates SET max_capacity = ?
//   - Cancelar: open cancel-modal → confirm → UPDATE bookings SET status='cancelled', devolver creditos

"use client";

import { useState, useCallback } from "react";
import { KPICard } from "@/components/admin/kpi-card";
import { DayTabs } from "@/components/admin/day-tabs";
import { ClassListRow } from "@/components/admin/class-list-row";
import { ClassDetail } from "@/components/admin/class-detail";
import { CancelModal } from "@/components/admin/cancel-modal";
import { ToastProvider, useToast } from "@/components/admin/toast";
import type { AdminClass } from "@/lib/admin-types";

const WEEK_DAYS = [
  { label: "Lun", num: 9, today: false },
  { label: "Mar", num: 10, today: false },
  { label: "Mie", num: 11, today: false },
  { label: "Jue", num: 12, today: false },
  { label: "Vie", num: 13, today: true },
  { label: "Sab", num: 14, today: false },
];

const CLASSES: AdminClass[] = [
  {
    name: "Vinyasa Flow Manana", type: "Yoga", room: "Sala 1", teacher: "Valeria Martinez", time: "07:00", end: "08:15",
    taken: 9, max: 10, color: "var(--color-primary)",
    att: [
      ["Lucia Fernandez", "Pack Fusion", "#490419", "LF"], ["Martina Gomez", "Pack Esencia", "#7C6FF2", "MG"],
      ["Sofia Perez", "Pack Libre", "#6E63C8", "SP"], ["Valentina Ruiz", "Pack Fusion", "#5E6BD6", "VR"],
      ["Camila Torres", "Pack Studio", "#4E7C9E", "CT"], ["Isabella Lopez", "Pack Fusion", "#8A6FD0", "IL"],
      ["Ana Garcia", "Pack Esencia", "#5B7C8A", "AG"], ["Florencia Diaz", "Pack Libre", "#7355C8", "FD"],
      ["Renata Suarez", "Pack Inmersion", "#6E6D78", "RS"],
    ],
    wl: [],
  },
  {
    name: "Pilates Reformer", type: "Pilates", room: "Reformer", teacher: "Sofia Rodriguez", time: "08:30", end: "09:30",
    taken: 6, max: 6, color: "#9A7B2E",
    att: [
      ["Maria Laura Gomez", "Pack Studio", "#490419", "ML"], ["Andrea Navarro", "Pack Fusion", "#7C6FF2", "AN"],
      ["Julieta Moreno", "Pack Studio", "#6E63C8", "JM"], ["Carolina Rios", "Pack Fusion", "#5E6BD6", "CR"],
      ["Daniela Castro", "Pack Studio", "#4E7C9E", "DC"], ["Veronica Blanco", "Pack Fusion", "#8A6FD0", "VB"],
    ],
    wl: [
      ["Valentina Suarez", "#5B7C8A", "VS", "10:23"], ["Clara Landa", "#7355C8", "CL", "11:05"],
      ["Paula Mendez", "#6E6D78", "PM", "11:40"], ["Rosa Acosta", "#490419", "RA", "12:10"],
    ],
  },
  {
    name: "Hatha Principiantes", type: "Yoga", room: "Sala 1", teacher: "Camila Lopez", time: "10:00", end: "11:15",
    taken: 5, max: 10, color: "var(--color-primary)",
    att: [
      ["Elena Vega", "Pack Esencia", "#490419", "EV"], ["Jimena Ortiz", "Pack Libre", "#7C6FF2", "JO"],
      ["Natalia Silva", "Pack Esencia", "#6E63C8", "NS"], ["Patricia Herrera", "Pack Fusion", "#5E6BD6", "PH"],
      ["Gabriela Molina", "Pack Esencia", "#4E7C9E", "GM"],
    ],
    wl: [],
  },
  {
    name: "Pilates Mat Intensivo", type: "Pilates", room: "Sala 2", teacher: "Sofia Rodriguez", time: "19:00", end: "20:00",
    taken: 8, max: 10, color: "#9A7B2E",
    att: [
      ["Luisa Ramirez", "Pack Studio", "#490419", "LR"], ["Monica Fuentes", "Pack Fusion", "#7C6FF2", "MF"],
      ["Estela Paredes", "Pack Studio", "#6E63C8", "EP"], ["Diana Salinas", "Pack Fusion", "#5E6BD6", "DS"],
      ["Claudia Mendoza", "Pack Studio", "#4E7C9E", "CM"], ["Sandra Rojas", "Pack Libre", "#8A6FD0", "SR"],
      ["Alicia Vargas", "Pack Fusion", "#5B7C8A", "AV"], ["Teresa Montes", "Pack Studio", "#7355C8", "TM"],
    ],
    wl: [
      ["Beatriz Cano", "#6E6D78", "BC", "14:30"], ["Nora Ibanez", "#490419", "NI", "15:10"],
    ],
  },
  {
    name: "Yin & Restore", type: "Yoga", room: "Sala 1", teacher: "Camila Lopez", time: "20:30", end: "21:30",
    taken: 4, max: 10, color: "var(--color-primary)",
    att: [
      ["Irene Castillo", "Pack Libre", "#490419", "IC"], ["Laura Espinoza", "Pack Fusion", "#7C6FF2", "LE"],
      ["Silvia Pena", "Pack Esencia", "#6E63C8", "SP"], ["Rebeca Serrano", "Pack Libre", "#5E6BD6", "RS"],
    ],
    wl: [],
  },
];

function HoyContent() {
  const { toast } = useToast();
  const [dayIndex, setDayIndex] = useState(4);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [classMaxes, setClassMaxes] = useState(CLASSES.map((c) => c.max));
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);

  const selectClass = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleMaxChange = useCallback((index: number, newMax: number) => {
    setClassMaxes((prev) => {
      const next = [...prev];
      next[index] = newMax;
      return next;
    });
    toast(`Cupo actualizado a ${newMax} lugares`);
  }, [toast]);

  const openCancel = useCallback(() => {
    if (selectedIndex === null) return;
    setCancelTarget(selectedIndex);
  }, [selectedIndex]);

  const confirmCancel = useCallback(() => {
    if (cancelTarget === null) return;
    const cls = CLASSES[cancelTarget];
    setCancelTarget(null);
    toast(`Clase cancelada · ${cls.taken} creditos devueltos · notificadas`);
  }, [cancelTarget, toast]);

  const detailVisible = selectedIndex !== null;

  return (
    <>
      {/* KPIs */}
      <div className="mb-6 grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[480px]:grid-cols-2 max-[480px]:gap-2">
        <KPICard label="Clases hoy" value="5" detail="vs ayer" badge={{ text: "+1", variant: "up" }} />
        <KPICard label="Ocupacion" value="73%" detail="sem." badge={{ text: "↑ 8%", variant: "up" }} />
        <KPICard label="En espera" value="7" detail="3 clases" badge={{ text: "3 clases", variant: "down" }} />
        <KPICard label="Ingresos mes" value="$1,24M" detail="" badge={{ text: "↑ 12%", variant: "up" }} valueSize="small" />
      </div>

      {/* Day tabs */}
      <DayTabs days={WEEK_DAYS} activeIndex={dayIndex} onSelect={setDayIndex} meta="5 clases" />

      {/* Master-detail grid */}
      <div className="grid grid-cols-[320px_1fr] items-start gap-4 max-[860px]:grid-cols-1">
        {/* Left panel: class list */}
        <aside className={detailVisible ? "hidden max-[860px]:hidden" : "sticky top-[calc(58px+60px)] flex max-h-[calc(100dvh-58px-80px)] flex-col overflow-hidden rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white max-[860px]:static max-[860px]:max-h-none"}>
          <div className="flex shrink-0 items-center justify-between px-4 py-[13px] border-b border-[rgba(26,25,31,.085)]">
            <span className="text-[13px] font-semibold">Clases del dia</span>
            <span className="text-xs text-ink-dim">{CLASSES.length}</span>
          </div>
          <div className="overflow-y-auto p-[7px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#DEDDDA] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
            {CLASSES.map((c, i) => (
              <ClassListRow
                key={i}
                time={c.time}
                name={c.name}
                teacher={c.teacher}
                room={c.room}
                color={c.color}
                taken={c.taken}
                max={classMaxes[i]}
                isActive={selectedIndex === i}
                onClick={() => selectClass(i)}
              />
            ))}
          </div>
        </aside>

        {/* Right panel: detail */}
        <section className={detailVisible ? "" : "hidden min-[861px]:flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[rgba(26,25,31,.14)] bg-white py-[60px] px-[30px] text-center"}>
          {detailVisible ? (
            <ClassDetail
              cls={CLASSES[selectedIndex!]}
              max={classMaxes[selectedIndex!]}
              index={selectedIndex!}
              onClose={closeDetail}
              onMaxChange={handleMaxChange}
              onCancelClass={openCancel}
            />
          ) : (
            <div className="contents">
              <div className="font-serif text-[32px] italic text-[#DEDDDA]">○</div>
              <div className="mt-2 text-[13px] text-ink-dim leading-relaxed">
                Selecciona una clase para ver<br />el detalle, cupo y lista de espera.
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Cancel modal */}
      {cancelTarget !== null && (
        <CancelModal
          open={true}
          className={CLASSES[cancelTarget].name}
          taken={CLASSES[cancelTarget].taken}
          time={CLASSES[cancelTarget].time}
          onClose={() => setCancelTarget(null)}
          onConfirm={confirmCancel}
        />
      )}
    </>
  );
}

export default function AdminPage() {
  return (
    <ToastProvider>
      <HoyContent />
    </ToastProvider>
  );
}
