"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useTeamStore } from "@/stores/team-store";

export function TeamHeader({ teamId }: { teamId: string }) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const team = useTeamStore((s) => s.currentTeam);

  const title = matchTitle(pathname, teamId);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="border-b border-rule bg-paper">
      <div className="flex items-center gap-2 border-b border-claret/15 bg-claret-faint px-6 py-1.5 text-[11px] text-claret-ink">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-claret" />
        <span>
          You are working inside{" "}
          <strong className="font-medium">{team?.name ?? "a team"}</strong>.
          Cases created here are owned by this team.
        </span>
        <Link
          href="/dashboard/team"
          className="ml-auto text-[11px] uppercase tracking-[0.14em] text-claret hover:text-claret-hover"
        >
          Leave team view
        </Link>
      </div>

      <div className="flex h-14 items-center justify-between px-6">
        <h1 className="font-display text-[18px] font-medium tracking-tight text-ink-strong">
          {title}
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Open search"
            className="flex h-8 items-center gap-2 rounded-md border border-rule bg-paper px-3 text-[12px] text-ink-faint transition-colors hover:border-rule-strong hover:text-ink"
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
          </button>

          <Link
            href="/dashboard/settings"
            aria-label="Open profile settings"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-paper-3 text-[11px] font-medium text-ink-strong transition-colors hover:bg-paper-2"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}

function matchTitle(pathname: string, teamId: string): string {
  const overview = `/team/${teamId}`;
  if (pathname === overview) return "Overview";
  if (pathname.startsWith(`${overview}/cases/new`)) return "New case";
  if (pathname.startsWith(`${overview}/cases`)) return "Cases";
  if (pathname.startsWith(`${overview}/settings`)) return "Settings";
  return "Team";
}
