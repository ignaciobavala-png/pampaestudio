/**
 * Teléfonos en formato E.164 (`+5491112345678`).
 *
 * El input de checkout borraba el `+` mientras la persona tipeaba
 * (`replace(/\D/g, "")`), así que era imposible cargar un número que no fuera
 * argentino. Guardamos siempre E.164: prefijo de país elegido de una lista +
 * el resto solo dígitos.
 */

export interface Country {
  /** Prefijo internacional sin `+`. Para AR móvil incluye el 9 de rigor. */
  dial: string;
  label: string;
  /** Ejemplo de número local, para el placeholder. */
  example: string;
}

/** El primero es el default. Argentina móvil arriba porque es el 99% de los casos. */
export const COUNTRIES: Country[] = [
  { dial: "549", label: "🇦🇷 +54 9 (móvil)", example: "11 1234 5678" },
  { dial: "54", label: "🇦🇷 +54 (fijo)", example: "11 4123 4567" },
  { dial: "598", label: "🇺🇾 +598", example: "9 123 456" },
  { dial: "55", label: "🇧🇷 +55", example: "11 91234 5678" },
  { dial: "56", label: "🇨🇱 +56", example: "9 1234 5678" },
  { dial: "595", label: "🇵🇾 +595", example: "981 123456" },
  { dial: "34", label: "🇪🇸 +34", example: "612 34 56 78" },
  { dial: "1", label: "🇺🇸 +1", example: "212 555 0123" },
  { dial: "39", label: "🇮🇹 +39", example: "312 345 6789" },
];

export const DEFAULT_DIAL = COUNTRIES[0].dial;

/** E.164 admite hasta 15 dígitos contando el prefijo de país. */
const E164_MAX_DIGITS = 15;
const E164_MIN_DIGITS = 8;

/** Deja solo los dígitos de la parte local (el usuario puede tipear espacios o guiones). */
export function localDigits(input: string): string {
  return input.replace(/\D/g, "");
}

/** Compone el E.164 a partir del prefijo elegido y lo que se tipeó. */
export function toE164(dial: string, local: string): string {
  return `+${dial}${localDigits(local)}`;
}

export function isValidE164(value: string): boolean {
  if (!value.startsWith("+")) return false;
  const digits = value.slice(1);
  return (
    /^[1-9]\d*$/.test(digits) &&
    digits.length >= E164_MIN_DIGITS &&
    digits.length <= E164_MAX_DIGITS
  );
}

/** Cuántos dígitos locales entran todavía, dado el prefijo elegido. */
export function maxLocalDigits(dial: string): number {
  return E164_MAX_DIGITS - dial.length;
}

/**
 * Normaliza lo que venga (input viejo, import, carga a mano) a E.164.
 * Devuelve `null` si está vacío o si no llega a ser un número plausible.
 *
 * - `+54 9 11 1234 5678` → `+5491112345678`
 * - `1112345678`         → `+541112345678` (asume el default si no hay `+`)
 */
export function normalizePhone(
  raw: string | null | undefined,
  fallbackDial = "54"
): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;

  const candidate = hasPlus ? `+${digits}` : `+${fallbackDial}${digits}`;
  return isValidE164(candidate) ? candidate : null;
}

/** Separa un E.164 guardado en (prefijo conocido, resto), para reeditarlo. */
export function splitE164(value: string): { dial: string; local: string } {
  if (!value.startsWith("+")) return { dial: DEFAULT_DIAL, local: localDigits(value) };
  const digits = value.slice(1);
  // El más largo primero: +549 tiene que ganarle a +54.
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => digits.startsWith(c.dial));
  if (!match) return { dial: DEFAULT_DIAL, local: digits };
  return { dial: match.dial, local: digits.slice(match.dial.length) };
}

/** Formato lindo para mostrar: `+54 9 11 1234 5678`. */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  if (!value.startsWith("+")) return value;
  const { dial, local } = splitE164(value);
  const prettyDial = dial === "549" ? "54 9" : dial;
  // Los 10 dígitos argentinos se leen como área + 4 + 4; el resto, de a 3.
  const grouped =
    local.length === 10
      ? `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}`
      : local.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  return `+${prettyDial} ${grouped}`.trim();
}
