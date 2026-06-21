"use client";

import { cn } from "@/lib/utils";

export type Pack = {
  id: string;
  eyebrow: string;
  name: string;
  description: string;
  price: string;
  per: string;
  credits: number;
  featured?: boolean;
  features: string[];
};

export function PackCard({
  pack,
  selected,
  onSelect,
}: {
  pack: Pack;
  selected: boolean;
  onSelect: (pack: Pack) => void;
}) {
  return (
    <div
      onClick={() => onSelect(pack)}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-3 rounded-[22px] border p-5 transition-all duration-[160ms]",
        pack.featured && !selected &&
          "bg-foreground text-white border-foreground",
        !pack.featured && !selected &&
          "bg-card border-border hover:border-[rgba(26,25,31,.14)]",
        selected && "border-primary shadow-[0_0_0_2px_var(--color-secondary)]",
        pack.featured &&
          selected &&
          "border-primary shadow-[0_0_0_2px_var(--color-secondary)]"
      )}
    >
      <div
        className={cn(
          "absolute top-4 right-4 flex size-[22px] items-center justify-center rounded-full border-[1.5px] text-xs transition-all",
          !pack.featured &&
            !selected &&
            "border-[rgba(26,25,31,.14)] text-transparent",
          pack.featured && !selected && "border-white/30 text-transparent",
          selected && "border-primary bg-primary text-white"
        )}
      >
        ✓
      </div>

      <div
        className={cn(
          "text-[10px] font-semibold tracking-[0.12em] uppercase",
          pack.featured && !selected ? "text-secondary" : "text-ink-dim"
        )}
      >
        {pack.eyebrow}
      </div>

      <h3 className="font-serif text-[22px] pr-7 leading-none">{pack.name}</h3>

      <p
        className={cn(
          "text-[12.5px] leading-relaxed",
          pack.featured && !selected
            ? "text-white/60"
            : "text-muted-foreground"
        )}
      >
        {pack.description}
      </p>

      <div className="flex flex-col gap-1">
        {pack.features.map((f) => (
          <div
            key={f}
            className={cn(
              "flex items-center gap-[7px] text-xs before:content-['—']",
              pack.featured && !selected
                ? "text-white/65 before:text-white/30"
                : "text-muted-foreground before:text-ink-dim"
            )}
          >
            {f}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-[10px]">
        <span className="font-serif text-[26px] leading-none">
          {pack.price}
          <span
            className={cn(
              "ml-[3px] text-[11px] font-normal not-italic",
              pack.featured && !selected
                ? "text-white/45"
                : "text-ink-dim"
            )}
          >
            {pack.per}
          </span>
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pack);
          }}
          className={cn(
            "cursor-pointer rounded-[12px] px-[18px] py-[11px] font-sans text-[13px] font-semibold transition-all duration-[160ms]",
            !pack.featured && !selected &&
              "border border-[rgba(26,25,31,.14)] bg-[#EFEEEC] text-foreground hover:bg-[#DBDAD6]",
            pack.featured && !selected && "bg-white text-foreground",
            selected && "bg-primary text-white",
            pack.featured && selected && "bg-primary text-white"
          )}
        >
          {selected ? "Seleccionado ✓" : "Elegir"}
        </button>
      </div>
    </div>
  );
}
