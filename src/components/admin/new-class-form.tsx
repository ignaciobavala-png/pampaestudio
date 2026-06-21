"use client";

import { useState } from "react";

interface NewClassFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const INSTRUCTORS = ["Valeria Martinez", "Sofia Rodriguez", "Camila Lopez"];
const ROOMS = ["Sala 1", "Sala 2", "Reformer"];
const REPEATS = [
  "Todos los dias",
  "Lunes y Miercoles",
  "Martes y Jueves",
  "Lunes, Miercoles y Viernes",
  "Solo hoy",
];

export function NewClassForm({ onSubmit, onCancel }: NewClassFormProps) {
  const [discipline, setDiscipline] = useState<"Yoga" | "Pilates">("Yoga");
  const [schedule, setSchedule] = useState<"Fijo" | "Flexible">("Fijo");

  return (
    <div className="max-w-[680px] rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white p-[22px]">
      <div className="grid grid-cols-2 gap-[14px] mb-4 max-[860px]:grid-cols-1">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Nombre de la clase
          </label>
          <input
            className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white"
            placeholder="Ej: Vinyasa Flow Avanzado"
          />
        </div>

        {/* Disciplina */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Disciplina
          </label>
          <div className="flex gap-1.5">
            {(["Yoga", "Pilates"] as const).map((d) => (
              <button
                key={d}
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

        {/* Horario */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Horario
          </label>
          <div className="flex gap-1.5">
            {(["Fijo", "Flexible"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSchedule(s)}
                className={`flex-1 cursor-pointer rounded-[10px] border py-2.5 text-[13px] text-center font-sans transition-all ${
                  schedule === s
                    ? "bg-bordo-surface border-primary/25 font-medium text-primary"
                    : "bg-white border-[rgba(26,25,31,.14)] text-ink-dim"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Instructora */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Instructora
          </label>
          <select className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white">
            {INSTRUCTORS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Sala */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Sala
          </label>
          <select className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white">
            {ROOMS.map((room) => (
              <option key={room}>{room}</option>
            ))}
          </select>
        </div>

        {/* Hora inicio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Hora de inicio
          </label>
          <input
            type="time"
            defaultValue="09:00"
            className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>

        {/* Hora fin */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Hora de fin
          </label>
          <input
            type="time"
            defaultValue="10:15"
            className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>

        {/* Cupo maximo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Cupo maximo
          </label>
          <input
            type="number"
            defaultValue={10}
            min={1}
            max={30}
            className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white"
          />
        </div>

        {/* Se repite */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Se repite
          </label>
          <select className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors focus:border-primary focus:bg-white">
            {REPEATS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Descripcion */}
        <div className="flex flex-col gap-1.5 col-span-2 max-[860px]:col-span-1">
          <label className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-dim">
            Descripcion (opcional)
          </label>
          <textarea
            className="h-[70px] w-full resize-none rounded-[11px] border border-[rgba(26,25,31,.14)] bg-[#F7F7F6] px-[13px] py-[11px] font-sans text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-white"
            placeholder="Breve descripcion de la clase para que los alumnos sepan que esperar..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-[9px]">
        <button
          onClick={onCancel}
          className="flex-1 cursor-pointer rounded-[11px] border border-[rgba(26,25,31,.14)] bg-white py-[11px] text-[13px] text-ink-dim transition-colors hover:text-foreground hover:bg-[#EFEFED]"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          className="flex-[2] cursor-pointer rounded-[11px] border-none bg-primary py-[11px] text-[13px] font-semibold text-white transition-colors hover:bg-[#3A0313]"
        >
          Crear clase
        </button>
      </div>
    </div>
  );
}
