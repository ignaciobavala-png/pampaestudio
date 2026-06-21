"use client";

import { useState, use } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  User,
  Users,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const clasesData: Record<string, {
  id: string;
  nombre: string;
  tipo: string;
  instructora: string;
  hora: string;
  duracion: string;
  cupo: number;
  cupoMax: number;
  sala: string;
  descripcion: string;
}> = {
  c1: {
    id: "c1",
    nombre: "Vinyasa Flow",
    tipo: "Yoga",
    instructora: "Marina López",
    hora: "08:00",
    duracion: "60 min",
    cupo: 12,
    cupoMax: 20,
    sala: "Sala Luna",
    descripcion:
      "Secuencia dinámica que conecta movimiento y respiración. Ideal para liberar tensión y ganar flexibilidad.",
  },
  c2: {
    id: "c2",
    nombre: "Hatha Yoga",
    tipo: "Yoga",
    instructora: "Carla Méndez",
    hora: "10:00",
    duracion: "75 min",
    cupo: 18,
    cupoMax: 18,
    sala: "Sala Tierra",
    descripcion:
      "Práctica pausada con énfasis en la alineación. Perfecta para principiantes y quienes buscan profundizar cada postura.",
  },
  c3: {
    id: "c3",
    nombre: "Yin Yoga",
    tipo: "Yoga",
    instructora: "Marina López",
    hora: "18:30",
    duracion: "60 min",
    cupo: 8,
    cupoMax: 15,
    sala: "Sala Luna",
    descripcion:
      "Posturas pasivas mantenidas en el tiempo para trabajar el tejido conectivo. Relajación profunda.",
  },
  c4: {
    id: "c4",
    nombre: "Pilates Reformer",
    tipo: "Pilates",
    instructora: "Sofía Rivas",
    hora: "09:00",
    duracion: "50 min",
    cupo: 4,
    cupoMax: 8,
    sala: "Sala Fuego",
    descripcion:
      "Entrenamiento en máquina Reformer. Fortalecimiento del core, mejora postural y tonificación completa.",
  },
};

export default function ClaseDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const [reservando, setReservando] = useState(false);

  const clase = clasesData[id];

  if (!clase) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
          <AlertTriangle className="size-12 text-muted-foreground" />
          <p className="text-muted-foreground">Clase no encontrada</p>
          <Button variant="outline" onClick={() => router.push("/clases")}>
            Volver a clases
          </Button>
        </div>
      </AppShell>
    );
  }

  const lleno = clase.cupo >= clase.cupoMax;
  const casiLleno = clase.cupo >= clase.cupoMax * 0.8;

  const handleReservar = () => {
    setReservando(true);
    setTimeout(() => {
      router.push("/confirmacion");
    }, 800);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-8">
        <Link
          href="/clases"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Link>

        <div className="space-y-1">
          <span className="inline-block rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
            {clase.tipo}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {clase.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">{clase.descripcion}</p>
        </div>

        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="size-4 text-muted-foreground" />
            <span className="text-foreground">{clase.instructora}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-foreground">
              {clase.hora} · {clase.duracion}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="size-4 text-muted-foreground" />
            <span className="text-foreground">{clase.sala}</span>
          </div>
        </div>

        <div
          className={cn(
            "rounded-xl border p-4",
            lleno
              ? "border-destructive/30 bg-destructive/5"
              : casiLleno
                ? "border-brand-naranja/30 bg-brand-naranja/5"
                : "border-accent/30 bg-accent/5"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users
                className={cn(
                  "size-5",
                  lleno
                    ? "text-destructive"
                    : casiLleno
                      ? "text-brand-naranja"
                      : "text-accent"
                )}
              />
              <span className="text-sm font-medium text-foreground">Cupo</span>
            </div>
            <span
              className={cn(
                "text-lg font-bold",
                lleno
                  ? "text-destructive"
                  : casiLleno
                    ? "text-brand-naranja"
                    : "text-accent"
              )}
            >
              {clase.cupo}/{clase.cupoMax}
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                lleno
                  ? "bg-destructive"
                  : casiLleno
                    ? "bg-brand-naranja"
                    : "bg-accent"
              )}
              style={{
                width: `${Math.min(
                  (clase.cupo / clase.cupoMax) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {lleno ? (
          <Button
            className="w-full"
            size="lg"
            variant="destructive"
            onClick={handleReservar}
          >
            Ingresar a lista de espera
          </Button>
        ) : (
          <Button
            className="w-full"
            size="lg"
            onClick={handleReservar}
            disabled={reservando}
          >
            {reservando ? "Reservando..." : "Reservar lugar"}
          </Button>
        )}
      </div>
    </AppShell>
  );
}
