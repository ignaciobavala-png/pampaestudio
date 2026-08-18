"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createClassTemplate,
  fetchNewClassCatalogs,
  type NewClassCatalogs,
} from "./actions";

/** Las clases del estudio duran 50 minutos; la grilla arranca a las 7 y corta cada 50'. */
const DEFAULT_DURATION_MIN = 50;
const GRID_START_MIN = 7 * 60;
const GRID_END_MIN = 21 * 60;

function minutesToTime(total: number): string {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMinutes(value: string): number {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

/** Horarios de inicio posibles: cada 50 minutos desde las 07:00. */
const START_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let t = GRID_START_MIN; t + DEFAULT_DURATION_MIN <= GRID_END_MIN; t += DEFAULT_DURATION_MIN) {
    slots.push(minutesToTime(t));
  }
  return slots;
})();

const DAY_OPTIONS = [
  { label: "Lunes", value: 0 },
  { label: "Martes", value: 1 },
  { label: "Miércoles", value: 2 },
  { label: "Jueves", value: 3 },
  { label: "Viernes", value: 4 },
  { label: "Sábado", value: 5 },
  { label: "Domingo", value: 6 },
];

/** En la base 0 = Lunes; en JS, 0 = Domingo. */
function dayOfWeekFromDate(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

const labelCls =
  "text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim";
const fieldCls =
  "w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white";

export default function NuevaClasePage() {
  const router = useRouter();

  const [catalogs, setCatalogs] = useState<NewClassCatalogs | null>(null);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [classTypeId, setClassTypeId] = useState("");
  const [repeatsWeekly, setRepeatsWeekly] = useState(true);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [specificDate, setSpecificDate] = useState("");
  const [timeStart, setTimeStart] = useState("09:00");
  const [duration, setDuration] = useState(DEFAULT_DURATION_MIN);
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    const data = await fetchNewClassCatalogs();
    setCatalogs(data);
    setTeacherId((prev) => prev || data.teachers[0]?.id || "");
    setRoomId((prev) => prev || data.rooms[0]?.id || "");
    setClassTypeId((prev) => prev || data.classTypes[0]?.id || "");
  }, []);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  const timeEnd = minutesToTime(timeToMinutes(timeStart) + duration);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre de la clase es obligatorio.");
      return;
    }
    if (!teacherId || !roomId || !classTypeId) {
      setError("Falta elegir instructora, sala o tipo de clase.");
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      setError("La duración tiene que ser mayor a cero.");
      return;
    }
    if (!repeatsWeekly && !specificDate) {
      setError("Una clase que no se repite necesita una fecha.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await createClassTemplate({
      name: name.trim(),
      teacher_id: teacherId,
      room_id: roomId,
      class_type_id: classTypeId,
      // Para una clase única el día sale de la fecha elegida, así la agenda
      // semanal la ubica en la columna correcta.
      day_of_week: repeatsWeekly ? dayOfWeek : dayOfWeekFromDate(specificDate),
      time_start: timeStart,
      time_end: timeEnd,
      max_capacity: maxCapacity,
      description: description || null,
      recurrence: repeatsWeekly ? "weekly" : "once",
      specific_date: repeatsWeekly ? null : specificDate,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/admin");
  };

  const emptyCatalogs =
    catalogs !== null &&
    (catalogs.teachers.length === 0 ||
      catalogs.rooms.length === 0 ||
      catalogs.classTypes.length === 0);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">Nueva clase</h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          Completá los datos para agregar una clase al calendario.
        </p>
      </div>

      {emptyCatalogs && (
        <p className="mb-4 max-w-[680px] rounded-[10px] bg-[#FDF3E3] px-3 py-2 text-[12.5px] text-[#8A6116]">
          Faltan datos en el catálogo. Cargá instructoras, salas y tipos de clase en{" "}
          <Link href="/admin/catalogo" className="font-semibold underline">
            Catálogo
          </Link>
          .
        </p>
      )}

      <div
        data-tour="new-class-form"
        className="max-w-[680px] rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-[22px]"
      >
        <div className="grid grid-cols-2 gap-[14px] mb-4 max-[860px]:grid-cols-1">
          <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
            <label className={labelCls}>Nombre de la clase</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${fieldCls} placeholder:text-ink-dim`}
              placeholder="Ej: Pilates Reformer Avanzado"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipo de clase</label>
            <select
              value={classTypeId}
              onChange={(e) => setClassTypeId(e.target.value)}
              className={fieldCls}
            >
              {catalogs?.classTypes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Instructora</label>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className={fieldCls}
            >
              {catalogs?.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Sala</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className={fieldCls}
            >
              {catalogs?.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {repeatsWeekly ? (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Día</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className={fieldCls}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Fecha</label>
              <input
                type="date"
                value={specificDate}
                onChange={(e) => setSpecificDate(e.target.value)}
                className={fieldCls}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Hora de inicio</label>
            <select
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              className={fieldCls}
            >
              {START_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Duración</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={10}
              max={180}
              step={5}
              className={fieldCls}
            />
            <p className="text-[11px] text-ink-dim">Minutos · termina {timeEnd}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Cupo máximo</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              min={1}
              max={30}
              className={fieldCls}
            />
          </div>

          <div className="col-span-2 max-[860px]:col-span-1">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px]">
              <input
                type="checkbox"
                checked={repeatsWeekly}
                onChange={(e) => setRepeatsWeekly(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
              />
              <span>
                <span className="block text-sm text-foreground">
                  Se repite todas las semanas
                </span>
                <span className="mt-0.5 block text-[11px] text-ink-dim">
                  {repeatsWeekly
                    ? "La clase queda fija en la grilla semanal."
                    : "Clase única: pasa una sola vez, en la fecha que elijas."}
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
            <label className={labelCls}>Descripción (opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${fieldCls} h-[70px] resize-none placeholder:text-ink-dim`}
              placeholder="Breve descripción de la clase para que los alumnos sepan qué esperar..."
            />
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
            {error}
          </p>
        )}

        <div className="flex gap-[9px]">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-white py-[11px] text-[13px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || emptyCatalogs}
            className="flex-[2] cursor-pointer rounded-[11px] border-none bg-primary py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313] disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear clase"}
          </button>
        </div>
      </div>
    </div>
  );
}
