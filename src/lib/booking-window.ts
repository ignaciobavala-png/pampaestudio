/**
 * Ventana de cancelación: espejo de la regla que aplica `cancel_booking` en la
 * base. Si la clase confirmada empieza en menos de 2 horas, cancelar no
 * devuelve el crédito.
 */
export const CANCEL_WINDOW_MS = 2 * 60 * 60 * 1000;

/** Instante de inicio de la clase, en hora local del navegador. */
export function classStartMs(date: string, timeStart: string | null | undefined): number {
  return new Date(`${date}T${timeStart ?? "00:00:00"}`).getTime();
}

export function isWithinCancelWindow(startMs: number, nowMs: number): boolean {
  return startMs - nowMs <= CANCEL_WINDOW_MS;
}

/** La clase ya empezó su ventana de 2h pero todavía no arrancó. */
export function startsSoon(startMs: number, nowMs: number): boolean {
  return isWithinCancelWindow(startMs, nowMs) && startMs > nowMs;
}

/**
 * Lectura del reloj para decisiones puntuales (el click de cancelar), donde sí
 * hace falta la hora exacta y no el valor redondeado de `useNow`.
 */
export function readNow(): number {
  return Date.now();
}
