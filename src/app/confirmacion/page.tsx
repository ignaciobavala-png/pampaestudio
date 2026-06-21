"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CheckCircle2, CalendarPlus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ConfirmacionPage() {
  const router = useRouter();
  return (
    <AppShell>
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="size-8 text-accent" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Reserva confirmada
            </h1>
            <p className="text-sm text-muted-foreground">
              Tu lugar en <span className="font-medium text-foreground">Vinyasa Flow</span> está
              reservado. Te enviamos un recordatorio antes de la clase.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clase</span>
                <span className="font-medium text-foreground">Vinyasa Flow</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Día</span>
                <span className="font-medium text-foreground">Lunes 23 de junio</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horario</span>
                <span className="font-medium text-foreground">08:00 — 09:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Instructora</span>
                <span className="font-medium text-foreground">Marina López</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full">
              <CalendarPlus className="mr-2 size-4" />
              Agregar al calendario
            </Button>

            <Button className="w-full" onClick={() => router.push("/agenda")}>
              Ver mi agenda
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
