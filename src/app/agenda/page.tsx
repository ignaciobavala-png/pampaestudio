"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ReservaMes {
  fecha: Date;
  clase: string;
  hora: string;
  estado: "confirmada" | "cancelada" | "asistio" | "ausente";
}

const reservasMock: ReservaMes[] = [
  {
    fecha: new Date(2026, 5, 23),
    clase: "Vinyasa Flow",
    hora: "08:00",
    estado: "confirmada",
  },
  {
    fecha: new Date(2026, 5, 25),
    clase: "Hatha Yoga",
    hora: "10:00",
    estado: "confirmada",
  },
  {
    fecha: new Date(2026, 5, 20),
    clase: "Yin Yoga",
    hora: "18:30",
    estado: "asistio",
  },
  {
    fecha: new Date(2026, 5, 18),
    clase: "Pilates Reformer",
    hora: "09:00",
    estado: "cancelada",
  },
];

const estadoClases: Record<string, string> = {
  confirmada: "bg-accent text-accent-foreground",
  cancelada: "bg-destructive/10 text-destructive line-through",
  asistio: "bg-secondary text-secondary-foreground",
  ausente: "bg-destructive/10 text-destructive",
};

export default function AgendaPage() {
  const [mesActual, setMesActual] = useState(new Date());
  const creditos = 6; // mock

  const inicioMes = startOfMonth(mesActual);
  const finMes = endOfMonth(mesActual);
  const inicioCal = startOfWeek(inicioMes, { weekStartsOn: 1 });
  const finCal = endOfWeek(finMes, { weekStartsOn: 1 });

  const dias: Date[] = [];
  let dia = inicioCal;
  while (dia <= finCal) {
    dias.push(dia);
    dia = addDays(dia, 1);
  }

  const reservasDelDia = (fecha: Date) =>
    reservasMock.filter((r) => isSameDay(r.fecha, fecha));

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Mi agenda
            </h1>
            <p className="text-sm text-accent font-medium">
              {creditos} créditos disponibles
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setMesActual((m) => subMonths(m, 1))}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-sm font-semibold text-foreground">
            {format(mesActual, "MMMM yyyy", { locale: es })}
          </span>
          <button
            onClick={() => setMesActual((m) => addMonths(m, 1))}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div>
          <div className="grid grid-cols-7 text-center">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
              <span
                key={d}
                className="py-1 text-[10px] font-medium text-muted-foreground"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {dias.map((dia) => {
              const reservas = reservasDelDia(dia);
              const fueraDeMes = !isSameMonth(dia, mesActual);

              return (
                <div
                  key={dia.toISOString()}
                  className={cn(
                    "flex flex-col items-center rounded-lg py-1",
                    fueraDeMes && "opacity-30"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-xs",
                      isToday(dia) && "bg-primary text-primary-foreground font-semibold",
                      !isToday(dia) && "text-foreground"
                    )}
                  >
                    {format(dia, "d")}
                  </span>

                  <div className="mt-0.5 flex gap-0.5">
                    {reservas.slice(0, 2).map((r, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-1.5 rounded-full",
                          estadoClases[r.estado].split(" ")[0]
                        )}
                      />
                    ))}
                    {reservas.length > 2 && (
                      <span className="text-[8px] text-muted-foreground">
                        +{reservas.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Próximas reservas
          </h2>
          {reservasMock
            .filter((r) => r.estado === "confirmada")
            .map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {r.clase}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(r.fecha, "EEEE d MMM", { locale: es })} · {r.hora}
                  </p>
                </div>
                <button className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-destructive">
                  <X className="size-4" />
                </button>
              </div>
            ))}
        </div>
      </div>
    </AppShell>
  );
}
