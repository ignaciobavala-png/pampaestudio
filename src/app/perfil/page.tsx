"use client";

import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

export default function PerfilPage() {
  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
            <img src="/assets/logo-pilates.png" alt="Pampa Estudio" className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3" />
        </div>
        <Link href="/login" className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]">Entrar</Link>
      </header>

      <div className="flex items-center gap-[14px] border-b border-border px-[22px] py-5">
        <div className="flex size-[54px] shrink-0 items-center justify-center rounded-full bg-bordo-surface font-serif text-xl text-primary">MG</div>
        <div>
          <div className="font-serif text-[22px] tracking-[-0.01em]">María Gómez</div>
          <div className="mt-[2px] text-[13px] text-muted-foreground">maria.gomez@email.com</div>
        </div>
      </div>

      <div className="flex flex-col gap-[6px] px-4 pt-[10px]">
        <div className="overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="border-b border-border px-4 py-[13px] text-xs font-semibold tracking-[0.09em] uppercase text-ink-dim">Pack activo</div>
          <div className="px-4 py-[13px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Pack Fusión</div>
                <div className="mt-px text-xs text-muted-foreground">$62.000 / mes</div>
              </div>
              <span className="font-serif text-xl">2 / 12</span>
            </div>
            <div className="mt-3 h-[3px] overflow-hidden rounded-[2px] bg-[#DBDAD6]">
              <div className="h-full rounded-[2px] bg-primary" style={{ width: "17%" }} />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="border-b border-border px-4 py-[13px] text-xs font-semibold tracking-[0.09em] uppercase text-ink-dim">Cuenta</div>
          {[
            { label: "Mis datos", href: "#" },
            { label: "Historial de clases", href: "#" },
            { label: "Métodos de pago", href: "#" },
          ].map((item, i, arr) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center justify-between px-4 py-[13px] transition-colors hover:bg-muted cursor-pointer ${i < arr.length - 1 ? "border-b border-border" : ""}`}>
              <span className="text-sm">{item.label}</span>
              <span className="text-ink-dim text-sm">›</span>
            </Link>
          ))}
        </div>
      </div>

      <button className="mx-4 mt-2 w-[calc(100%-32px)] cursor-pointer rounded-[12px] border border-[rgba(26,25,31,.14)] bg-transparent py-3 font-sans text-[13.5px] font-medium text-muted-foreground transition-all hover:text-foreground hover:border-ink-dim">
        Cerrar sesión
      </button>
    </AppShell>
  );
}
