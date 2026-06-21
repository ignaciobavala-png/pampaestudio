"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PackCard, type Pack } from "@/components/cards/pack-card";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const packs: Pack[] = [
  {
    id: "esencia",
    eyebrow: "Yoga",
    name: "Esencia",
    description: "4 clases al mes, a tu ritmo.",
    price: "$28.000",
    per: "/ mes",
    credits: 4,
    features: [
      "Yoga Hatha y Vinyasa",
      "4 créditos mensuales",
      "Cancelá hasta 8hs antes",
    ],
  },
  {
    id: "studio",
    eyebrow: "Pilates",
    name: "Studio",
    description: "8 clases de Mat. Reformer disponible.",
    price: "$42.000",
    per: "/ mes",
    credits: 8,
    features: [
      "Pilates Mat y Reformer",
      "8 créditos mensuales",
      "Cambio de horario sin cargo",
    ],
  },
  {
    id: "fusion",
    eyebrow: "★ Más elegido",
    name: "Fusión",
    description: "12 clases combinables + talleres.",
    price: "$62.000",
    per: "/ mes",
    credits: 12,
    featured: true,
    features: [
      "Todas las disciplinas",
      "12 créditos mensuales",
      "2 talleres incluidos por mes",
      "7am–9pm · 6 días",
    ],
  },
  {
    id: "libre",
    eyebrow: "Flexible",
    name: "Libre",
    description: "Clases sueltas, sin vencimiento.",
    price: "$9.500",
    per: "/ clase",
    credits: 1,
    features: [
      "Cualquier disciplina",
      "Sin vencimiento",
      "Comprá de a una o en paquete",
    ],
  },
];

export default function HomePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Pack | null>(null);

  const handleSelect = (pack: Pack) => {
    setSelected((prev) => (prev?.id === pack.id ? null : pack));
  };

  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <img src="/assets/logo-pilates.png" alt="Pampa Estudio" className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3" />
        </div>
        <Link
          href="/login"
          className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
        >
          Entrar
        </Link>
      </header>

      <FunnelSteps current={1} />

      <div className="flex items-baseline justify-between px-[22px] pb-1 pt-[10px]">
        <h2 className="font-serif text-[27px] tracking-[-0.015em]">
          Elegí tu pack
        </h2>
        <span className="text-xs text-muted-foreground">Sin permanencia</span>
      </div>

      {selected && (
        <div className="mx-4 mb-1 mt-2 flex items-center justify-between rounded-[14px] border border-border bg-muted px-[14px] py-3">
          <div className="flex items-center gap-[9px]">
            <div className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-primary text-xs text-white">
              ✓
            </div>
            <div>
              <div className="text-[13px] font-semibold">
                Pack {selected.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {selected.price} {selected.per}
              </div>
            </div>
          </div>
          <button
            className="text-xs font-medium text-primary"
            onClick={() => setSelected(null)}
          >
            Cambiar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-[9px] px-4 pb-1 pt-[6px]">
        {packs.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            selected={selected?.id === pack.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selected && (
        <div className="px-4 pb-4 pt-2">
          <Button
            className="h-auto w-full rounded-[14px] py-[14px] text-[14.5px] font-bold"
            onClick={() => router.push("/pago")}
          >
            Continuar al pago →
          </Button>
        </div>
      )}
    </AppShell>
  );
}
