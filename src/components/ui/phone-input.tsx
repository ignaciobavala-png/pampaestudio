"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  DEFAULT_DIAL,
  localDigits,
  maxLocalDigits,
  splitE164,
  toE164,
} from "@/lib/phone";

interface PhoneInputProps {
  /** Valor en E.164 (`+5491112345678`) o cadena vacía. */
  value: string;
  /** Devuelve E.164, o cadena vacía si todavía no hay dígitos. */
  onChange: (e164: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  id?: string;
}

/**
 * Selector de prefijo de país + número local. Nunca destruye el `+`: el prefijo
 * vive en el `<select>` y el input solo acepta dígitos de la parte local.
 */
export function PhoneInput({
  value,
  onChange,
  className,
  inputClassName,
  placeholder,
  id,
}: PhoneInputProps) {
  const parsed = useMemo(() => (value ? splitE164(value) : null), [value]);
  const [dial, setDial] = useState(parsed?.dial ?? DEFAULT_DIAL);
  const local = parsed?.local ?? "";

  const country = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0];

  const emit = (nextDial: string, nextLocal: string) => {
    const digits = localDigits(nextLocal).slice(0, maxLocalDigits(nextDial));
    onChange(digits ? toE164(nextDial, digits) : "");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <select
        aria-label="Código de país"
        value={dial}
        onChange={(e) => {
          setDial(e.target.value);
          emit(e.target.value, local);
        }}
        className="shrink-0 cursor-pointer bg-transparent py-1 text-[13px] text-ink-dim outline-none"
      >
        {COUNTRIES.map((c) => (
          <option key={c.dial} value={c.dial}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={local}
        onChange={(e) => emit(dial, e.target.value)}
        className={cn("flex-1 bg-transparent py-1 outline-none", inputClassName)}
        placeholder={placeholder ?? country.example}
      />
    </div>
  );
}
