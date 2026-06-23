import { AppShell } from "@/components/layout/app-shell";
import { FunnelSteps } from "@/components/nav/funnel-steps";
import { SkeletonClassRow, SkeletonDayTab } from "@/components/ui/skeleton-card";

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

      <FunnelSteps current={3} />

      <div className="flex items-baseline justify-between px-[22px] pb-1 pt-[10px]">
        <div className="h-[27px] w-28 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
        <div className="h-[14px] w-20 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
      </div>

      <div className="flex gap-[7px] overflow-x-auto px-[22px] pb-1 pt-[14px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[32px] w-[72px] animate-pulse rounded-[100px] bg-[#E8E7E5]"
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto px-[22px] py-4">
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonDayTab key={i} />
        ))}
      </div>

      <div className="px-[22px] pb-[2px]">
        <div className="h-[11px] w-32 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 pt-[6px]">
        {[1, 2, 3].map((i) => (
          <SkeletonClassRow key={i} />
        ))}
      </div>
    </AppShell>
  );
}
