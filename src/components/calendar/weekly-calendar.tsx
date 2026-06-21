"use client";

import { useMemo, useState } from "react";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

export interface ClaseSemanal {
  id: string;
  nombre: string;
  tipo: string;
  instructora: string;
  hora: string;
  duracion: string;
  cupo: number;
  cupoMax: number;
  diasSemana: number[];
}

interface WeeklyCalendarProps {
  clases: ClaseSemanal[];
  filtroActivo: string | null;
  onFiltroChange: (tipo: string | null) => void;
  onSelectClase: (id: string) => void;
}

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function CupoBadge({ cupo, cupoMax }: { cupo: number; cupoMax: number }) {
  const lleno = cupo >= cupoMax;
  const casiLleno = cupo >= cupoMax * 0.8;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        lleno
          ? "bg-destructive/10 text-destructive"
          : casiLleno
            ? "bg-brand-naranja/10 text-brand-naranja"
            : "bg-accent/10 text-accent"
      )}
    >
      <Users className="size-3" />
      {cupo}/{cupoMax}
    </span>
  );
}

export function WeeklyCalendar({
  clases,
  filtroActivo,
  onFiltroChange,
  onSelectClase,
}: WeeklyCalendarProps) {
  const [fechaInicio, setFechaInicio] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const dias = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(fechaInicio, i)),
    [fechaInicio]
  );

  const hoy = new Date();

  const clasesFiltradas = filtroActivo
    ? clases.filter((c) => c.tipo === filtroActivo)
    : clases;

  const tipos = useMemo(
    () => [...new Set(clases.map((c) => c.tipo))],
    [clases]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setFechaInicio((f) => addDays(f, -7))
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Anterior
        </button>
        <span className="text-sm font-medium text-foreground">
          {format(fechaInicio, "d MMM", { locale: es })} —{" "}
          {format(addDays(fechaInicio, 6), "d MMM", { locale: es })}
        </span>
        <button
          onClick={() =>
            setFechaInicio((f) => addDays(f, 7))
          }
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Siguiente →
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => onFiltroChange(null)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
            !filtroActivo
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          )}
        >
          Todas
        </button>
        {tipos.map((tipo) => (
          <button
            key={tipo}
            onClick={() => onFiltroChange(tipo)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filtroActivo === tipo
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-secondary"
            )}
          >
            {tipo}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia) => (
          <div key={dia.toISOString()} className="space-y-1">
            <div
              className={cn(
                "flex flex-col items-center rounded-lg py-1.5 text-xs",
                isSameDay(dia, hoy) && "bg-primary/10"
              )}
            >
              <span className="text-muted-foreground">
                {DIAS_SEMANA[dia.getDay()]}
              </span>
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSameDay(dia, hoy)
                    ? "text-primary"
                    : "text-foreground"
                )}
              >
                {format(dia, "d")}
              </span>
            </div>

            <div className="space-y-1">
              {clasesFiltradas
                .filter((c) =>
                  c.diasSemana.includes(dia.getDay())
                )
                .map((clase) => (
                  <button
                    key={clase.id}
                    onClick={() => onSelectClase(clase.id)}
                    className="w-full rounded-lg border border-border bg-card p-1.5 text-left transition-colors hover:border-primary/50"
                  >
                    <p className="text-[11px] font-medium leading-tight text-foreground">
                      {clase.nombre}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {clase.hora}
                    </p>
                    <div className="mt-0.5">
                      <CupoBadge
                        cupo={clase.cupo}
                        cupoMax={clase.cupoMax}
                      />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
