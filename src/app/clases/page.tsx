"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import {
  WeeklyCalendar,
  type ClaseSemanal,
} from "@/components/calendar/weekly-calendar";

const clasesMock: ClaseSemanal[] = [
  {
    id: "c1",
    nombre: "Vinyasa Flow",
    tipo: "Yoga",
    instructora: "Marina López",
    hora: "08:00",
    duracion: "60 min",
    cupo: 12,
    cupoMax: 20,
    diasSemana: [1, 3, 5],
  },
  {
    id: "c2",
    nombre: "Hatha Yoga",
    tipo: "Yoga",
    instructora: "Carla Méndez",
    hora: "10:00",
    duracion: "75 min",
    cupo: 18,
    cupoMax: 18,
    diasSemana: [2, 4],
  },
  {
    id: "c3",
    nombre: "Yin Yoga",
    tipo: "Yoga",
    instructora: "Marina López",
    hora: "18:30",
    duracion: "60 min",
    cupo: 8,
    cupoMax: 15,
    diasSemana: [1, 3],
  },
  {
    id: "c4",
    nombre: "Pilates Reformer",
    tipo: "Pilates",
    instructora: "Sofía Rivas",
    hora: "09:00",
    duracion: "50 min",
    cupo: 4,
    cupoMax: 8,
    diasSemana: [1, 2, 4, 5],
  },
  {
    id: "c5",
    nombre: "Pilates Mat",
    tipo: "Pilates",
    instructora: "Sofía Rivas",
    hora: "17:00",
    duracion: "50 min",
    cupo: 6,
    cupoMax: 12,
    diasSemana: [2, 4],
  },
  {
    id: "c6",
    nombre: "Meditación",
    tipo: "Meditación",
    instructora: "Carla Méndez",
    hora: "20:00",
    duracion: "45 min",
    cupo: 10,
    cupoMax: 25,
    diasSemana: [3, 5],
  },
];

export default function ClasesPage() {
  const router = useRouter();
  const [filtro, setFiltro] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-8">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Paso 3 de 4</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Elegí tus clases
          </h1>
        </div>

        <WeeklyCalendar
          clases={clasesMock}
          filtroActivo={filtro}
          onFiltroChange={setFiltro}
          onSelectClase={(id) => router.push(`/clases/${id}`)}
        />
      </div>
    </AppShell>
  );
}
