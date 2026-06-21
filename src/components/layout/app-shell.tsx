import { BottomNav } from "@/components/nav/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background max-[600px]:p-0 min-[600px]:p-6">
      <div className="relative flex w-full max-w-[462px] flex-col bg-card shadow-none max-[600px]:min-h-dvh min-[600px]:h-[min(94dvh,884px)] min-[600px]:rounded-[34px] min-[600px]:border min-[600px]:border-border min-[600px]:shadow-[0_2px_60px_rgba(26,25,31,.12)]">
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-[72px] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
