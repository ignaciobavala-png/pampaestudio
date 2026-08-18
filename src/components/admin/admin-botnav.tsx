"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    id: "hoy",
    href: "/admin",
    label: "Hoy",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        <circle cx="12" cy="15.4" r="2.1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "semana",
    href: "/admin/semana",
    label: "Semana",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M3 9.5h18M9 9.5V21M15 9.5V21" />
      </svg>
    ),
  },
  {
    id: "clientes",
    href: "/admin/clientes",
    label: "Clientes",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21c0-4 2.7-6 6-6s6 2 6 6" />
        <path d="M16 3c1.7.4 3 1.8 3 4s-1.3 3.6-3 4" />
        <path d="M21 21c0-3.3-1.3-5-3-5.5" />
      </svg>
    ),
  },
  {
    id: "packs",
    href: "/admin/packs",
    label: "Packs",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 8.5 12 4l9 4.5v7L12 20l-9-4.5z" />
        <path d="M3 8.5 12 13l9-4.5M12 13v7" />
      </svg>
    ),
  },
  {
    id: "nueva",
    href: "/admin/nueva-clase",
    label: "Nueva",
    icon: (
      <svg viewBox="0 0 24 24" className="size-[21px]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </svg>
    ),
  },
];

export function AdminBotNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden max-[860px]:flex fixed bottom-0 left-0 right-0 z-120 justify-around border-t border-[rgba(26,25,31,.085)] bg-white/90 backdrop-blur-xl saturate-[180%] pt-[9px] pb-[env(safe-area-inset-bottom,0px)] [-webkit-backdrop-filter:blur(20px)_saturate(180%)]">
      {tabs.map((tab) => {
        const isActive = tab.href === "/admin" ? pathname === "/admin" : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 no-underline text-[10px] transition-colors",
              isActive ? "font-semibold text-primary" : "font-medium text-ink-dim"
            )}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
