"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventClickArg } from "@fullcalendar/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCaseStore } from "@/stores/case-store";
import { parseDate } from "@/lib/case-utils";
import type { Case } from "@/types";

type ViewKey = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek";

const VIEWS: { key: ViewKey; label: string }[] = [
  { key: "dayGridMonth", label: "Month" },
  { key: "timeGridWeek", label: "Week" },
  { key: "timeGridDay", label: "Day" },
  { key: "listWeek", label: "List" },
];

export default function CalendarPage() {
  const router = useRouter();
  const cases = useCaseStore((s) => s.cases);
  const isLoading = useCaseStore((s) => s.isLoading);
  const error = useCaseStore((s) => s.error);
  const fetchCases = useCaseStore((s) => s.fetchCases);

  const calendarRef = useRef<FullCalendar | null>(null);
  const [view, setView] = useState<ViewKey>("dayGridMonth");
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const events: EventInput[] = useMemo(() => casesToEvents(cases), [cases]);

  // For diagnostics in the empty state.
  const counts = useMemo(() => countByKind(events), [events]);

  function go(action: "prev" | "next" | "today") {
    const api = calendarRef.current?.getApi();
    if (!api) return;
    if (action === "prev") api.prev();
    if (action === "next") api.next();
    if (action === "today") api.today();
    setTitle(api.view.title);
  }

  function changeView(next: ViewKey) {
    setView(next);
    const api = calendarRef.current?.getApi();
    if (api) {
      api.changeView(next);
      setTitle(api.view.title);
    }
  }

  function onEventClick(arg: EventClickArg) {
    arg.jsEvent.preventDefault();
    const caseId = arg.event.extendedProps.caseId as string | undefined;
    if (caseId) router.push(`/dashboard/cases/${caseId}`);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Schedule
          </p>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
            Calendar
          </h1>
          <p className="text-[13px] text-ink-mute mt-1.5 max-w-[60ch]">
            Filings and hearings drawn from every case on your desk. Click any
            entry to open the underlying case.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => go("prev")}
            aria-label="Previous"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-rule bg-paper text-ink-mute transition-colors hover:border-rule-strong hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => go("next")}
            aria-label="Next"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-rule bg-paper text-ink-mute transition-colors hover:border-rule-strong hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => go("today")}
            className="ml-1 h-8 rounded-md border border-rule bg-paper px-3 text-[12px] text-ink transition-colors hover:border-rule-strong"
          >
            Today
          </button>
          <h2 className="font-display text-[18px] font-medium tracking-tight text-ink-strong ml-3 tabular-nums">
            {title}
          </h2>
        </div>

        <div className="flex items-center rounded-md border border-rule bg-paper p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => changeView(v.key)}
              aria-pressed={view === v.key}
              className={
                view === v.key
                  ? "rounded-[4px] bg-claret-soft px-2.5 py-1 text-[12px] font-medium text-claret-ink"
                  : "rounded-[4px] px-2.5 py-1 text-[12px] text-ink-mute transition-colors hover:text-ink"
              }
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-alarm/30 bg-alarm-soft px-4 py-3 text-[13px] text-alarm"
        >
          Couldn&rsquo;t load cases. {error}
        </div>
      )}

      <div className="cp-calendar rounded-md border border-rule bg-paper p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView={view}
          headerToolbar={false}
          height="auto"
          firstDay={1}
          weekends
          dayMaxEvents={3}
          nowIndicator
          eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          slotLabelFormat={{ hour: "numeric", meridiem: "short" }}
          dayHeaderFormat={{ weekday: "short" }}
          events={events}
          eventClick={onEventClick}
          datesSet={(arg) => setTitle(arg.view.title)}
        />
      </div>

      <Status
        isLoading={isLoading}
        casesLoaded={cases.length}
        events={counts}
      />

      <Legend />
    </div>
  );
}

/* ------------------------------------------------------------------
   Status strip — surfaces what's actually loaded so an empty grid
   isn't ambiguous.
   ------------------------------------------------------------------ */

function Status({
  isLoading,
  casesLoaded,
  events,
}: {
  isLoading: boolean;
  casesLoaded: number;
  events: { hearing: number; filing: number; opened: number };
}) {
  if (isLoading && casesLoaded === 0) {
    return (
      <p className="text-[12px] text-ink-faint">Loading your cases…</p>
    );
  }

  if (casesLoaded === 0) {
    return (
      <div className="rounded-md border border-dashed border-rule bg-paper px-5 py-4 text-[13px] text-ink-mute">
        No cases yet. Create one and it will appear here on its filing or
        hearing date — or, if neither is set, on the day it was opened.
      </div>
    );
  }

  const total = events.hearing + events.filing + events.opened;
  if (total === 0) {
    return (
      <div className="rounded-md border border-dashed border-rule bg-paper px-5 py-4 text-[13px] text-ink-mute">
        {casesLoaded} {casesLoaded === 1 ? "case" : "cases"} loaded, but none
        carry a filing or hearing date and no <code>createdAt</code> we could
        anchor to. Open a case and add a date to see it here.
      </div>
    );
  }

  return (
    <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
      {casesLoaded} cases · {events.hearing} hearings · {events.filing} filings
      {events.opened > 0 ? ` · ${events.opened} opened` : ""}
    </p>
  );
}

/**
 * One case produces up to three calendar entries:
 *   - filing  — `filingDate`, all-day
 *   - hearing — `nextHearingDate`, timed
 *   - opened  — fallback on `createdAt`, only if neither of the above exists,
 *               so every case is at least visible somewhere on the calendar.
 */
function casesToEvents(cases: Case[]): EventInput[] {
  const events: EventInput[] = [];

  for (const c of cases) {
    const hearing = parseDate(c.nextHearingDate);
    const filing = parseDate(c.filingDate);

    if (hearing) {
      events.push({
        id: `${c.id}::hearing`,
        title: c.title,
        start: hearing.toISOString(),
        classNames: ["cp-evt", "cp-evt-hearing", `cp-evt-${c.priority}`],
        extendedProps: { caseId: c.id, kind: "hearing" },
      });
    }

    if (filing) {
      events.push({
        id: `${c.id}::filing`,
        title: c.title,
        start: yyyyMmDd(filing),
        allDay: true,
        classNames: ["cp-evt", "cp-evt-filing", `cp-evt-${c.priority}`],
        extendedProps: { caseId: c.id, kind: "filing" },
      });
    }

    if (!hearing && !filing) {
      const opened = parseDate(c.createdAt);
      if (opened) {
        events.push({
          id: `${c.id}::opened`,
          title: c.title,
          start: yyyyMmDd(opened),
          allDay: true,
          classNames: ["cp-evt", "cp-evt-opened", `cp-evt-${c.priority}`],
          extendedProps: { caseId: c.id, kind: "opened" },
        });
      }
    }
  }

  return events;
}

function countByKind(events: EventInput[]) {
  const counts = { hearing: 0, filing: 0, opened: 0 };
  for (const e of events) {
    const kind = (e.extendedProps as { kind?: string } | undefined)?.kind;
    if (kind === "hearing") counts.hearing += 1;
    else if (kind === "filing") counts.filing += 1;
    else if (kind === "opened") counts.opened += 1;
  }
  return counts;
}

function yyyyMmDd(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-ink-mute">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-3 rounded-sm bg-ink-strong" />
        Hearing
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-3 rounded-sm border border-rule-strong bg-paper" />
        Filing
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-3 rounded-sm border border-dashed border-rule-strong bg-paper" />
        Opened (no scheduled date)
      </span>
      <span className="mx-2 h-3 w-px bg-rule" aria-hidden />
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full cp-dot-high" />
        High
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full cp-dot-medium" />
        Medium
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2 w-2 rounded-full cp-dot-low" />
        Low
      </span>
      <span className="ml-auto text-[11px] uppercase tracking-[0.14em] text-ink-faint">
        Click an entry to open the case
      </span>
    </div>
  );
}
