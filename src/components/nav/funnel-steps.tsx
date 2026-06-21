import { cn } from "@/lib/utils";

const steps = [
  { num: 1, label: "Pack" },
  { num: 2, label: "Pago" },
  { num: 3, label: "Clases" },
  { num: 4, label: "Reserva" },
];

export function FunnelSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 px-[22px] pb-[6px] pt-[14px]">
      {steps.map((step, i) => (
        <span key={step.num} className="flex items-center">
          <span className="flex flex-col items-center gap-[3px]">
            <span
              className={cn(
                "flex size-[26px] items-center justify-center rounded-full text-[11px] font-bold transition-colors",
                step.num < current && "bg-primary text-white",
                step.num === current && "bg-foreground text-white",
                step.num > current && "bg-[#EFEEEC] text-ink-dim"
              )}
            >
              {step.num}
            </span>
            <span
              className={cn(
                "text-[10px] font-medium whitespace-nowrap",
                step.num <= current ? "text-foreground" : "text-ink-dim"
              )}
            >
              {step.label}
            </span>
          </span>
          {i < steps.length - 1 && (
            <span
              className={cn(
                "mx-[2px] mb-[14px] h-[2px] w-[28px] rounded-[1px] transition-colors",
                step.num < current ? "bg-primary" : "bg-[#DBDAD6]"
              )}
            />
          )}
        </span>
      ))}
    </div>
  );
}
