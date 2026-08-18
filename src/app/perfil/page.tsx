"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

export default function PerfilPage() {
  const { user, profile, loading } = useAuthStore();
  const [userPack, setUserPack] = useState<{
    id: string;
    credits_remaining: number;
    packName: string;
    packPrice: number;
    packCredits: number;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("user_packs")
        .select("id, credits_remaining, packs(name, price, credits)")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (cancelled || !data) return;

      const p = data.packs as unknown as {
        name: string;
        price: number;
        credits: number;
      };
      setUserPack({
        id: data.id,
        credits_remaining: data.credits_remaining,
        packName: p?.name || "",
        packPrice: p?.price || 0,
        packCredits: p?.credits || 0,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="font-serif italic text-[30px] text-[#DBDAD6]">○</div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Iniciá sesión para ver tu perfil.
          </p>
          <Link
            href="/login"
            className="mt-3 rounded-[12px] bg-primary px-5 py-[10px] text-[13px] font-semibold text-white"
          >
            Entrar
          </Link>
        </div>
      </AppShell>
    );
  }

  const initials = (profile?.full_name || user.email || "U")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <img
            src="/assets/logo-pilates.png"
            alt="Pampa Estudio"
            className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3"
          />
        </div>
      </header>

      <div className="flex items-center gap-[14px] border-b border-border px-[22px] py-5">
        <div className="flex size-[54px] shrink-0 items-center justify-center rounded-full bg-bordo-surface font-serif text-xl text-primary">
          {initials}
        </div>
        <div>
          <div className="font-serif text-[22px] tracking-[-0.01em]">
            {profile?.full_name || user.email?.split("@")[0]}
          </div>
          <div className="mt-[2px] text-[13px] text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-[6px] px-4 pt-[10px]">
        {userPack && (
          <div className="overflow-hidden rounded-[22px] border border-border bg-card">
            <div className="border-b border-border px-4 py-[13px] text-xs font-semibold tracking-[0.09em] uppercase text-ink-dim">
              Pack activo
            </div>
            <div className="px-4 py-[13px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {userPack.packName}
                  </div>
                  <div className="mt-px text-xs text-muted-foreground">
                    ${(userPack.packPrice / 100).toLocaleString("es-AR")} / mes
                  </div>
                </div>
                <span className="font-serif text-xl">
                  {userPack.credits_remaining} / {userPack.packCredits}
                </span>
              </div>
              <div className="mt-3 h-[3px] overflow-hidden rounded-[2px] bg-[#DBDAD6]">
                <div
                  className="h-full rounded-[2px] bg-primary"
                  style={{
                    width: `${Math.round(
                      (userPack.credits_remaining / userPack.packCredits) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="border-b border-border px-4 py-[13px] text-xs font-semibold tracking-[0.09em] uppercase text-ink-dim">
            Cuenta
          </div>
          {[
            ...(profile?.role === "admin"
              ? [{ label: "Panel admin", href: "/admin" }]
              : [{ label: "Mis datos", href: null }]),
            { label: "Historial de clases", href: null },
            { label: "Métodos de pago", href: null },
          ].map((item, i, arr) => {
            const rowClass = `flex items-center justify-between px-4 py-[13px] ${
              i < arr.length - 1 ? "border-b border-border" : ""
            }`;

            if (!item.href) {
              return (
                <div key={item.label} className={rowClass}>
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-ink-dim">
                    Pronto
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${rowClass} transition-colors hover:bg-muted`}
              >
                <span className="text-sm">{item.label}</span>
                <span aria-hidden="true" className="text-ink-dim text-sm">
                  ›
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <a
        href="/api/auth/signout"
        className="mx-4 mt-2 flex w-[calc(100%-32px)] cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-[rgba(26,25,31,.14)] bg-transparent py-3 text-center font-sans text-[13.5px] font-medium text-muted-foreground transition-all hover:text-foreground hover:border-ink-dim"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-[17px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <path d="m10 17 5-5-5-5M15 12H3" />
        </svg>
        Cerrar sesión
      </a>
    </AppShell>
  );
}
