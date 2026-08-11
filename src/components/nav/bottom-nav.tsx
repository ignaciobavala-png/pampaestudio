"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  {
    href: "/",
    label: "Inicio",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3.2 10.6 12 3.5l8.8 7.1" />
        <path d="M5.6 9.4V20a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1V9.4" />
        <path d="M9.6 21v-5.4a2.4 2.4 0 0 1 4.8 0V21" />
      </svg>
    ),
  },
  {
    href: "/clases",
    label: "Clases",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
      </svg>
    ),
  },
  {
    href: "/agenda",
    label: "Mi agenda",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        <path d="m8.6 14.7 2.3 2.3 4.5-4.6" />
      </svg>
    ),
  },
  {
    href: "/perfil",
    label: "Perfil",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="size-[21px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.7" />
        <path d="M4.8 20.6c0-4 3.2-6.4 7.2-6.4s7.2 2.4 7.2 6.4" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex w-full border-t border-border bg-white/88 backdrop-blur-xl saturate-[180%] pb-[env(safe-area-inset-bottom,0px)] min-[600px]:absolute min-[600px]:bottom-0 min-[600px]:rounded-b-[34px] [-webkit-backdrop-filter:blur(20px)_saturate(180%)]">
      {tabs.map(({ href, label, icon }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-[11px] text-[10px] transition-colors",
              isActive
                ? "font-semibold text-primary"
                : "font-medium text-ink-dim"
            )}
          >
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-x-[26%] top-0 h-[2px] rounded-b-full bg-primary"
              />
            )}
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
