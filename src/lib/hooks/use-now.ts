"use client";

import { useSyncExternalStore } from "react";

const TICK_MS = 60_000;

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}

/**
 * Redondeado al minuto para que el snapshot sea estable entre ticks:
 * `useSyncExternalStore` re-renderiza en loop si el valor cambia en cada lectura.
 */
function getSnapshot(): number {
  return Math.floor(Date.now() / TICK_MS) * TICK_MS;
}

/** En el servidor no hay reloj del usuario; 0 desactiva lo que dependa de la hora. */
function getServerSnapshot(): number {
  return 0;
}

/**
 * Hora actual utilizable durante el render, que se actualiza sola cada minuto.
 *
 * Leer `Date.now()` en el cuerpo de un componente hace que el render no sea
 * idempotente: el valor queda congelado en el primer render y encima difiere
 * entre el HTML del servidor y la hidratación.
 */
export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
