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
      >
        <path d="M3 8l9-5 9 5-9 5-9-5zM3 8v8l9 5 9-5V8" />
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
      >
        <rect x="3" y="4" width="18" height="17" rx="3" />
        <path d="M3 9h18M8 2v4M16 2v4" />
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
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
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
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <path d="M10 17l5-5-5-5M15 12H3" />
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
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-[11px] text-[10px] font-medium transition-colors",
              isActive ? "text-foreground" : "text-ink-dim"
            )}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
