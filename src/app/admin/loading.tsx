import { SkeletonKpi, SkeletonDayTab } from "@/components/ui/skeleton-card";

export default function Loading() {
  return (
    <>
      <div className="mb-6 grid grid-cols-4 gap-3 max-[860px]:grid-cols-2 max-[480px]:grid-cols-2 max-[480px]:gap-2">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonKpi key={i} />
        ))}
      </div>

      <div className="mb-6 flex gap-2">
        {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((d, i) => (
          <div
            key={d}
            className="flex w-[50px] shrink-0 flex-col items-center gap-[5px] rounded-[16px] px-0 py-[9px]"
          >
            <div className="h-[10px] w-7 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
            <div className="h-[21px] w-8 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
            <div className="size-1 animate-pulse rounded-full bg-[#E8E7E5]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[320px_1fr] items-start gap-4 max-[860px]:grid-cols-1">
        <aside className="sticky top-[calc(58px+60px)] flex max-h-[calc(100dvh-58px-80px)] flex-col overflow-hidden rounded-[18px] border border-[rgba(26,25,31,.085)] bg-white max-[860px]:static max-[860px]:max-h-none">
          <div className="flex shrink-0 items-center justify-between px-4 py-[13px] border-b border-[rgba(26,25,31,.085)]">
            <div className="h-[14px] w-24 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
            <div className="h-[12px] w-4 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>
          <div className="overflow-y-auto p-[7px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="mb-1 flex items-center gap-3 rounded-[14px] px-3 py-[10px]"
              >
                <div className="h-[16px] w-10 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
                <div className="flex-1">
                  <div className="mb-[4px] h-[14px] w-32 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
                  <div className="h-[11px] w-24 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
                </div>
                <div className="h-[18px] w-[18px] animate-pulse rounded-[4px] bg-[#E8E7E5]" />
              </div>
            ))}
          </div>
        </aside>

        <section className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[rgba(26,25,31,.14)] bg-white py-[60px] px-[30px] text-center">
          <div className="mb-2 size-[32px] animate-pulse rounded-full bg-[#E8E7E5]" />
          <div className="mb-[10px] h-[14px] w-48 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          <div className="h-[14px] w-32 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        </section>
      </div>
    </>
  );
}
