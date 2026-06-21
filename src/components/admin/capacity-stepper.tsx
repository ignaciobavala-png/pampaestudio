"use client";

import { useState } from "react";

interface CapacityStepperProps {
  currentMax: number;
  taken: number;
  onSave: (newMax: number) => void;
  min?: number;
  absoluteMax?: number;
}

export function CapacityStepper({ currentMax, taken, onSave, min, absoluteMax = 30 }: CapacityStepperProps) {
  const [value, setValue] = useState(currentMax);
  const changed = value !== currentMax;

  const step = (d: number) => {
    setValue((v) => Math.max(min ?? taken, Math.min(absoluteMax, v + d)));
  };

  const save = () => {
    onSave(value);
  };

  return (
    <div className="flex items-center gap-0 border-t border-[rgba(26,25,31,.085)] pt-[14px]">
      <span className="mr-auto text-[12.5px] text-ink-dim">Ajustar cupo maximo</span>
      <button onClick={() => step(-1)} className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] border border-[rgba(26,25,31,.14)] bg-white text-lg transition-colors hover:bg-[#EFEFED]">−</button>
      <span className="w-[38px] text-center font-serif text-[22px]">{value}</span>
      <button onClick={() => step(1)} className="flex size-8 cursor-pointer items-center justify-center rounded-[9px] border border-[rgba(26,25,31,.14)] bg-white text-lg transition-colors hover:bg-[#EFEFED]">+</button>
      {changed && (
        <button onClick={save} className="ml-2.5 cursor-pointer rounded-[9px] bg-primary px-[14px] py-[7px] text-xs font-semibold text-white transition-colors hover:bg-bordo-hover">
          Guardar
        </button>
      )}
    </div>
  );
}
