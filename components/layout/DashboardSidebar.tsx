"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { signOut } from "@/lib/auth-helpers";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "Work",
    items: [
      { href: "/dashboard", label: "Today", icon: LayoutDashboard },
      { href: "/dashboard/cases", label: "Cases", icon: FolderOpen },
      { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    label: "Firm",
    items: [
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/help", label: "Help", icon: HelpCircle },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const firm = useAuthStore((s) => s.firm);

  async function handleLogout() {
    await signOut();
    router.replace("/login");
  }

  return (
    <aside className="flex h-screen w-[224px] flex-col bg-sidebar text-sidebar-mute">
      <Link
        href="/dashboard"
        className="flex flex-col gap-0.5 px-5 py-4 border-b border-sidebar-rule"
      >
        <span className="font-display text-[18px] font-medium tracking-tight text-sidebar-fg leading-none">
          CasePilot<span className="text-accent">.</span>
        </span>
        {firm && (
          <span className="text-[11px] text-page-faint truncate leading-snug">
            {firm.name}
          </span>
        )}
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 pt-5 pb-2">
        {navSections.map((section, idx) => (
          <div key={section.label} className={cn(idx > 0 && "mt-6")}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-page-faint">
              {section.label}
            </p>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
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
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-rule px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-[13.5px] text-sidebar-mute transition-colors duration-100 hover:bg-white/[0.05] hover:text-sidebar-fg"
        >
          <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
