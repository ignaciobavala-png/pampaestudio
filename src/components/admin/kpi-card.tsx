import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  detail: string;
  badge?: { text: string; variant: "up" | "down" };
  valueSize?: "big" | "small";
}

export function KPICard({ label, value, detail, badge, valueSize = "big" }: KPICardProps) {
  return (
    <div className="rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white px-5 py-[17px]">
      <div className="mb-2.5 text-[11px] font-semibold tracking-[0.07em] uppercase text-ink-dim">
        {label}
      </div>
      <div className={cn("font-serif leading-none tracking-[-0.01em]",
        valueSize === "small" ? "text-[26px] pt-[5px]" : "text-[36px]"
      )}>
        {value}
      </div>
      <div className="mt-[7px] flex items-center gap-1.5 text-xs text-ink-dim">
        {badge && (
          <span className={cn(
            "rounded-[100px] px-[7px] py-0.5 text-[11px] font-semibold",
            badge.variant === "up" && "bg-bordo-surface text-primary",
            badge.variant === "down" && "bg-naranja-soft text-destructive"
          )}>
            {badge.text}
          </span>
        )}
        {detail}
      </div>
    </div>
  );
}
