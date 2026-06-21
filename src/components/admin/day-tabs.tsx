"use client";

import { cn } from "@/lib/utils";

interface DayTabsProps {
  days: { label: string; num: number; today?: boolean }[];
  activeIndex: number;
  onSelect: (index: number) => void;
  meta?: string;
}

export function DayTabs({ days, activeIndex, onSelect, meta }: DayTabsProps) {
  return (
    <div className="sticky top-[58px] z-50 -mx-5 mb-4 flex items-center gap-3 overflow-x-auto border-b border-[rgba(26,25,31,.085)] bg-[#F1F1EF]/90 px-5 py-2.5 backdrop-blur-md [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {days.map((d, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={cn(
            "shrink-0 cursor-pointer rounded-[10px] border border-transparent px-[13px] py-[7px] text-[13px] whitespace-nowrap transition-all",
            i === activeIndex
              ? "bg-foreground text-white font-medium"
              : "text-ink-dim hover:bg-[#EFEFED]"
          )}
        >
          {d.label}
          <span className="ml-1 font-serif text-sm">
            {d.num}
          </span>
        </button>
      ))}
      {meta && (
        <span className="ml-auto shrink-0 text-xs text-ink-dim">
          {meta}
        </span>
      )}
    </div>
  );
}
