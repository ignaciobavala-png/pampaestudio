"use client";

import { WeekCalendar } from "@/components/admin/week-calendar";

const DAYS = [
  { wd: "Lun", n: 9 },
  { wd: "Mar", n: 10 },
  { wd: "Mie", n: 11 },
  { wd: "Jue", n: 12 },
  { wd: "Vie", n: 13, today: true },
  { wd: "Sab", n: 14 },
];

interface WeekEvent {
  time: string;
  end: string;
  name: string;
  type: "Yoga" | "Pilates";
  teacher: string;
  taken: number;
  max: number;
}

const WEEK_DATA: Record<number, WeekEvent[]> = {
  0: [
    { time: "08:00", end: "09:15", name: "Vinyasa Flow", type: "Yoga", teacher: "Valeria M.", taken: 7, max: 10 },
    { time: "10:00", end: "11:00", name: "Pilates Mat", type: "Pilates", teacher: "Sofia R.", taken: 4, max: 10 },
    { time: "19:00", end: "20:00", name: "Yin & Restore", type: "Yoga", teacher: "Camila L.", taken: 9, max: 10 },
  ],
  1: [
    { time: "07:30", end: "08:30", name: "Pilates Reformer", type: "Pilates", teacher: "Sofia R.", taken: 6, max: 6 },
    { time: "20:00", end: "21:15", name: "Hatha Flow", type: "Yoga", teacher: "Valeria M.", taken: 3, max: 10 },
  ],
  2: [
    { time: "08:00", end: "09:15", name: "Vinyasa Flow", type: "Yoga", teacher: "Valeria M.", taken: 8, max: 10 },
    { time: "10:00", end: "11:00", name: "Pilates Mat", type: "Pilates", teacher: "Sofia R.", taken: 6, max: 10 },
    { time: "19:30", end: "20:30", name: "Slow Flow", type: "Yoga", teacher: "Camila L.", taken: 5, max: 10 },
  ],
  3: [
    { time: "07:30", end: "08:30", name: "Pilates Reformer", type: "Pilates", teacher: "Sofia R.", taken: 5, max: 6 },
    { time: "19:00", end: "20:15", name: "Yin & Restore", type: "Yoga", teacher: "Camila L.", taken: 8, max: 10 },
  ],
  4: [
    { time: "07:00", end: "08:15", name: "Vinyasa Flow Manana", type: "Yoga", teacher: "Valeria M.", taken: 9, max: 10 },
    { time: "08:30", end: "09:30", name: "Pilates Reformer", type: "Pilates", teacher: "Sofia R.", taken: 6, max: 6 },
    { time: "10:00", end: "11:15", name: "Hatha Principiantes", type: "Yoga", teacher: "Camila L.", taken: 5, max: 10 },
    { time: "19:00", end: "20:00", name: "Pilates Mat Intensivo", type: "Pilates", teacher: "Sofia R.", taken: 8, max: 10 },
    { time: "20:30", end: "21:30", name: "Yin & Restore", type: "Yoga", teacher: "Camila L.", taken: 4, max: 10 },
  ],
  5: [
    { time: "09:00", end: "10:15", name: "Slow Flow", type: "Yoga", teacher: "Valeria M.", taken: 6, max: 10 },
    { time: "11:00", end: "12:00", name: "Pilates Reformer", type: "Pilates", teacher: "Sofia R.", taken: 5, max: 6 },
  ],
};

export default function SemanaPage() {
  return (
    <div>
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2.5">
        <div>
          <h1 className="font-serif text-[32px] tracking-[-0.02em]">Semana</h1>
          <p className="mt-1 text-[13px] text-ink-dim">9 – 14 junio 2026</p>
        </div>
        <div className="flex gap-2">
          <button className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]">
            ‹ Anterior
          </button>
          <button className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-[15px] py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]">
            Siguiente ›
          </button>
        </div>
      </div>
      <WeekCalendar days={DAYS} data={WEEK_DATA} />
    </div>
  );
}
