"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const metodos = [
  {
    id: "mercadopago",
    label: "Mercado Pago",
    descripcion: "Tarjeta de crédito, débito o dinero en cuenta",
    icon: CreditCard,
  },
  {
    id: "tarjeta",
    label: "Tarjeta de crédito / débito",
    descripcion: "Visa, Mastercard, American Express",
    icon: CreditCard,
  },
  {
    id: "transferencia",
    label: "Transferencia bancaria",
    descripcion: "Te enviamos los datos por email",
    icon: Building2,
  },
];

const packActivo = {
  nombre: "8 clases",
  precio: 32000,
  creditos: 8,
};

export default function PagoPage() {
  const [metodo, setMetodo] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Método de pago
            </h1>
            <p className="text-sm text-muted-foreground">Paso 2 de 4</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {packActivo.nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                {packActivo.creditos} créditos
              </p>
            </div>
            <p className="text-lg font-bold text-primary">
              ${packActivo.precio.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {metodos.map(({ id, label, descripcion, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMetodo(id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border-2 bg-card p-4 text-left transition-all",
                metodo === id
                  ? "border-primary shadow-[0_0_0_1px_var(--primary)]"
                  : "border-border hover:border-secondary"
              )}
            >
              <span
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  metodo === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{descripcion}</p>
              </div>
            </button>
          ))}
        </div>

        <Button className="w-full" size="lg" disabled={!metodo}>
          Pagar ${packActivo.precio.toLocaleString("es-AR")}
        </Button>
      </div>
    </AppShell>
  );
}
