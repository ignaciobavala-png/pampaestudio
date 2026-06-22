"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";

const INSTRUCTORS = ["Valeria Martínez", "Sofía Rodríguez", "Camila López"];
const ROOMS = ["Sala 1", "Sala 2", "Reformer"];

const DAY_OPTIONS = [
  { label: "Lunes", value: 0 },
  { label: "Martes", value: 1 },
  { label: "Miércoles", value: 2 },
  { label: "Jueves", value: 3 },
  { label: "Viernes", value: 4 },
  { label: "Sábado", value: 5 },
  { label: "Domingo", value: 6 },
];

export default function NuevaClasePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [discipline, setDiscipline] = useState<"Yoga" | "Pilates">("Yoga");
  const [name, setName] = useState("");
  const [teacher, setTeacher] = useState(INSTRUCTORS[0]);
  const [room, setRoom] = useState(ROOMS[0]);
  const [dayOfWeek, setDayOfWeek] = useState(0);
  const [timeStart, setTimeStart] = useState("09:00");
  const [timeEnd, setTimeEnd] = useState("10:15");
  const [maxCapacity, setMaxCapacity] = useState(10);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre de la clase es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error: insertError } = await supabase
      .from("class_templates")
      .insert({
        name: name.trim(),
        discipline,
        teacher,
        room,
        day_of_week: dayOfWeek,
        time_start: timeStart,
        time_end: timeEnd,
        max_capacity: maxCapacity,
        description: description || null,
        created_by: user?.id || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-serif text-[32px] tracking-[-0.02em]">
          Nueva clase
        </h1>
        <p className="mt-1 text-[13px] text-ink-dim">
          Completá los datos para agregar una clase al calendario.
        </p>
      </div>

      <div className="max-w-[680px] rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-[22px]">
        <div className="grid grid-cols-2 gap-[14px] mb-4 max-[860px]:grid-cols-1">
          <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Nombre de la clase
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white"
              placeholder="Ej: Vinyasa Flow Avanzado"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Disciplina
            </label>
            <div className="flex gap-1.5">
              {(["Yoga", "Pilates"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiscipline(d)}
                  className={`flex-1 cursor-pointer rounded-[10px] border py-2.5 text-[13px] text-center font-sans transition-all ${
                    discipline === d
                      ? "bg-bordo-surface border-primary/25 font-medium text-primary"
                      : "bg-white border-[rgba(26,25,31,.14)] text-ink-dim"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Día
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Instructora
            </label>
            <select
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            >
              {INSTRUCTORS.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Sala
            </label>
            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            >
              {ROOMS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Hora de inicio
            </label>
            <input
              type="time"
              value={timeStart}
              onChange={(e) => setTimeStart(e.target.value)}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Hora de fin
            </label>
            <input
              type="time"
              value={timeEnd}
              onChange={(e) => setTimeEnd(e.target.value)}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Cupo máximo
            </label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
              min={1}
              max={30}
              className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
            <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-[70px] w-full resize-none rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white"
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
            disabled={loading}
            className="flex-[2] cursor-pointer rounded-[11px] border-none bg-primary py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313] disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear clase"}
          </button>
        </div>
      </div>
    </div>
  );
}
