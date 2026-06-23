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
        <div className="h-[30px] w-[74px] animate-pulse rounded-[100px] bg-[#E8E7E5]" />
      </header>

      <div className="px-6 pt-2 pb-6">
        <div className="mb-2 h-[11px] w-32 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        <div className="mb-3 h-[28px] w-56 animate-pulse rounded-[6px] bg-[#E8E7E5]" />

        <div className="my-[14px] border-t border-border">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border py-3"
            >
              <div className="h-[14px] w-20 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
              <div className="h-[14px] w-28 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
            </div>
          ))}
        </div>

        <div className="my-[14px] rounded-[14px] bg-muted px-4 py-[14px]">
          <div className="mb-2 h-[32px] w-20 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
          <div className="h-[14px] w-64 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        </div>

        <div className="mb-4 h-[14px] w-full animate-pulse rounded-[4px] bg-[#E8E7E5]" />
        <div className="h-[49px] w-full animate-pulse rounded-[14px] bg-[#E8E7E5]" />
      </div>
    </AppShell>
  );
}
