/**
 * Todo lo que corre en el servidor (Server Actions, crons de Vercel) usa el reloj
 * UTC de la máquina, no el del estudio. Eso hacía que, por ejemplo, el KPI de
 * ingresos cortara el mes tres horas antes de tiempo y los primeros días de cada
 * mes cayeran en el mes anterior.
 *
 * Argentina es UTC-3 fijo (sin horario de verano desde 2009), pero usamos la
 * zona IANA igual para no hardcodear el offset.
 *
 * En el cliente no hace falta nada de esto: ahí el reloj ya es el de la alumna
 * (ver `toLocalDateStr` en `./utils`).
 */

export const AR_TZ = "America/Argentina/Buenos_Aires";

/** Partes de fecha/hora de un instante, leídas en hora de Buenos Aires. */
function argentinaParts(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: AR_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    // Intl devuelve "24" para medianoche en algunos runtimes.
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

/** Offset de Buenos Aires respecto de UTC, en minutos, para ese instante. */
function argentinaOffsetMinutes(date: Date): number {
  const p = argentinaParts(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

/**
 * Convierte una fecha/hora local de Buenos Aires al instante UTC correspondiente.
 * `month` es 1-12.
 */
export function argentinaDateToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, second);
  // Primera pasada con el offset del instante aproximado, suficiente en una zona sin DST.
  const offset = argentinaOffsetMinutes(new Date(naive));
  return new Date(naive - offset * 60000);
}

/** "YYYY-MM-DD" del día de hoy en Buenos Aires. */
export function todayInArgentina(now: Date = new Date()): string {
  const p = argentinaParts(now);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Instante en que arrancó el mes corriente en Buenos Aires. */
export function startOfMonthInArgentina(now: Date = new Date()): Date {
  const p = argentinaParts(now);
  return argentinaDateToUtc(p.year, p.month, 1);
}

/**
 * Fin del día (23:59:59) en Buenos Aires, `daysAhead` días después de `from`.
 * Los packs vencen al cierre del día, no a la hora exacta en que se asignaron:
 * si alguien compra un pack de 30 días un martes a las 19, no queremos que se le
 * corte en mitad de la clase del martes siguiente.
 */
export function endOfDayInArgentina(from: Date, daysAhead: number): Date {
  const p = argentinaParts(from);
  const base = argentinaDateToUtc(p.year, p.month, p.day);
  const target = argentinaParts(new Date(base.getTime() + daysAhead * 86400000));
  return argentinaDateToUtc(target.year, target.month, target.day, 23, 59, 59);
}
