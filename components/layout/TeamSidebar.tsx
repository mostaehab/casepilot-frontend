"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Settings,
  ArrowLeft,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTeamStore } from "@/stores/team-store";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function TeamSidebar({ teamId }: { teamId: string }) {
  const pathname = usePathname();
  const team = useTeamStore((s) => s.currentTeam);

  const navItems: NavItem[] = [
    { href: `/team/${teamId}`, label: "Overview", icon: LayoutDashboard, exact: true },
    { href: `/team/${teamId}/cases`, label: "Cases", icon: FolderOpen },
    { href: `/team/${teamId}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="flex h-screen w-[244px] flex-col bg-sidebar text-sidebar-mute">
      <div className="border-b border-sidebar-rule px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
          Team view
        </p>
        <h2 className="mt-1 font-display text-[18px] font-medium leading-tight tracking-tight text-sidebar-fg truncate">
          {team?.name ?? "Loading…"}
        </h2>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-2">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-page-faint">
          This team
        </p>
        <ul className="space-y-px">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13.5px]",
                    "transition-colors duration-100",
                    isActive
                      ? "bg-sidebar-active text-sidebar-active-text font-medium before:absolute before:left-0 before:top-1/2 before:h-3 before:w-[2px] before:-translate-x-2 before:-translate-y-1/2 before:rounded-full before:bg-accent before:content-['']"
                      : "text-sidebar-mute hover:bg-white/[0.05] hover:text-sidebar-fg"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[15px] w-[15px] shrink-0",
                      isActive ? "text-sidebar-fg" : "text-page-faint"
                    )}
                    strokeWidth={1.75}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-rule px-3 py-3">
        <Link
          href="/dashboard/team"
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13.5px] text-sidebar-mute transition-colors duration-100 hover:bg-white/[0.05] hover:text-sidebar-fg"
        >
          <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={1.75} />
          Back to firm
        </Link>
      </div>
    </aside>
  );
}
