"use client";

import { useState, useCallback, useEffect } from "react";
import { KPICard } from "@/components/admin/kpi-card";
import { DayTabs } from "@/components/admin/day-tabs";
import { ClassListRow } from "@/components/admin/class-list-row";
import { ClassDetail } from "@/components/admin/class-detail";
import { CancelModal } from "@/components/admin/cancel-modal";
import { ToastProvider, useToast } from "@/components/admin/toast";
import { createClient } from "@/lib/supabase/client";
import type { AdminClass } from "@/lib/admin-types";
import type { Database } from "@/types/database";

type ClassTemplate = Database["public"]["Tables"]["class_templates"]["Row"];

const DISCIPLINE_COLORS: Record<string, string> = {
  Yoga: "var(--color-primary)",
  Pilates: "#9A7B2E",
};

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

function generateAvColor(name: string): string {
  const colors = [
    "#490419", "#7C6FF2", "#6E63C8", "#5E6BD6",
    "#4E7C9E", "#8A6FD0", "#5B7C8A", "#7355C8",
    "#6E6D78", "#9A7B2E",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
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
    const supabase = createClient();
    const date = getDateForDay(dayIndex);

    const { data: templates } = await supabase
      .from("class_templates")
      .select("*")
      .eq("day_of_week", dayIndex)
      .eq("is_active", true)
      .order("time_start");

    if (!templates || templates.length === 0) {
      setClasses([]);
      setClassMaxes([]);
      setLoading(false);
      return;
    }

    const classesData: AdminClass[] = [];
    const maxes: number[] = [];
    let totalBookings = 0;
    let totalConfirmed = 0;
    let totalWL = 0;
    let totalCapacity = 0;

    for (const t of templates) {
      const { data: confirmed } = await supabase
        .from("bookings")
        .select("*, profiles(full_name), user_packs(packs(name))")
        .eq("template_id", t.id)
        .eq("date", date)
        .eq("status", "confirmed")
        .order("created_at");

      const { data: waitlist } = await supabase
        .from("bookings")
        .select("*, profiles(full_name)")
        .eq("template_id", t.id)
        .eq("date", date)
        .eq("status", "waitlist")
        .order("waitlist_position");

      const att: AdminClass["att"] = (confirmed || []).map((b) => {
        const p = b as unknown as {
          profiles: { full_name: string } | null;
          user_packs: { packs: { name: string } | null }[] | null;
        };
        const name = p.profiles?.full_name || "Sin nombre";
        const pack =
          p.user_packs?.[0]?.packs?.name || "Sin pack";
        return [name, pack, generateAvColor(name), getInitials(name)];
      });

      const wl: AdminClass["wl"] = (waitlist || []).map((b) => {
        const p = b as unknown as {
          profiles: { full_name: string } | null;
        };
        const name = p.profiles?.full_name || "Sin nombre";
        const since = b.created_at
          ? new Date(b.created_at).toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "";
        return [name, generateAvColor(name), getInitials(name), since];
      });

      const taken = (confirmed || []).length;
      totalBookings += taken;
      totalWL += (waitlist || []).length;
      totalConfirmed += taken;
      totalCapacity += t.max_capacity;

      classesData.push({
        name: t.name,
        type: t.discipline as "Yoga" | "Pilates",
        room: t.room,
        teacher: t.teacher,
        time: t.time_start.slice(0, 5),
        end: t.time_end.slice(0, 5),
        taken,
        max: t.max_capacity,
        color: DISCIPLINE_COLORS[t.discipline] || "var(--color-primary)",
        att,
        wl,
      });

      maxes.push(t.max_capacity);
    }

    setClasses(classesData);
    setClassMaxes(maxes);
    setKpis({
      total: templates.length,
      ocupacion:
        totalCapacity > 0
          ? Math.round((totalConfirmed / totalCapacity) * 100)
          : 0,
      espera: totalWL,
    });
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

      const supabase = createClient();
      const templates = await supabase
        .from("class_templates")
        .select("id")
        .eq("name", cls.name)
        .eq("day_of_week", dayIndex)
        .single();

      if (templates.data) {
        await supabase
          .from("class_templates")
          .update({ max_capacity: newMax })
          .eq("id", templates.data.id);
      }

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
    const supabase = createClient();

    const { data: template } = await supabase
      .from("class_templates")
      .select("id")
      .eq("name", cls.name)
      .eq("day_of_week", dayIndex)
      .single();

    if (template) {
      const date = getDateForDay(dayIndex);

      await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("template_id", template.id)
        .eq("date", date)
        .eq("status", "confirmed");

      await supabase
        .from("bookings")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("template_id", template.id)
        .eq("date", date)
        .eq("status", "waitlist");
    }

    toast(`Clase cancelada · ${cls.taken} créditos devueltos · notificadas`);
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
