import { AppShell } from "@/components/layout/app-shell";

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

      <div className="flex items-center gap-[14px] border-b border-border px-[22px] py-5">
        <div className="size-[54px] shrink-0 animate-pulse rounded-full bg-[#E8E7E5]" />
        <div>
          <div className="mb-[6px] h-[22px] w-36 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
          <div className="h-[14px] w-48 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        </div>
      </div>

      <div className="flex flex-col gap-[6px] px-4 pt-[10px]">
        <div className="overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="border-b border-border px-4 py-[13px]">
            <div className="h-[10px] w-20 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>
          <div className="px-4 py-[13px]">
            <div className="flex items-center justify-between">
              <div>
                <div className="mb-[6px] h-[16px] w-28 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
                <div className="h-[12px] w-20 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
              </div>
              <div className="h-[20px] w-16 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
            </div>
            <div className="mt-3 h-[3px] animate-pulse rounded-[2px] bg-[#E8E7E5]" />
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-border bg-card">
          <div className="border-b border-border px-4 py-[13px]">
            <div className="h-[10px] w-16 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>
          {[1, 2, 3].map((i, idx, arr) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-[13px] ${
                idx < arr.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="h-[14px] w-24 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
              <div className="h-[14px] w-4 animate-pulse rounded-[2px] bg-[#E8E7E5]" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
