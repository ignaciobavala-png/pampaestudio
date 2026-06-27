"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Database } from "@/types/database";

type ClassTemplate = Database["public"]["Tables"]["class_templates"]["Row"];

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const CDESC: Record<string, string> = {
  Yoga: "Práctica de respiración y movimiento fluido. Mat incluido.",
  Pilates: "Trabajo de core y postura. Apto para todos los niveles.",
};

function DetalleContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuthStore();

  const templateId = params.get("id") || "";
  const date = params.get("date") || "";

  const [template, setTemplate] = useState<ClassTemplate | null>(null);
  const [taken, setTaken] = useState(0);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId || !date) return;

    const supabase = createClient();

    (async () => {
      const { data: t } = await supabase
        .from("class_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      setTemplate(t);

      const { data: count } = await supabase.rpc("count_confirmed", {
        p_template_id: templateId,
        p_date: date,
      });
      setTaken((count as number) || 0);
      setLoading(false);
    })();
  }, [templateId, date]);

  if (loading || !template) {
    return (
      <AppShell>
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </AppShell>
    );
  }

  const max = template.max_capacity;
  const free = max - taken;
  const full = free <= 0;
  const time = template.time_start.slice(0, 5);
  const end = template.time_end.slice(0, 5);
  const dayN = params.get("dayN") || "";
  const dayName = params.get("dayName") || "";

  const handleReserve = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setBooking("loading");
    setBookingError(null);
    const supabase = createClient();

    const { data: result, error } = await supabase.rpc("book_spot", {
      p_template_id: templateId,
      p_date: date,
    });

    if (error) {
      setBooking("error");
      setBookingError(error.message);
      return;
    }

    const res = result as { status?: string; error?: string; position?: number; credits_remaining?: number };

    if (res.error) {
      setBooking("error");
      setBookingError(res.error);
      return;
    }

    await refreshProfile();
    setBooking("success");

    const monthNames = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
    const dateObj = new Date(date + "T12:00:00");
    const dayLabel = `${dayName} ${dayN} ${monthNames[dateObj.getMonth()]}`;

    const sp = new URLSearchParams({
      name: template?.name ?? "",
      time: `${time} – ${end}`,
      teacher: template?.teacher ?? "",
      room: template?.room ?? "",
      day: dayLabel,
      credits: String(res.credits_remaining ?? ""),
      wl: res.status === "waitlist" ? "true" : "false",
      pos: String(res.position ?? ""),
    });
    router.push(`/confirmacion?${sp.toString()}`);
  };

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
        <button
          onClick={() => router.back()}
          className="rounded-[100px] bg-bordo-surface px-[14px] py-[7px] text-[13px] font-semibold text-primary transition-colors hover:bg-[#e0dbf9]"
        >
          ← Volver
        </button>
      </header>

      <div className="px-6 pt-2 pb-6">
        <div className="mb-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-dim">
          {template.discipline} · {template.room}
        </div>
        <h1 className="font-serif text-[28px] leading-[1.08] tracking-[-0.02em] mb-3">
          {template.name}
        </h1>

        <div className="my-[14px] border-t border-border">
          {[
            ["Instructora", template.teacher],
            ["Día", `${dayName} ${dayN} ${MONTHS[new Date(date + "T12:00:00").getMonth()]}`],
            ["Horario", `${time} – ${end}`],
            ["Sala", template.room],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between border-b border-border py-3"
            >
              <span className="text-[13px] text-muted-foreground">{k}</span>
              <span className="text-sm font-medium">{v}</span>
            </div>
          ))}
        </div>

        <div className="my-[14px] flex items-center gap-[13px] rounded-[14px] bg-muted px-4 py-[14px]">
          <div className="font-serif text-[32px] leading-none">
            {taken}
            <span className="text-base text-ink-dim">/{max}</span>
          </div>
          <div className="text-[13px] text-muted-foreground leading-relaxed">
            {full ? (
              <>
                Clase completa.{" "}
                <b className="text-primary font-semibold">
                  Sumate a la lista de espera
                </b>{" "}
                y te avisamos al instante.
              </>
            ) : (
              <>
                <b className="text-primary font-semibold">
                  {free} lugar{free > 1 ? "es" : ""} disponible
                  {free > 1 ? "s" : ""}
                </b>
                <br />
                Reservá para asegurar el tuyo.
              </>
            )}
          </div>
        </div>

        <p className="mb-4 text-[13.5px] text-muted-foreground leading-relaxed">
          {CDESC[template.discipline] || ""}
        </p>

        {bookingError && (
          <p className="mb-3 rounded-[10px] bg-[#FDE8E8] px-3 py-2 text-[12px] text-[#C0392B]">
            {bookingError}
          </p>
        )}

        <Button
          className="h-auto w-full rounded-[14px] py-[15px] text-[15px] font-semibold"
          disabled={booking === "loading"}
          onClick={handleReserve}
        >
          {booking === "loading"
            ? "Procesando..."
            : full
              ? "Unirme a la lista de espera"
              : "Reservar mi lugar"}
        </Button>
      </div>
    </AppShell>
  );
}

export default function DetallePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-muted-foreground">Cargando...</div>
      }
    >
      <DetalleContent />
    </Suspense>
  );
}
