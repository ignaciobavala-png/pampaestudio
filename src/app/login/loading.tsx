import { AppShell } from "@/components/layout/app-shell";

export default function Loading() {
  return (
    <AppShell>
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-5">
          <div>
            <div className="mb-2 h-[28px] w-44 animate-pulse rounded-[6px] bg-[#E8E7E5]" />
            <div className="h-[14px] w-64 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>

          <div className="flex gap-2">
            <div className="h-[36px] flex-1 animate-pulse rounded-[11px] bg-[#E8E7E5]" />
            <div className="h-[36px] flex-1 animate-pulse rounded-[11px] bg-[#E8E7E5]" />
          </div>

          <div className="space-y-3">
            <div className="h-[41px] w-full animate-pulse rounded-[12px] bg-[#E8E7E5]" />
            <div className="h-[41px] w-full animate-pulse rounded-[12px] bg-[#E8E7E5]" />
            <div className="h-[48px] w-full animate-pulse rounded-[13px] bg-[#E8E7E5]" />

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <div className="h-[11px] w-4 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="h-[47px] w-full animate-pulse rounded-[13px] bg-[#E8E7E5]" />
          </div>

          <div className="flex justify-center">
            <div className="h-[12px] w-48 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>
          <div className="flex justify-center">
            <div className="h-[12px] w-28 animate-pulse rounded-[4px] bg-[#E8E7E5]" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
