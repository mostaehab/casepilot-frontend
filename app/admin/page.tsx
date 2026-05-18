"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------
   Illustrative platform data. Replaced with cross-firm aggregate API
   responses once those endpoints exist. The shapes here are stable.
   ------------------------------------------------------------------ */

type FirmRow = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  members: number;
  cases: number;
  plan: "trial" | "solo" | "team" | "firm";
  signedUpAt: string;
  lastActiveAt: string;
  status: "active" | "trial" | "stalled" | "frozen";
};

const FIRMS: FirmRow[] = [
  { id: "f_01", name: "Hartwell & Reyes Law Group",   ownerName: "Mara Hartwell",   ownerEmail: "mara@hartwell-reyes.com",   members: 9, cases: 142, plan: "firm",  signedUpAt: "2025-11-08", lastActiveAt: "2026-05-02T13:48:00", status: "active"  },
  { id: "f_02", name: "Patel Immigration",            ownerName: "Anjali Patel",    ownerEmail: "ap@patelimm.law",           members: 3, cases: 71,  plan: "team",  signedUpAt: "2025-12-14", lastActiveAt: "2026-05-02T11:02:00", status: "active"  },
  { id: "f_03", name: "Lopez Solo",                    ownerName: "Mateo Lopez",     ownerEmail: "mateo@lopezsolo.legal",     members: 1, cases: 18,  plan: "solo",  signedUpAt: "2026-01-05", lastActiveAt: "2026-05-01T22:11:00", status: "active"  },
  { id: "f_04", name: "Summit Corporate Counsel",      ownerName: "Devon Wu",        ownerEmail: "dwu@summit-corp.law",       members: 6, cases: 88,  plan: "firm",  signedUpAt: "2026-02-19", lastActiveAt: "2026-05-02T09:40:00", status: "active"  },
  { id: "f_05", name: "Greenberg Tax Group",           ownerName: "Sara Greenberg",  ownerEmail: "sara@greenbergtax.com",     members: 4, cases: 33,  plan: "team",  signedUpAt: "2026-03-01", lastActiveAt: "2026-04-12T08:20:00", status: "stalled" },
  { id: "f_06", name: "Okafor Family Law",             ownerName: "Chinedu Okafor",  ownerEmail: "chinedu@okaforlaw.co",      members: 2, cases: 11,  plan: "solo",  signedUpAt: "2026-03-18", lastActiveAt: "2026-04-30T17:55:00", status: "trial"   },
  { id: "f_07", name: "Brennan Trial Attorneys",       ownerName: "Patrick Brennan", ownerEmail: "pat@brennantrial.com",      members: 5, cases: 47,  plan: "team",  signedUpAt: "2025-09-22", lastActiveAt: "2026-04-29T14:08:00", status: "active"  },
  { id: "f_08", name: "Kovacs & Daughters",            ownerName: "Eva Kovacs",      ownerEmail: "eva@kovacsattorneys.com",   members: 3, cases: 26,  plan: "team",  signedUpAt: "2026-04-04", lastActiveAt: "2026-05-02T12:31:00", status: "trial"   },
  { id: "f_09", name: "Mendez Real Estate Counsel",    ownerName: "Lina Mendez",     ownerEmail: "lina@mendezre.legal",       members: 1, cases: 4,   plan: "trial", signedUpAt: "2026-04-18", lastActiveAt: "2026-04-18T16:00:00", status: "stalled" },
  { id: "f_10", name: "Northway Criminal Defense",     ownerName: "Owen Northway",   ownerEmail: "owen@northwaydefense.com",  members: 4, cases: 62,  plan: "team",  signedUpAt: "2025-08-11", lastActiveAt: "2026-05-02T08:14:00", status: "active"  },
  { id: "f_11", name: "Adesina Litigation Partners",   ownerName: "Tomi Adesina",    ownerEmail: "tomi@adesinalit.com",       members: 7, cases: 109, plan: "firm",  signedUpAt: "2025-10-30", lastActiveAt: "2026-05-02T07:02:00", status: "active"  },
  { id: "f_12", name: "Chen Immigration",              ownerName: "Lisa Chen",       ownerEmail: "lisa@chenimm.law",          members: 2, cases: 15,  plan: "solo",  signedUpAt: "2026-04-22", lastActiveAt: "2026-04-22T10:45:00", status: "frozen"  },
];

const MATTERS: { id: string; firm: string; note: string; ageDays: number; tone: "alarm" | "warn" }[] = [
  { id: "m_1", firm: "Mendez Real Estate Counsel", note: "Owner email never confirmed",       ageDays: 14, tone: "alarm" },
  { id: "m_2", firm: "Chen Immigration",            note: "Trial expired, no plan selected",   ageDays: 3,  tone: "alarm" },
  { id: "m_3", firm: "Greenberg Tax Group",         note: "No activity in twenty-one days",    ageDays: 21, tone: "warn"  },
  { id: "m_4", firm: "Brennan Trial Attorneys",     note: "Invitation older than thirty days", ageDays: 34, tone: "warn"  },
];

const TOTALS = {
  documentsThisQuarter: 4127,
  errorsToday: 2,
};

/* ------------------------------------------------------------------
   Page.
   ------------------------------------------------------------------ */

export default function AdminPage() {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const sorted = [...FIRMS].sort(
      (a, b) => +new Date(b.lastActiveAt) - +new Date(a.lastActiveAt)
    );
    if (!search) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q) ||
        r.ownerEmail.toLowerCase().includes(q)
    );
  }, [search]);

  const totalUsers = FIRMS.reduce((sum, f) => sum + f.members, 0);
  const totalCases = FIRMS.reduce((sum, f) => sum + f.cases, 0);

  return (
    <div className="space-y-16 animate-fade-in">
      <PageHeader
        firms={FIRMS.length}
        users={totalUsers}
        cases={totalCases}
        documents={TOTALS.documentsThisQuarter}
        errors={TOTALS.errorsToday}
      />

      <Matters />

      <Firms
        rows={visible}
        total={FIRMS.length}
        search={search}
        onSearch={setSearch}
      />
    </div>
  );
}

/* ------------------------------------------------------------------
   Header — editorial title + a single typeset summary line.
   ------------------------------------------------------------------ */

function PageHeader({
  firms,
  users,
  cases,
  documents,
  errors,
}: {
  firms: number;
  users: number;
  cases: number;
  documents: number;
  errors: number;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return (
    <header className="space-y-5">
      <div className="flex items-baseline justify-between gap-6">
        <h1 className="font-display text-[36px] font-medium leading-tight tracking-tight text-ink-strong">
          Platform overview
        </h1>
        <p className="font-display italic text-[14px] text-ink-mute whitespace-nowrap">
          {today}
        </p>
      </div>

      <p className="max-w-[58ch] text-[15px] leading-[1.7] text-ink">
        <span className="tabular-nums">{firms.toLocaleString()}</span> firms on
        the platform,{" "}
        <span className="tabular-nums">{users.toLocaleString()}</span> users,{" "}
        <span className="tabular-nums">{cases.toLocaleString()}</span> cases,
        and{" "}
        <span className="tabular-nums">{documents.toLocaleString()}</span>{" "}
        documents tracked this quarter.
      </p>

      {errors > 0 ? (
        <p className="text-[13px] text-alarm">
          <span className="tabular-nums">{errors}</span> error
          {errors === 1 ? "" : "s"} logged today.
        </p>
      ) : (
        <p className="text-[13px] text-ok">No errors logged today.</p>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------
   Matters — docket-style outstanding items.
   ------------------------------------------------------------------ */

function Matters() {
  if (MATTERS.length === 0) {
    return (
      <Section title="Outstanding matters">
        <p className="text-[14px] text-ink-mute italic">
          Nothing outstanding. The platform is in good order.
        </p>
      </Section>
    );
  }

  const sorted = [...MATTERS].sort(
    (a, b) =>
      (a.tone === b.tone ? 0 : a.tone === "alarm" ? -1 : 1) ||
      b.ageDays - a.ageDays
  );

  return (
    <Section title="Outstanding matters">
      <ol className="border-y border-rule">
        {sorted.map((m) => (
          <li
            key={m.id}
            className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-4 last:border-0"
          >
            <div className="col-span-5 min-w-0">
              <p className="font-display text-[16px] text-ink-strong leading-snug truncate">
                {m.firm}
              </p>
            </div>
            <p className="col-span-5 text-[14px] text-ink leading-snug min-w-0">
              {m.note}
            </p>
            <p
              className={cn(
                "col-span-2 text-right text-[13px] tabular-nums italic",
                m.tone === "alarm" ? "text-alarm" : "text-warn"
              )}
            >
              {m.ageDays} days
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------------------------------------------
   Firms — printed table. Pre-sorted, single search.
   ------------------------------------------------------------------ */

function Firms({
  rows,
  total,
  search,
  onSearch,
}: {
  rows: FirmRow[];
  total: number;
  search: string;
  onSearch: (s: string) => void;
}) {
  return (
    <Section
      title="Firms"
      trailing={
        <span className="font-display italic text-[13px] text-ink-faint tabular-nums">
          {rows.length === total
            ? `${total} on the platform`
            : `${rows.length} of ${total}`}
        </span>
      }
    >
      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-ink-faint"
          strokeWidth={1.75}
        />
        <input
          type="search"
          placeholder="Find a firm by name, owner, or email"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="block h-9 w-full rounded-md border border-rule bg-paper pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-mute italic">
          No firms match that search.
        </p>
      ) : (
        <div className="mt-6">
          <div className="grid grid-cols-12 gap-6 border-b border-rule pb-2 text-[12px] text-ink-faint">
            <div className="col-span-5">Firm</div>
            <div className="col-span-1 text-right tabular-nums">Members</div>
            <div className="col-span-1 text-right tabular-nums">Cases</div>
            <div className="col-span-1">Plan</div>
            <div className="col-span-2">Signed up</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <ul>
            {rows.map((row) => (
              <FirmRowItem key={row.id} row={row} />
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}

function FirmRowItem({ row }: { row: FirmRow }) {
  return (
    <li className="grid grid-cols-12 items-baseline gap-6 border-b border-rule py-4 last:border-0">
      <div className="col-span-5 min-w-0">
        <p className="font-display text-[16px] text-ink-strong leading-snug truncate">
          {row.name}
        </p>
        <p className="text-[12.5px] text-ink-mute truncate mt-0.5">
          {row.ownerName} · {row.ownerEmail}
        </p>
      </div>
      <div className="col-span-1 text-right text-[13.5px] text-ink tabular-nums">
        {row.members}
      </div>
      <div className="col-span-1 text-right text-[13.5px] text-ink tabular-nums">
        {row.cases}
      </div>
      <div className="col-span-1 text-[13.5px] italic text-ink-mute">
        {planLabel(row.plan)}
      </div>
      <div className="col-span-2 text-[13px] text-ink-mute tabular-nums">
        {formatDateLong(row.signedUpAt)}
      </div>
      <div
        className={cn(
          "col-span-2 text-right text-[13.5px] italic",
          statusClass(row.status)
        )}
      >
        {statusLabel(row.status)}
        <span className="ml-2 text-[12px] not-italic text-ink-faint tabular-nums">
          {formatRelative(row.lastActiveAt)}
        </span>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------
   Primitive section.
   ------------------------------------------------------------------ */

function Section({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-3 mb-6">
        <h2 className="font-display text-[24px] font-medium leading-tight tracking-tight text-ink-strong">
          {title}
        </h2>
        {trailing}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------
   Helpers.
   ------------------------------------------------------------------ */

function planLabel(plan: FirmRow["plan"]): string {
  switch (plan) {
    case "trial": return "Trial";
    case "solo":  return "Solo";
    case "team":  return "Team";
    case "firm":  return "Firm";
  }
}

function statusLabel(status: FirmRow["status"]): string {
  switch (status) {
    case "active":  return "Active";
    case "trial":   return "Trial";
    case "stalled": return "Stalled";
    case "frozen":  return "Frozen";
  }
}

function statusClass(status: FirmRow["status"]): string {
  switch (status) {
    case "active":  return "text-ok";
    case "trial":   return "text-ink-mute";
    case "stalled": return "text-warn";
    case "frozen":  return "text-alarm";
  }
}

function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
