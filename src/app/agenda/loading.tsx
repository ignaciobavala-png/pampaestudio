import { AppShell } from "@/components/layout/app-shell";
import { SkeletonDayTab, SkeletonAgendaItem } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <AppShell>
      <header className="flex shrink-0 items-center justify-between px-[22px] pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <div>
          <img
            src="/assets/logo-pilates.png"
            alt="Pampa Estudio"
            className="h-[152px] w-auto brightness-0 -my-[66.5px] -ml-3"
          />
        </div>
        <div className="h-[30px] w-[64px] animate-pulse rounded-[100px] bg-[#E8E7E5]" />
      </header>

      <div className="flex items-center justify-between px-[22px] pb-1 pt-[10px]">
        <div className="h-[22px] w-40 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
        <div className="flex gap-1">
          <div className="size-8 animate-pulse rounded-[10px] bg-[#E8E7E5]" />
          <div className="size-8 animate-pulse rounded-[10px] bg-[#E8E7E5]" />
        </div>
      </div>

      <div className="px-[22px] pb-[2px] pt-[6px]">
        <div className="mb-1 grid grid-cols-7 gap-[2px]">
          {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[10px] font-semibold tracking-[0.05em] uppercase text-ink-dim"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-[3px]">
          {Array.from({ length: 35 }, (_, i) =>
            i < 7 ? (
              <div key={i} className="cday" />
            ) : (
              <SkeletonDayTab key={i} />
            )
          )}
        </div>
      </div>

      <div className="mx-[22px] my-[10px] h-px bg-border" />

      <div className="mx-4 mb-2 h-[56px] animate-pulse rounded-[14px] bg-[#E8E7E5]" />

      <div className="px-[22px] py-[10px] pb-[6px]">
        <div className="h-[11px] w-32 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {[1, 2, 3].map((i) => (
          <SkeletonAgendaItem key={i} />
        ))}
      </div>
    </AppShell>
  );
}
