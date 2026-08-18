"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Database } from "@/types/database";
import { cn } from "@/lib/utils";

type Notif = Database["public"]["Tables"]["notifications"]["Row"];

const TYPE_ICON: Record<string, string> = {
  waitlist_spot: "🎟️",
  pack_expiring: "⏳",
  low_credits: "⚠️",
  class_cancelled: "❌",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

export function NotificationBell() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read_at).length;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!cancelled) setItems((data as Notif[]) || []);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter((n) => !n.read_at).map((n) => n.id);
      setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })));
      const supabase = createClient();
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    }
  };

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        aria-label="Notificaciones"
        className="relative flex size-9 items-center justify-center rounded-[100px] bg-bordo-surface text-primary transition-colors hover:bg-[#e0dbf9]"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] h-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-100 w-[300px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[16px] border border-border bg-card shadow-[0_20px_60px_rgba(26,25,31,.2)]">
          <div className="border-b border-border px-4 py-3 text-[13px] font-semibold">
            Notificaciones
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                No tenés notificaciones.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-2.5 border-b border-border px-4 py-3 last:border-0",
                    !n.read_at && "bg-bordo-surface/40"
                  )}
                >
                  <span className="text-[15px] leading-none pt-0.5">{TYPE_ICON[n.type] || "🔔"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold">{n.title}</div>
                    {n.body && <div className="mt-0.5 text-[12px] text-muted-foreground leading-snug">{n.body}</div>}
                    <div className="mt-1 text-[10px] text-ink-dim">{timeAgo(n.created_at)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
