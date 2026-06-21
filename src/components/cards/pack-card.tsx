"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface PackData {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  creditos: number;
  tipo: string;
}

interface PackCardProps {
  pack: PackData;
  selected?: boolean;
  onSelect: (id: string) => void;
}

export function PackCard({ pack, selected, onSelect }: PackCardProps) {
  return (
    <button
      onClick={() => onSelect(pack.id)}
      className={cn(
        "relative w-full rounded-xl border-2 bg-card p-5 text-left transition-all",
        selected
          ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
          : "border-border hover:border-secondary"
      )}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary">
          <Check className="size-3.5 text-primary-foreground" />
        </span>
      )}

      <span className="inline-block rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
        {pack.tipo}
      </span>

      <h3 className="mt-3 text-lg font-semibold text-foreground">
        {pack.nombre}
      </h3>

      <p className="mt-1 text-sm text-muted-foreground">{pack.descripcion}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-primary">
          ${pack.precio.toLocaleString("es-AR")}
        </span>
        <span className="text-sm text-muted-foreground">ARS</span>
      </div>

      <p className="mt-1 text-sm font-medium text-accent">
        {pack.creditos} créditos
      </p>
    </button>
  );
}
