import { cn } from "@/lib/utils";

interface ClassListRowProps {
  time: string;
  name: string;
  teacher: string;
  room: string;
  color: string;
  taken: number;
  max: number;
  isActive?: boolean;
  onClick?: () => void;
}

function pillStatus(taken: number, max: number) {
  const free = max - taken;
  const pct = taken / max;
  if (free <= 0) return { cls: "bg-bordo-surface text-primary", text: "Completo" };
  if (pct >= 0.8) return { cls: "bg-amber-soft text-amber-text", text: `${free} lugar${free > 1 ? "es" : ""}` };
  return { cls: "bg-[#EFEFED] text-ink-dim", text: `${free} lugares` };
}

export function ClassListRow({ time, name, teacher, room, color, taken, max, isActive, onClick }: ClassListRowProps) {
  const pill = pillStatus(taken, max);

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-center gap-[11px] rounded-[12px] border border-transparent px-2.5 py-2.5 mb-0.5 transition-all",
        isActive ? "bg-bordo-surface border-[rgba(73,4,25,.18)]" : "hover:bg-[#F7F7F6]"
      )}
    >
      <div className={cn("w-11 shrink-0 font-serif text-[17px] leading-none", isActive ? "text-primary" : "text-ink-dim")}>
        {time}
      </div>
      <div className="h-full w-[3px] self-stretch shrink-0 rounded-[2px]" style={{ background: color }} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{name}</div>
        <div className="mt-px text-[11px] text-ink-dim">{teacher} · {room}</div>
      </div>
      <span className={cn("shrink-0 rounded-[100px] px-2 py-[3px] text-[10px] font-semibold whitespace-nowrap", pill.cls)}>
        {pill.text}
      </span>
    </div>
  );
}
