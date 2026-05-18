"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Plus, Calendar as CalIcon, Users } from "lucide-react";
import { useCaseStore } from "@/stores/case-store";
import { useTeamStore } from "@/stores/team-store";
import { caseService } from "@/services/case-service";
import type { Case } from "@/types";

/**
 * The docket pulls a generous window from the server; the time-window pills
 * narrow it client-side, so switching pills is instant. 50 is the server's
 * upper clamp on `/cases/upcoming?limit=N`.
 */
const UPCOMING_FETCH_LIMIT = 50;
const DOCKET_DISPLAY_LIMIT = 6;

type DashboardWindow = "today" | "week" | "all";

const WINDOW_OPTIONS: { value: DashboardWindow; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "all", label: "All open" },
];

function isHearingInWindow(
  hearingIso: string | undefined,
  window: DashboardWindow,
  now: Date
): boolean {
  if (!hearingIso) return false;
  const at = new Date(hearingIso).getTime();
  if (Number.isNaN(at)) return false;
  if (at < now.getTime()) return false;

  if (window === "all") return true;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const days = window === "today" ? 1 : 7;
  const horizon = new Date(startOfToday);
  horizon.setDate(horizon.getDate() + days);
  return at < horizon.getTime();
}

export default function DashboardPage() {
  const cases = useCaseStore((s) => s.cases);
  const fetchCases = useCaseStore((s) => s.fetchCases);
  const teams = useTeamStore((s) => s.teams);
  const fetchMyTeams = useTeamStore((s) => s.fetchMyTeams);

  const [upcoming, setUpcoming] = useState<Case[]>([]);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState(true);
  const [windowFilter, setWindowFilter] = useState<DashboardWindow>("week");

  useEffect(() => {
    fetchCases();
    fetchMyTeams();
  }, [fetchCases, fetchMyTeams]);

  useEffect(() => {
    let cancelled = false;
    setIsUpcomingLoading(true);
    caseService
      .getUpcomingCases(UPCOMING_FETCH_LIMIT)
      .then((rows) => {
        if (!cancelled) setUpcoming(rows);
      })
      .catch(() => {
        if (!cancelled) setUpcoming([]);
      })
      .finally(() => {
        if (!cancelled) setIsUpcomingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleUpcoming = useMemo(() => {
    const now = new Date();
    return upcoming
      .filter((c) => isHearingInWindow(c.nextHearingDate, windowFilter, now))
      .slice(0, DOCKET_DISPLAY_LIMIT);
  }, [upcoming, windowFilter]);

  const statusCounts = useMemo(() => {
    const byStatus: Record<string, number> = {
      open: 0,
      in_progress: 0,
      pending: 0,
      closed: 0,
    };
    for (const c of cases) {
      byStatus[c.status] = (byStatus[c.status] ?? 0) + 1;
    }
    return byStatus;
  }, [cases]);

  const priorityCounts = useMemo(() => {
    const byPriority: Record<string, number> = { high: 0, medium: 0, low: 0 };
    for (const c of cases) {
      byPriority[c.priority] = (byPriority[c.priority] ?? 0) + 1;
    }
    return byPriority;
  }, [cases]);

  const hearingsCount = useMemo(() => {
    const now = Date.now();
    const inSevenDays = now + 7 * 24 * 60 * 60 * 1000;
    return cases.filter((c) => {
      if (!c.nextHearingDate) return false;
      const t = new Date(c.nextHearingDate).getTime();
      return t >= now && t <= inSevenDays;
    }).length;
  }, [cases]);

  const activeCount = statusCounts.open + statusCounts.in_progress + statusCounts.pending;

  const stats = [
    { label: "Active",       value: activeCount },
    { label: "In progress",  value: statusCounts.in_progress },
    { label: "Pending",      value: statusCounts.pending },
    { label: "Closed",       value: statusCounts.closed },
    { label: "Hearings · 7d", value: hearingsCount },
    { label: "Teams",        value: teams.length },
  ];

  return (
    <div className="space-y-7 animate-fade-in">
      <Header window={windowFilter} onChange={setWindowFilter} />
      <Stats stats={stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Docket
          upcoming={visibleUpcoming}
          window={windowFilter}
          isLoading={isUpcomingLoading}
        />
        <SidePanel
          statusCounts={statusCounts}
          priorityCounts={priorityCounts}
          totalCases={cases.length}
        />
      </div>
    </div>
  );
}

function Header({
  window: active,
  onChange,
}: {
  window: DashboardWindow;
  onChange: (w: DashboardWindow) => void;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {today}
        </p>
        <h1 className="font-display text-[28px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          What&rsquo;s on the desk today.
        </h1>
      </div>
      <div
        role="tablist"
        aria-label="Time window"
        className="flex items-center gap-1 rounded-md border border-rule bg-page p-0.5 text-[12px]"
      >
        {WINDOW_OPTIONS.map((opt) => {
          const isActive = opt.value === active;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(opt.value)}
              className={
                isActive
                  ? "rounded-[5px] bg-navy-soft px-2.5 py-1 font-medium text-navy"
                  : "rounded-[5px] px-2.5 py-1 text-ink-mute transition-colors hover:text-ink"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stats({ stats }: { stats: { label: string; value: number }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-page px-4 py-3">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
            {stat.label}
          </dt>
          <dd className="font-display text-[24px] font-medium leading-none tracking-tight text-ink-strong mt-2 tabular-nums">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Docket({
  upcoming,
  window,
  isLoading,
}: {
  upcoming: Case[];
  window: DashboardWindow;
  isLoading: boolean;
}) {
  const trailing =
    window === "today"
      ? `${upcoming.length} today`
      : window === "week"
        ? `${upcoming.length} this week`
        : `Next ${upcoming.length || DOCKET_DISPLAY_LIMIT}`;
  return (
    <section className="lg:col-span-8">
      <SectionHeader kicker="Calendar" title="Coming up" trailing={trailing} />
      {isLoading && upcoming.length === 0 ? (
        <DocketSkeleton />
      ) : upcoming.length === 0 ? (
        <DocketEmpty window={window} />
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {upcoming.map((c) => (
            <DocketRow key={c.id} caseItem={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function DocketRow({ caseItem }: { caseItem: Case }) {
  const date = caseItem.nextHearingDate
    ? new Date(caseItem.nextHearingDate)
    : null;
  const day = date
    ? date.toLocaleDateString("en-US", { weekday: "short" })
    : "—";
  const dateLabel = date
    ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";
  const time = date
    ? date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  const note =
    caseItem.courtName ??
    (caseItem.caseNumber ? `Case #${caseItem.caseNumber}` : caseItem.clientName);

  return (
    <li>
      <Link
        href={`/dashboard/cases/${caseItem.id}`}
        className="grid grid-cols-12 items-baseline gap-2 py-2.5 transition-colors hover:bg-paper-2"
      >
        <div className="col-span-3 flex items-baseline gap-2 px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {day}
          </span>
          <span className="text-[12.5px] font-medium tabular-nums text-ink">
            {dateLabel}
          </span>
        </div>
        <div className="col-span-7 min-w-0 px-1">
          <p className="text-[13px] leading-tight text-ink truncate">
            Hearing &middot; {caseItem.title}
          </p>
          <p className="mt-0.5 text-[11px] text-ink-faint truncate">{note}</p>
        </div>
        <div className="col-span-2 flex justify-end px-1">
          {time && (
            <span className="text-[11px] tabular-nums text-ink-mute">
              {time}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function DocketSkeleton() {
  return (
    <ul className="mt-3 divide-y divide-rule border-y border-rule">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="grid grid-cols-12 items-baseline gap-2 py-3">
          <div className="col-span-3 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-7 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-paper-3 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function DocketEmpty({ window }: { window: DashboardWindow }) {
  const copy =
    window === "today"
      ? "Nothing on the calendar for today."
      : window === "week"
        ? "Nothing scheduled this week."
        : "No upcoming hearings. Add a next hearing date on a case to see it here.";
  return (
    <div className="mt-3 rounded-md border border-dashed border-rule bg-paper py-10 px-6 text-center">
      <CalIcon
        className="mx-auto h-5 w-5 text-ink-faint"
        strokeWidth={1.5}
      />
      <p className="mt-3 text-[13px] text-ink-mute max-w-[42ch] mx-auto">
        {copy}
      </p>
    </div>
  );
}

function SidePanel({
  statusCounts,
  priorityCounts,
  totalCases,
}: {
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  totalCases: number;
}) {
  const statusRows = [
    { key: "open",        label: "Open" },
    { key: "in_progress", label: "In progress" },
    { key: "pending",     label: "Pending" },
    { key: "closed",      label: "Closed" },
  ];
  const priorityRows = [
    { key: "high",   label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low",    label: "Low" },
  ];

  return (
    <aside className="lg:col-span-4 space-y-6">
      <DistributionPanel
        kicker="Caseload"
        title="By status"
        rows={statusRows.map((r) => ({
          label: r.label,
          value: statusCounts[r.key] ?? 0,
        }))}
        total={totalCases}
      />
      <DistributionPanel
        kicker="Caseload"
        title="By priority"
        rows={priorityRows.map((r) => ({
          label: r.label,
          value: priorityCounts[r.key] ?? 0,
        }))}
        total={priorityRows.reduce((acc, r) => acc + (priorityCounts[r.key] ?? 0), 0)}
      />
      <QuickActions />
    </aside>
  );
}

function DistributionPanel({
  kicker,
  title,
  rows,
  total,
}: {
  kicker: string;
  title: string;
  rows: { label: string; value: number }[];
  total: number;
}) {
  return (
    <section>
      <SectionHeader kicker={kicker} title={title} compact />
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
          return (
            <li key={r.label}>
              <div className="flex items-baseline justify-between text-[12px]">
                <span className="text-ink">{r.label}</span>
                <span className="text-ink-faint tabular-nums">
                  {r.value}
                  <span className="ml-1 text-ink-faint/70">· {pct}%</span>
                </span>
              </div>
              <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-page-3">
                <div
                  className="h-full rounded-full bg-navy transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function QuickActions() {
  const items = [
    { href: "/dashboard/cases/new", icon: Plus,    label: "New case" },
    { href: "/dashboard/calendar",  icon: CalIcon, label: "Open calendar" },
    { href: "/dashboard/team",      icon: Users,   label: "Team" },
  ];
  return (
    <section>
      <SectionHeader kicker="Shortcuts" title="Quick actions" compact />
      <ul className="mt-3 divide-y divide-rule border-y border-rule">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className="group flex items-center gap-2.5 py-2.5 text-[13px] text-ink-mute transition-colors hover:text-ink"
              >
                <Icon
                  className="h-[14px] w-[14px] text-ink-faint transition-colors group-hover:text-ink-mute"
                  strokeWidth={1.75}
                />
                <span className="flex-1">{it.label}</span>
                <ArrowUpRight
                  className="h-[13px] w-[13px] text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function SectionHeader({
  kicker,
  title,
  trailing,
  compact = false,
}: {
  kicker: string;
  title: string;
  trailing?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {kicker}
        </p>
        <h2
          className={
            compact
              ? "font-display text-[16px] font-medium leading-tight tracking-tight text-ink-strong mt-0.5"
              : "font-display text-[20px] font-medium leading-tight tracking-tight text-ink-strong mt-0.5"
          }
        >
          {title}
        </h2>
      </div>
      {trailing && (
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {trailing}
        </span>
      )}
    </div>
  );
}
