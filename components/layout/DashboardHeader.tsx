"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const routeTitles: Record<string, string> = {
  "/dashboard": "Today",
  "/dashboard/cases": "Cases",
  "/dashboard/calendar": "Calendar",
  "/dashboard/team": "Team",
  "/dashboard/settings": "Settings",
  "/dashboard/help": "Help",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const title = matchTitle(pathname);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-rule bg-paper px-6">
      <h1 className="font-display text-[18px] font-medium tracking-tight text-ink-strong">
        {title}
      </h1>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Open search"
          className="flex items-center gap-2 rounded-md border border-rule bg-paper px-3 h-8 text-[12px] text-ink-faint transition-colors hover:border-rule-strong hover:text-ink"
        >
          <Search className="h-[14px] w-[14px]" strokeWidth={1.75} />
          <span>Search</span>
          <kbd className="ml-3 hidden rounded border border-rule bg-paper-2 px-1 font-mono text-[10px] text-ink-faint sm:inline">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-md p-1.5 text-ink-mute transition-colors hover:bg-paper-2 hover:text-ink"
        >
          <Bell className="h-[16px] w-[16px]" strokeWidth={1.75} />
          <span
            aria-label="2 unread"
            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-alarm"
          />
        </button>

        <Link
          href="/dashboard/settings"
          aria-label="Open profile settings"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-page-3 text-[11px] font-medium text-ink-strong transition-colors hover:bg-page-2 focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
        >
          {initials}
        </Link>
      </div>
    </header>
  );
}

function matchTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/dashboard/cases")) return "Cases";
  if (pathname.startsWith("/dashboard/team")) return "Team";
  return "CasePilot";
}
