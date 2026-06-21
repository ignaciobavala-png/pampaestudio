"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PackCard, type PackData } from "@/components/cards/pack-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const packs: PackData[] = [
  {
    id: "pack-4",
    nombre: "4 clases",
    descripcion: "Ideal para probar distintas disciplinas durante el mes.",
    precio: 18000,
    creditos: 4,
    tipo: "Mensual",
  },
  {
    id: "pack-8",
    nombre: "8 clases",
    descripcion: "Dos veces por semana. La opción más elegida.",
    precio: 32000,
    creditos: 8,
    tipo: "Mensual",
  },
  {
    id: "pack-12",
    nombre: "12 clases",
    descripcion: "Tres veces por semana. Compromiso total con tu práctica.",
    precio: 42000,
    creditos: 12,
    tipo: "Mensual",
  },
  {
    id: "pack-suelta",
    nombre: "Clase suelta",
    descripcion: "Una clase individual. Sin compromiso mensual.",
    precio: 5500,
    creditos: 1,
    tipo: "Por clase",
  },
];

export default function Home() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Elegí tu pack
          </h1>
          <p className="text-sm text-muted-foreground">
            Seleccioná el plan que mejor se adapte a vos.
          </p>
        </div>

        <div className="space-y-3">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              pack={pack}
              selected={selected === pack.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        <Button
          className="w-full"
          size="lg"
          disabled={!selected}
        >
          Continuar
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
    </AppShell>
  );
}
