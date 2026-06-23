import { AppShell } from "@/components/layout/app-shell";
import { SkeletonPackCard } from "@/components/ui/skeleton-card";

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

      <div className="px-[22px] pt-2 pb-2">
        <div className="mb-1 h-[10px] w-24 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        <div className="mb-3 h-[30px] w-64 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
        <div className="mb-6 h-[14px] w-full animate-pulse rounded-[4px] bg-[#E8E7E5]" />
      </div>

      <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonPackCard key={i} />
        ))}
      </div>
    </AppShell>
  );
}
