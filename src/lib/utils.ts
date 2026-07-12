import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha como "YYYY-MM-DD" usando la fecha LOCAL del navegador.
 *
 * No usar `toISOString().slice(0,10)`: eso convierte a UTC y en Argentina
 * (UTC-3) corre la fecha un día hacia adelante de noche (>21hs), rompiendo
 * los keys de fecha de la agenda (bookings.date) y mostrando ocupación 0.
 */
export function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
