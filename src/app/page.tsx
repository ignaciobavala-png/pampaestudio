"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PackCard, type Pack } from "@/components/cards/pack-card";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";
import type { Database } from "@/types/database";

type PackRow = Database["public"]["Tables"]["packs"]["Row"];

function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString("es-AR")}`;
}

function mapPack(row: PackRow): Pack {
  return {
    id: row.id,
    eyebrow: row.eyebrow,
    name: row.name,
    description: row.description,
    price: formatPrice(row.price),
    per: row.period === "monthly" ? "/ mes" : "/ clase",
    credits: row.credits,
    featured: row.is_featured,
    features: Array.isArray(row.features)
      ? row.features.map(String)
      : [],
  };
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Pack | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("packs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (data) setPacks(data.map(mapPack));
        setLoading(false);
      });
  }, []);

  const handleSelect = (pack: Pack) => {
    setSelected((prev) => (prev?.id === pack.id ? null : pack));
  };

  if (user && packs.length === 0) return null;

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
        {user ? (
          <Link
            href="/perfil"
            className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
          >
            Perfil
          </Link>
        ) : (
          <Link
            href="/login"
            className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
          >
            Entrar
          </Link>
        )}
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

      {loading ? (
        <div className="flex flex-col gap-[9px] px-4 pb-1 pt-[6px]">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse rounded-[22px] bg-muted"
            />
          ))}
        </div>
      ) : (
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
      )}

      {selected && (
        <div className="px-4 pb-4 pt-2">
          <Button
            className="h-auto w-full rounded-[14px] py-[14px] text-[14.5px] font-bold"
            onClick={() => {
              if (!user) {
                router.push("/login");
              } else {
                router.push("/pago");
              }
            }}
          >
            {user ? "Continuar al pago →" : "Entrar para continuar →"}
          </Button>
        </div>
      )}
    </AppShell>
  );
}
