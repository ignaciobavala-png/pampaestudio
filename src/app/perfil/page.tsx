"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { User, Mail, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function PerfilPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-lg space-y-6 px-4 pb-8 pt-12">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Mi perfil
          </h1>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary">
            <User className="size-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">María García</p>
            <p className="text-xs text-muted-foreground">maria@email.com</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Pack activo</h2>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">8 clases</p>
              <p className="text-xs text-muted-foreground">Mensual</p>
            </div>
            <span className="text-lg font-bold text-primary">6 créditos</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: "75%" }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">
            6 de 8 créditos usados
          </p>
        </div>

        <div className="space-y-0.5">
          <Link
            href="/perfil/datos"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              <User className="size-4 text-muted-foreground" />
              Datos personales
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          <Link
            href="/perfil/historial"
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              <Mail className="size-4 text-muted-foreground" />
              Historial de clases
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </div>

        <Button variant="ghost" className="w-full text-muted-foreground">
          <LogOut className="mr-2 size-4" />
          Cerrar sesión
        </Button>
      </div>
    </AppShell>
  );
}
