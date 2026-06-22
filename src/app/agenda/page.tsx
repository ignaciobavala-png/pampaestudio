"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  class_templates: { name: string; time_start: string; teacher: string; room: string } | null;
};

const MNAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];

const statusLabels: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmada", cls: "text-primary bg-bordo-surface" },
  waitlist: { label: "Lista de espera", cls: "text-amber-text bg-amber-soft" },
  cancelled: { label: "Cancelada", cls: "text-muted-foreground bg-muted" },
};

export default function AgendaPage() {
  const { user, profile } = useAuthStore();
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userPack, setUserPack] = useState<{
    credits_remaining: number;
    packName: string;
    packPrice: number;
    packCredits: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { data: up } = await supabase
      .from("user_packs")
      .select("credits_remaining, packs(name, price, credits)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (up) {
      const p = up.packs as unknown as { name: string; price: number; credits: number };
      setUserPack({
        credits_remaining: up.credits_remaining,
        packName: p?.name || "",
        packPrice: p?.price || 0,
        packCredits: p?.credits || 0,
      });
    }

    const start = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`;
    const end = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-31`;

    const { data: b } = await supabase
      .from("bookings")
      .select("*, class_templates(name, time_start, teacher, room)")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: true });

    setBookings((b as Booking[]) || []);
    setLoading(false);
  }, [user, calYear, calMonth]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  if (!user) {
    return (
      <AppShell>
        <AgendaHeader calMonth={calMonth} calYear={calYear} setCalMonth={setCalMonth} setCalYear={setCalYear} />
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="font-serif italic text-[30px] text-[#DBDAD6]">○</div>
          <p className="mt-3 text-[13px] text-muted-foreground">
            Iniciá sesión para ver tu agenda.
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

  const firstDow = (new Date(calYear, calMonth, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  const isToday = (d: number) =>
    calYear === today.getFullYear() && calMonth === today.getMonth() && d === today.getDate();

  const bookingDates = new Map<string, string[]>();
  bookings.forEach((b) => {
    const day = b.date.slice(8, 10).replace(/^0/, "");
    const existing = bookingDates.get(day) || [];
    if (!existing.includes(b.status)) {
      existing.push(b.status);
    }
    bookingDates.set(day, existing);
  });

  const cells = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(<div key={`e${i}`} className="cday" />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dotd = isToday(d);
    const dayStr = String(d);
    const statuses = bookingDates.get(dayStr) || [];
    const hasConfirmed = statuses.includes("confirmed");
    const hasWL = statuses.includes("waitlist");

    cells.push(
      <div
        key={d}
        className={cn(
          "flex aspect-square flex-col items-center justify-center rounded-[11px] text-[13px] relative",
          dotd && "bg-foreground text-white font-semibold",
          !dotd && "text-muted-foreground"
        )}
      >
        {d}
        {(hasConfirmed || hasWL) && (
          <span
            className={cn(
              "absolute bottom-1 size-1 rounded-full",
              dotd ? "bg-secondary" : hasConfirmed ? "bg-primary" : "bg-[#C8960A]"
            )}
          />
        )}
      </div>
    );
  }

  return (
    <AppShell>
      <AgendaHeader
        calMonth={calMonth}
        calYear={calYear}
        setCalMonth={setCalMonth}
        setCalYear={setCalYear}
      />

      <div className="px-[22px] pb-[2px] pt-[6px]">
        <div className="grid grid-cols-7 gap-[2px] mb-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold tracking-[0.05em] uppercase text-ink-dim"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">{cells}</div>
      </div>

      <div className="mx-[22px] my-[10px] h-px bg-border" />

      {userPack && (
        <div className="mx-4 mb-2 rounded-[14px] border border-border bg-card px-4 py-[13px] flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Créditos disponibles</div>
            <div className="text-[11px] text-ink-dim mt-px">
              {userPack.packName} · ${(userPack.packPrice / 100).toLocaleString("es-AR")}
            </div>
          </div>
          <div className="font-serif text-[22px]">
            {userPack.credits_remaining}
            <span className="text-sm text-ink-dim font-sans">
              {" "}/ {userPack.packCredits}
            </span>
          </div>
        </div>
      )}

      <div className="px-[22px] py-[10px] pb-[6px]">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
          Próximas reservas
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-[22px] bg-muted"
              />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-[40px] text-center">
            <p className="text-[13px] text-muted-foreground">
              No tenés reservas este mes.
            </p>
          </div>
        ) : (
          bookings.map((b, i) => {
            const st = statusLabels[b.status] || {
              label: b.status,
              cls: "text-muted-foreground bg-muted",
            };
            const d = new Date(b.date + "T12:00:00");
            const dayNum = d.getDate();
            const monthName = MNAMES[d.getMonth()].slice(0, 3);
            const cls = b.class_templates;

            return (
              <div
                key={b.id || i}
                className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-[14px] transition-all hover:border-[rgba(26,25,31,.14)]"
              >
                <div className="w-11 shrink-0 text-center border-r border-border pr-3">
                  <div className="font-serif text-[21px] leading-none">
                    {dayNum}
                  </div>
                  <div className="mt-[2px] text-[10px] font-semibold tracking-[0.08em] uppercase text-ink-dim">
                    {monthName}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-serif text-base">
                    {cls?.name || "Clase"}
                  </div>
                  <div className="mt-[2px] text-xs text-muted-foreground">
                    {cls?.time_start?.slice(0, 5) || ""} · {cls?.teacher || ""} ·{" "}
                    {cls?.room || ""}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-[100px] px-[9px] py-1 text-[11px] font-semibold whitespace-nowrap",
                    st.cls
                  )}
                >
                  {st.label}
                  {b.status === "waitlist" && b.waitlist_position
                    ? ` #${b.waitlist_position}`
                    : ""}
                </span>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

function AgendaHeader({
  calMonth,
  calYear,
  setCalMonth,
  setCalYear,
}: {
  calMonth: number;
  calYear: number;
  setCalMonth: (m: number | ((m: number) => number)) => void;
  setCalYear: (y: number | ((y: number) => number)) => void;
}) {
  return (
    <>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <img
            src="/assets/logo-pilates.png"
            alt="Pampa Estudio"
            className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3"
          />
        </div>
        <Link
          href="/login"
          className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
        >
          Entrar
        </Link>
      </header>

      <div className="flex items-center justify-between px-[22px] pb-1 pt-[10px]">
        <h2 className="font-serif text-[22px] tracking-[-0.01em]">
          {MNAMES[calMonth]} {calYear}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() =>
              calMonth === 0
                ? (setCalMonth(11), setCalYear((y) => y - 1))
                : setCalMonth((m) => m - 1)
            }
            className="flex size-8 items-center justify-center rounded-[10px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]"
          >
            ‹
          </button>
          <button
            onClick={() =>
              calMonth === 11
                ? (setCalMonth(0), setCalYear((y) => y + 1))
                : setCalMonth((m) => m + 1)
            }
            className="flex size-8 items-center justify-center rounded-[10px] border border-[rgba(26,25,31,.14)] bg-card text-base cursor-pointer transition-all hover:bg-[#EFEEEC]"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
}
