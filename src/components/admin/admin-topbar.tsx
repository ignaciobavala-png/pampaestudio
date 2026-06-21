"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "hoy", label: "Hoy", href: "/admin" },
  { id: "semana", label: "Semana", href: "/admin/semana" },
  { id: "clientes", label: "Clientes", href: "/admin/clientes" },
  { id: "nueva", label: "Nueva clase", href: "/admin/nueva-clase" },
];

export function AdminTopbar() {
  const pathname = usePathname();
  const activeTab = tabs.find((t) => t.href === pathname)?.id || "hoy";

  return (
    <header className="sticky top-0 z-60 flex h-[58px] items-center border-b border-[rgba(26,25,31,.085)] bg-[#F1F1EF]/88 backdrop-blur-xl saturate-[180%] px-5 [-webkit-backdrop-filter:blur(20px)_saturate(180%)]">
      <Link href="/" className="mr-6 shrink-0 text-sm text-ink-dim no-underline transition-colors hover:text-foreground">
        ← Sitio
      </Link>

      <Link href="/admin" className="font-serif text-[19px] tracking-[-0.01em] no-underline text-foreground">
        Pampa<span className="ml-0.5 inline-block size-[5px] rounded-full bg-[linear-gradient(135deg,#D7D9E0,#F4F5F8,#C2C4CE)] align-middle" />
      </Link>

      <nav className="ml-6 flex gap-0.5 flex-1 max-[860px]:hidden">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "rounded-[9px] px-[13px] py-[7px] text-[13px] transition-colors no-underline whitespace-nowrap",
              activeTab === tab.id
                ? "bg-white text-foreground font-medium shadow-[0_1px_2px_rgba(26,25,31,.05)]"
                : "text-ink-dim hover:text-foreground hover:bg-[#EFEFED]"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2.5 max-[860px]:hidden">
        <span className="flex items-center gap-1.5 text-[11px] text-ink-dim">
          <span className="size-[6px] rounded-full bg-primary shadow-[0_0_0_3px_var(--color-bordo-surface)]" />
          En vivo
        </span>
        <span className="text-xs text-ink-dim">Vie 13 jun · 10:42</span>
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full border border-[rgba(26,25,31,.14)] bg-white text-[11px] font-semibold text-ink-dim">
          AS
        </div>
      </div>
    </header>
  );
}
