"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Method = "mp" | "card" | "transfer";

export default function PagoPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<Method>("mp");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const methods = [
    { id: "mp" as const, icon: "💙", label: "Mercado Pago", sub: "Débito, crédito o saldo MP" },
    { id: "card" as const, icon: "💳", label: "Tarjeta de crédito", sub: "Visa, Mastercard, Amex" },
    { id: "transfer" as const, icon: "🏦", label: "Transferencia bancaria", sub: "Acreditación en 24hs" },
  ];

  const contactValid = name.trim().length >= 2 && email.includes("@") && phone.trim().length >= 8;

  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
            <img src="/assets/logo-pilates.png" alt="Pampa Estudio" className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3" />
        </div>
        <Link href="/login" className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]">Entrar</Link>
      </header>

      <FunnelSteps current={2} />

      <div className="px-6 pt-4 pb-2">
        <h1 className="font-serif text-2xl text-center tracking-[-0.01em]">Confirmá tu pack</h1>
        <p className="mt-1.5 mb-5 text-center text-[13px] text-muted-foreground leading-relaxed">
          {step === 1 && "Elegí cómo querés pagar."}
          {step === 2 && "Dejanos tus datos para identificarte."}
          {step === 3 && "Ya casi. Procedé con el pago."}
        </p>

        <div className="mb-[18px] flex items-center justify-between rounded-[14px] bg-muted px-4 py-[14px]">
          <div>
            <div className="text-sm font-semibold">Pack Fusión</div>
            <div className="mt-0.5 text-xs text-muted-foreground">Todas las disciplinas · 12 créditos mensuales</div>
          </div>
          <span className="font-serif text-[22px]">$62.000<span className="text-[13px] text-ink-dim font-sans"> / mes</span></span>
        </div>

        {/* Step 1: Método de pago */}
        {step === 1 && (
          <>
            <div className="flex flex-col gap-[9px] mb-4">
              {methods.map((m) => (
                <div key={m.id} onClick={() => setMethod(m.id)}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-[14px] transition-all",
                    method === m.id ? "border-primary bg-bordo-surface" : "border-[rgba(26,25,31,.14)] bg-card hover:border-primary hover:bg-bordo-surface"
                  )}>
                  <span className="w-8 shrink-0 text-center text-xl">{m.icon}</span>
                  <div>
                    <div className="text-[13.5px] font-medium">{m.label}</div>
                    <div className="text-[11px] text-muted-foreground">{m.sub}</div>
                  </div>
                  <div className={cn("ml-auto flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] transition-all",
                    method === m.id ? "border-primary bg-primary" : "border-[rgba(26,25,31,.14)]"
                  )}>
                    {method === m.id && <span className="size-[6px] rounded-full bg-white" />}
                  </div>
                </div>
              ))}
            </div>
            <Button className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold" onClick={() => setStep(2)}>
              Continuar
            </Button>
          </>
        )}

        {/* Step 2: Datos de contacto */}
        {step === 2 && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button onClick={() => setStep(1)} className="flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]">←</button>
              <div className="flex items-center gap-[9px] rounded-[14px] border border-primary bg-bordo-surface px-3 py-2">
                <span className="text-lg">{methods.find(m => m.id === method)?.icon}</span>
                <span className="text-[13px] font-medium">{methods.find(m => m.id === method)?.label}</span>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] rounded-[14px] border border-[rgba(26,25,31,.14)] px-4 py-[14px] mb-[14px]">
              <div>
                <label className="mb-1 block text-[11px] font-semibold tracking-[0.06em] uppercase text-ink-dim">Nombre completo</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="María Gómez" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold tracking-[0.06em] uppercase text-ink-dim">Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="maria@email.com" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold tracking-[0.06em] uppercase text-ink-dim">WhatsApp</label>
                <div className="flex items-center gap-[9px] rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-2 transition-colors focus-within:border-primary focus-within:bg-card">
                  <span className="text-[13px] text-ink-dim">+54 9</span>
                  <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))} className="flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-ink-dim" placeholder="11 1234 5678" />
                </div>
                <p className="mt-1 text-[11px] text-ink-dim">Te mandamos el recordatorio de cada clase por acá.</p>
              </div>
            </div>

            <p className="mb-[14px] text-center text-[11px] text-ink-dim leading-relaxed">
              Al continuar aceptás los <Link href="#" className="font-medium text-primary no-underline">términos de uso</Link>.
            </p>

            <Button className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold" disabled={!contactValid} onClick={() => setStep(3)}>
              Proceder al pago
            </Button>
          </>
        )}

        {/* Step 3: Pago */}
        {step === 3 && (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button onClick={() => setStep(2)} className="flex size-9 shrink-0 items-center justify-center rounded-[12px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]">←</button>
              <div className="rounded-[14px] border border-border bg-card px-3 py-2">
                <span className="text-xs font-medium">{name} · {email}</span>
              </div>
            </div>

            {method === "card" && (
              <div className="flex flex-col gap-[10px] rounded-[14px] border border-[rgba(26,25,31,.14)] px-4 py-[14px] mb-[14px]">
                <input className="rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="Número de tarjeta" />
                <div className="flex gap-[9px]">
                  <input className="flex-1 rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="MM/AA" />
                  <input className="flex-1 rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="CVV" />
                </div>
                <input className="rounded-[11px] border border-[rgba(26,25,31,.14)] bg-muted px-[13px] py-3 text-sm text-foreground outline-none transition-colors placeholder:text-ink-dim focus:border-primary focus:bg-card" placeholder="Nombre en la tarjeta" />
              </div>
            )}

            {method === "transfer" && (
              <div className="rounded-[14px] border border-[rgba(26,25,31,.14)] px-4 py-[14px] mb-[14px] space-y-2">
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Alias</span><span className="font-medium">pampa.estudio.cvu</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">CBU</span><span className="font-medium">0000 0000 0000 0000 0000 00</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Banco</span><span className="font-medium">Santander</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-muted-foreground">Titular</span><span className="font-medium">Pampa Estudio SAS</span></div>
                <p className="pt-1 text-[11px] text-ink-dim">La acreditación puede demorar hasta 24hs. Te avisamos por WhatsApp cuando impacte.</p>
              </div>
            )}

            {method === "mp" && (
              <div className="rounded-[14px] border border-[rgba(26,25,31,.14)] px-4 py-[14px] mb-[14px] flex flex-col items-center gap-3">
                <div className="flex size-14 items-center justify-center rounded-[18px] bg-bordo-surface text-[28px]">💙</div>
                <p className="text-center text-[13px] text-muted-foreground leading-relaxed">Serás redirigido a MercadoPago para completar el pago de forma segura.</p>
              </div>
            )}

            <Button className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold" onClick={() => router.push("/clases")}>
              {method === "mp" && "Pagar con MercadoPago"}
              {method === "card" && "Pagar $62.000"}
              {method === "transfer" && "Ya transferí"}
            </Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
