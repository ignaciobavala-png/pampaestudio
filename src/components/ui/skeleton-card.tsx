import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[10px] bg-[#E8E7E5]",
        className
      )}
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn("h-[96px] rounded-[22px]", className)}
    />
  );
}

export function SkeletonPackCard() {
  return (
    <div className="rounded-[22px] border border-border bg-card p-[16px]">
      <Skeleton className="mb-3 h-[10px] w-20" />
      <Skeleton className="mb-2 h-[22px] w-36" />
      <Skeleton className="mb-3 h-3 w-full" />
      <Skeleton className="mb-4 h-[6px] w-full rounded-[3px]" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-[26px] w-24" />
        <Skeleton className="h-[16px] w-14" />
      </div>
    </div>
  );
}

export function SkeletonAgendaItem() {
  return (
    <div className="flex items-center gap-3 rounded-[22px] border border-border bg-card p-[14px]">
      <Skeleton className="size-11 rounded-[12px]" />
      <div className="flex-1">
        <Skeleton className="mb-[6px] h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-[22px] w-20 rounded-[100px]" />
    </div>
  );
}

export function SkeletonClassRow() {
  return (
    <div className="flex items-stretch gap-[14px] rounded-[22px] border border-border bg-card p-4">
      <div className="flex w-[54px] shrink-0 flex-col justify-center gap-1 border-r border-border pr-[14px]">
        <Skeleton className="h-5 w-10" />
        <Skeleton className="h-3 w-8" />
      </div>
      <div className="min-w-0 flex-1">
        <Skeleton className="mb-[6px] h-5 w-40" />
        <Skeleton className="mb-[10px] h-[14px] w-56" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-[3px] w-[84px] rounded-[2px]" />
          <Skeleton className="h-[14px] w-16" />
        </div>
      </div>
      <Skeleton className="size-4 self-center rounded" />
    </div>
  );
}

export function SkeletonKpi() {
  return (
    <div className="rounded-[18px] border border-border bg-card px-[15px] py-[12px]">
      <Skeleton className="mb-2 h-[10px] w-16" />
      <Skeleton className="mb-1 h-[26px] w-12" />
      <Skeleton className="h-[10px] w-20" />
    </div>
  );
}

export function SkeletonDayTab() {
  return (
    <div className="flex w-[50px] shrink-0 flex-col items-center gap-[5px] px-0 py-[9px]">
      <Skeleton className="h-[10px] w-7" />
      <Skeleton className="h-[21px] w-8" />
      <Skeleton className="size-1 rounded-full" />
    </div>
  );
}
