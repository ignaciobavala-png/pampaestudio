"use client";

import { useState, useCallback, useEffect } from "react";
import { KPICard } from "@/components/admin/kpi-card";
import { DayTabs } from "@/components/admin/day-tabs";
import { ClassListRow } from "@/components/admin/class-list-row";
import { ClassDetail } from "@/components/admin/class-detail";
import { CancelModal } from "@/components/admin/cancel-modal";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { fetchAdminDay, updateClassMaxCapacity, cancelClass } from "./actions";
import type { AdminClass } from "@/lib/admin-types";

function getWeekDays() {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][i] || "",
      num: d.getDate(),
      today: d.toDateString() === today.toDateString(),
    };
  }).slice(0, 6);
}

function getDateForDay(dayIndex: number): string {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIndex);
  return target.toISOString().slice(0, 10);
}

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_LABELS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function getDateLabel(dayIndex: number): string {
  const today = new Date();
  const todayDow = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - todayDow);
  const target = new Date(monday);
  target.setDate(monday.getDate() + dayIndex);
  return `${DAY_LABELS[dayIndex]} ${target.getDate()} ${MONTH_LABELS[target.getMonth()]}`;
}

function HoyContent() {
  const { toast } = useToast();
  const [dayIndex, setDayIndex] = useState(() => {
    const todayDow = (new Date().getDay() + 6) % 7;
    return todayDow >= 5 ? 4 : todayDow;
  });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [classMaxes, setClassMaxes] = useState<number[]>([]);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState({ total: 0, ocupacion: 0, espera: 0 });

  const weekDays = getWeekDays();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const date = getDateForDay(dayIndex);
    const result = await fetchAdminDay(dayIndex, date);
    setClasses(result.classes);
    setClassMaxes(result.maxes);
    setKpis(result.kpis);
    setLoading(false);
  }, [dayIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectClass = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeDetail = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handleMaxChange = useCallback(
    async (index: number, newMax: number) => {
      const cls = classes[index];
      if (!cls) return;

      setClassMaxes((prev) => {
        const next = [...prev];
        next[index] = newMax;
        return next;
      });

      await updateClassMaxCapacity(cls.name, dayIndex, newMax);
      toast(`Cupo actualizado a ${newMax} lugares`);
    },
    [classes, dayIndex, toast]
  );

  const openCancel = useCallback(() => {
    if (selectedIndex === null) return;
    setCancelTarget(selectedIndex);
  }, [selectedIndex]);

  const confirmCancel = useCallback(async () => {
    if (cancelTarget === null) return;
    const cls = classes[cancelTarget];
    if (!cls) return;

    setCancelTarget(null);
    const date = getDateForDay(dayIndex);
    const { creditsRestored } = await cancelClass(cls.name, dayIndex, date);
    const restored = creditsRestored || cls.taken;
    toast(`Clase cancelada · ${restored} créditos devueltos · notificadas`);
    fetchData();
  }, [cancelTarget, classes, dayIndex, toast, fetchData]);

  const detailVisible = selectedIndex !== null;

  return (
    <>
      <div className="mb-6 grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[480px]:grid-cols-2 max-[480px]:gap-2">
        <KPICard
          label="Clases hoy"
          value={loading ? "—" : String(kpis.total)}
          detail=""
          badge={undefined}
        />
        <KPICard
          label="Ocupación"
          value={loading ? "—" : `${kpis.ocupacion}%`}
          detail=""
          badge={undefined}
        />
        <KPICard
          label="En espera"
          value={loading ? "—" : String(kpis.espera)}
          detail=""
          badge={undefined}
        />
        <KPICard
          label="Ingresos mes"
          value="—"
          detail=""
          valueSize="small"
        />
      </div>

      <DayTabs
        days={weekDays}
        activeIndex={dayIndex}
        onSelect={setDayIndex}
        meta={`${kpis.total} clases`}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-ink-dim">Cargando...</div>
        </div>
      ) : (
        <div className="grid grid-cols-[320px_1fr] items-start gap-4 max-[860px]:grid-cols-1">
          <aside
            className={
              detailVisible
                ? "hidden max-[860px]:hidden"
                : "sticky top-[calc(58px+60px)] flex max-h-[calc(100dvh-58px-80px)] flex-col overflow-hidden rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white max-[860px]:static max-[860px]:max-h-none"
            }
          >
            <div className="flex shrink-0 items-center justify-between px-4 py-[13px] border-b border-[rgba(26,25,31,.085)]">
              <span className="text-[13px] font-semibold">
                Clases del día
              </span>
              <span className="text-xs text-ink-dim">{classes.length}</span>
            </div>
            <div className="overflow-y-auto p-[7px] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-[#DEDDDA] [&::-webkit-scrollbar-thumb]:rounded-[2px]">
              {classes.map((c, i) => (
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

          <section
            className={
              detailVisible
                ? ""
                : "hidden min-[861px]:flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[rgba(26,25,31,.14)] bg-white py-[60px] px-[30px] text-center"
            }
          >
            {detailVisible ? (
              <ClassDetail
                cls={classes[selectedIndex!]}
                max={classMaxes[selectedIndex!]}
                index={selectedIndex!}
                onClose={closeDetail}
                onMaxChange={handleMaxChange}
                onCancelClass={openCancel}
                dateLabel={getDateLabel(dayIndex)}
              />
            ) : (
              <div className="contents">
                <div className="font-serif text-[32px] italic text-[#DEDDDA]">
                  ○
                </div>
                <div className="mt-2 text-[13px] text-ink-dim leading-relaxed">
                  Seleccioná una clase para ver
                  <br />
                  el detalle, cupo y lista de espera.
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {cancelTarget !== null && (
        <CancelModal
          open={true}
          className={classes[cancelTarget].name}
          taken={classes[cancelTarget].taken}
          time={classes[cancelTarget].time}
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
