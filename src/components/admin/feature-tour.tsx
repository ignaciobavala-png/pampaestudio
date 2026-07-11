"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type TourStep = {
  route: string;
  /** data-tour attribute value to spotlight. null = centered card (no anchor). */
  target: string | null;
  badge?: string;
  title: string;
  body: string;
  /** small note shown for features that are demo/placeholder */
  soon?: boolean;
};

const STEPS: TourStep[] = [
  {
    route: "/admin",
    target: null,
    badge: "Pampa Estudio",
    title: "Bienvenida al panel",
    body: "Te muestro en 30 segundos todo lo que el panel puede hacer. Podés avanzar con los botones o cerrar cuando quieras.",
  },
  {
    route: "/admin",
    target: "kpis",
    badge: "En vivo",
    title: "Métricas del día",
    body: "Clases de hoy, ocupación general y alumnas en lista de espera — se actualizan solas a medida que reservan.",
  },
  {
    route: "/admin",
    target: "day-tabs",
    title: "Navegá por día",
    body: "Cambiá entre los días de la semana para ver qué clases hay y cómo viene el cupo de cada una.",
  },
  {
    route: "/admin",
    target: "class-list",
    badge: "Tocá una clase",
    title: "Detalle y cupo en vivo",
    body: "Al abrir una clase ves las alumnas anotadas, la lista de espera, podés editar el cupo y cancelar la clase (devuelve créditos automáticamente).",
  },
  {
    route: "/admin/semana",
    target: "week",
    title: "Vista semanal",
    body: "El calendario completo de la semana con todas las clases y su ocupación. Navegá entre semanas con las flechas.",
  },
  {
    route: "/admin/clientes",
    target: "clientes-search",
    title: "Tus alumnas",
    body: "Buscá por nombre, email o pack, y exportá el listado completo a Excel/CSV con un clic.",
  },
  {
    route: "/admin/clientes",
    target: "client-grid",
    badge: "Abrí una alumna",
    title: "Aprobar y asignar packs",
    body: "Desde la ficha de cada alumna la aprobás, le asignás o cambiás el pack de créditos, y ves su historial.",
  },
  {
    route: "/admin/nueva-clase",
    target: "new-class-form",
    title: "Crear una clase",
    body: "Sumá una clase al calendario: disciplina, instructora, sala, horario y cupo. Aparece al instante en la agenda.",
  },
  {
    route: "/admin",
    target: null,
    badge: "Listo",
    title: "Eso es todo por ahora",
    body: "También están en camino: recordatorios automáticos, control de asistencia, duplicar clases y pagos con Mercado Pago. ¿Empezamos?",
  },
];

const SEEN_KEY = "pampa_tour_seen_v1";

type Rect = { top: number; left: number; width: number; height: number };

export function FeatureTour() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);

  const step = STEPS[index];

  // Auto-launch on first visit to the admin (deferred to avoid a sync cascade)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(SEEN_KEY)) return;
    const id = requestAnimationFrame(() => setActive(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const finish = useCallback(() => {
    setActive(false);
    setRect(null);
    if (typeof window !== "undefined") localStorage.setItem(SEEN_KEY, "1");
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
    if (pathname !== STEPS[0].route) router.push(STEPS[0].route);
  }, [pathname, router]);

  const go = useCallback(
    (next: number) => {
      if (next < 0 || next >= STEPS.length) {
        finish();
        return;
      }
      setRect(null);
      setIndex(next);
      if (STEPS[next].route !== pathname) {
        router.push(STEPS[next].route);
      }
    },
    [finish, pathname, router]
  );

  // Measure / poll for the target element once we're on the right route
  useEffect(() => {
    if (!active) return;
    if (step.route !== pathname) return; // wait until navigation lands

    // Centered steps have no anchor; go()/initial state already cleared rect.
    if (step.target === null) return;

    let attempts = 0;
    let cancelled = false;

    const measure = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${step.target}"]`
      );
      if (el) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
        // let the scroll settle before measuring
        rafRef.current = requestAnimationFrame(() => {
          if (cancelled) return;
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
        });
        return;
      }
      attempts += 1;
      if (attempts < 40) {
        rafRef.current = requestAnimationFrame(measure) as unknown as number;
        // slow the poll a touch
        setTimeout(measure, 75);
      } else {
        setRect(null); // give up → fall back to centered card
      }
    };

    measure();

    const onMove = () => {
      const el = document.querySelector<HTMLElement>(
        `[data-tour="${step.target}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [active, step, pathname, index]);

  // Escape to close
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish, go, index]);

  // Relaunch button when tour is closed
  if (!active) {
    return (
      <button
        onClick={start}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-[rgba(26,25,31,.14)] bg-white px-4 py-2.5 text-[13px] font-medium text-foreground shadow-[0_6px_24px_rgba(26,25,31,.14)] transition-transform hover:scale-105 max-[860px]:bottom-[86px]"
      >
        <span aria-hidden>✨</span> Ver funcionalidades
      </button>
    );
  }

  const pad = 8;
  const centered = rect === null;

  // Card placement
  let cardStyle: React.CSSProperties;
  if (centered) {
    cardStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
  } else {
    const cardW = Math.min(340, (typeof window !== "undefined" ? window.innerWidth : 360) - 24);
    const spaceBelow =
      (typeof window !== "undefined" ? window.innerHeight : 800) - (rect.top + rect.height);
    const placeBelow = spaceBelow > 220;
    const left = Math.max(
      12,
      Math.min(
        rect.left,
        (typeof window !== "undefined" ? window.innerWidth : 360) - cardW - 12
      )
    );
    cardStyle = placeBelow
      ? { top: rect.top + rect.height + pad + 8, left, width: cardW }
      : { top: rect.top - pad - 8, left, width: cardW, transform: "translateY(-100%)" };
  }

  return (
    <div className="fixed inset-0 z-[300]">
      {/* click catcher */}
      <div className="absolute inset-0" onClick={finish} />

      {/* spotlight or full backdrop */}
      {centered ? (
        <div className="absolute inset-0 bg-[rgba(20,18,24,.62)]" />
      ) : (
        <div
          className="pointer-events-none absolute rounded-[14px] transition-all duration-300 ease-out"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow:
              "0 0 0 9999px rgba(20,18,24,.62), inset 0 0 0 2px rgba(255,255,255,.9)",
          }}
        />
      )}

      {/* card */}
      <div
        className="fixed w-[340px] max-w-[calc(100vw-24px)] rounded-[18px] bg-white p-5 shadow-[0_24px_70px_rgba(20,18,24,.35)]"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {step.badge && (
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-bordo-surface px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary">
            {step.badge}
          </span>
        )}
        <h3 className="font-serif text-[22px] leading-tight tracking-[-0.02em]">
          {step.title}
        </h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{step.body}</p>

        {/* progress dots */}
        <div className="mt-4 flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={
                i === index
                  ? "h-1.5 w-5 rounded-full bg-primary transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-[#DEDDDA] transition-all"
              }
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="cursor-pointer bg-transparent text-[12.5px] text-ink-dim transition-colors hover:text-foreground"
          >
            Saltar
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                onClick={() => go(index - 1)}
                className="cursor-pointer rounded-[10px] border border-[rgba(26,25,31,.14)] bg-white px-3.5 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:bg-[#EFEFED]"
              >
                Anterior
              </button>
            )}
            <button
              onClick={() => go(index + 1)}
              className="cursor-pointer rounded-[10px] border-none bg-primary px-4 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-bordo-hover"
            >
              {index === STEPS.length - 1 ? "Empezar" : "Siguiente"}
            </button>
          </div>
        </div>

        <div className="mt-2 text-right text-[11px] text-ink-dim">
          {index + 1} / {STEPS.length}
        </div>
      </div>
    </div>
  );
}
