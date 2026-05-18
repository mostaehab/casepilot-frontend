"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  FileText,
  FolderOpen,
  CalendarClock,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCaseStore } from "@/stores/case-store";
import { useFileStore } from "@/stores/file-store";
import { useDeadlineStore } from "@/stores/deadline-store";
import { downloadUrl } from "@/services/file-service";
import { useCaseAnalysis, type UseCaseAnalysis } from "@/hooks/use-case-analysis";
import { cn } from "@/lib/utils";
import {
  statusLabel,
  caseTypeLabel,
  priorityLabel,
  statusVariant,
  priorityVariant,
  formatDate,
  formatDateTime,
  formatRelativeDate,
  parseDate,
  toDateInputValue,
  toDateTimeInputValue,
} from "@/lib/case-utils";
import type {
  Case,
  CaseAnalysis,
  CaseAnalysisHint,
  CaseFile,
  Deadline,
  DeadlineType,
  HintSeverity,
} from "@/types";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const selectedCase = useCaseStore((s) => s.selectedCase);
  const isCaseLoading = useCaseStore((s) => s.isLoading);
  const fetchCase = useCaseStore((s) => s.fetchCase);

  const files = useFileStore((s) => s.files);
  const isFilesLoading = useFileStore((s) => s.isLoading);
  const fetchFiles = useFileStore((s) => s.fetchFiles);
  const uploadFile = useFileStore((s) => s.uploadFile);

  const deadlines = useDeadlineStore((s) => s.deadlines);
  const isDeadlinesLoading = useDeadlineStore((s) => s.isLoading);
  const fetchDeadlines = useDeadlineStore((s) => s.fetchDeadlines);

  const analysis = useCaseAnalysis(params.id);

  useEffect(() => {
    if (!params.id) return;
    fetchCase(params.id);
    fetchFiles(params.id);
    fetchDeadlines(params.id);
  }, [params.id, fetchCase, fetchFiles, fetchDeadlines]);

  if (isCaseLoading && !selectedCase) {
    return <CaseSkeleton />;
  }

  if (!selectedCase) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-ink-faint">Case not found.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/cases")}
          className="mt-3"
        >
          Back to cases
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <Link
        href="/dashboard/cases"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
        Back to cases
      </Link>

      <CaseHero caseItem={selectedCase} />

      <TimeSpine caseItem={selectedCase} deadlines={deadlines} />

      <PulseStrip
        caseItem={selectedCase}
        files={files}
        deadlines={deadlines}
      />

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-12 min-w-0">
          <DescriptionSection caseItem={selectedCase} />
          <AnalysisSection
            caseFiles={files.filter((f) => f.caseId === selectedCase.id)}
            analysis={analysis}
          />
          <DocumentsSection
            caseId={selectedCase.id}
            files={files}
            isLoading={isFilesLoading}
            onUpload={uploadFile}
          />
          <DeadlinesSection
            caseId={selectedCase.id}
            deadlines={deadlines}
            isLoading={isDeadlinesLoading}
          />
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <ClientCard caseItem={selectedCase} />
          <CourtCard caseItem={selectedCase} />
          <DigestCard analysis={analysis} />
          <RecordCard caseItem={selectedCase} />
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Hero — editorial header. Kicker + display title + chip row.
   ------------------------------------------------------------------ */

function CaseHero({ caseItem }: { caseItem: Case }) {
  return (
    <header>
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-rule pb-7">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {caseTypeLabel(caseItem.caseType)}
            {caseItem.caseNumber && (
              <>
                {" · "}
                <span className="font-mono normal-case tracking-normal">
                  {caseItem.caseNumber}
                </span>
              </>
            )}
          </p>
          <h1 className="font-display text-[40px] font-medium leading-[1.05] tracking-tight text-ink-strong mt-2 max-w-[28ch]">
            {caseItem.title}
          </h1>
          <p className="font-display italic text-[18px] text-ink-mute mt-2 leading-snug">
            for {caseItem.clientName}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(caseItem.status)}>
              {statusLabel(caseItem.status)}
            </Badge>
            <Badge variant={priorityVariant(caseItem.priority)}>
              {priorityLabel(caseItem.priority)} priority
            </Badge>
            {caseItem.courtName && (
              <Badge variant="neutral">{caseItem.courtName}</Badge>
            )}
          </div>
        </div>

        <Link href={`/dashboard/cases/${caseItem.id}/edit`}>
          <Button variant="outline">
            <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
            Edit case
          </Button>
        </Link>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------
   Time spine — printed-chronology ribbon. Hairline rule with ticks
   for opened / filed / hearing / today / next deadline.
   ------------------------------------------------------------------ */

type SpinePoint = {
  key: string;
  label: string;
  date: Date;
  kind: "opened" | "filed" | "hearing" | "deadline" | "today";
};

type PlacedPoint = SpinePoint & {
  leftPercent: number;
  labelLane: number;
  dateLane: number;
};

function TimeSpine({
  caseItem,
  deadlines,
}: {
  caseItem: Case;
  deadlines: Deadline[];
}) {
  const today = new Date();
  const points: SpinePoint[] = [];

  const opened = parseDate(caseItem.createdAt);
  const filed = parseDate(caseItem.filingDate);
  const hearing = parseDate(caseItem.nextHearingDate);

  if (opened) points.push({ key: "opened", label: "Opened", date: opened, kind: "opened" });
  if (filed) points.push({ key: "filed", label: "Filed", date: filed, kind: "filed" });
  if (hearing) points.push({ key: "hearing", label: "Hearing", date: hearing, kind: "hearing" });

  const upcomingForCase = deadlines
    .filter((d) => d.caseId === caseItem.id && !d.completed)
    .map((d) => ({ d, parsed: parseDate(d.date) }))
    .filter((x): x is { d: Deadline; parsed: Date } => x.parsed !== null)
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

  const nextDeadline = upcomingForCase.find(
    (x) => x.parsed.getTime() >= today.getTime() - MS_PER_DAY
  );
  if (nextDeadline) {
    points.push({
      key: "deadline",
      label: "Next deadline",
      date: nextDeadline.parsed,
      kind: "deadline",
    });
  }

  points.push({ key: "today", label: "Today", date: today, kind: "today" });

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    setContainerWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (points.length < 3) {
    return null;
  }

  const allTimes = points.map((p) => p.date.getTime());
  let min = Math.min(...allTimes);
  let max = Math.max(...allTimes);
  if (min === max) {
    min -= 14 * MS_PER_DAY;
    max += 14 * MS_PER_DAY;
  } else {
    const span = max - min;
    min -= span * 0.08;
    max += span * 0.08;
  }
  const positionOf = (d: Date) =>
    ((d.getTime() - min) / (max - min)) * 100;

  const ordered = [...points].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Width estimates (px). Labels are uppercase 10px with 0.16em tracking.
  const estLabelWidth = (label: string) =>
    Math.max(28, label.length * 6.4 + 8);
  const estDateWidth = 50;
  const laneGap = 8;

  const width = containerWidth || 1;
  const placed: PlacedPoint[] = [];
  for (const p of ordered) {
    const leftPercent = positionOf(p.date);
    const xPx = (leftPercent / 100) * width;
    const lw = estLabelWidth(p.label);
    const dw = estDateWidth;

    let labelLane = 0;
    while (
      placed.some((o) => {
        if (o.labelLane !== labelLane) return false;
        const oxPx = (o.leftPercent / 100) * width;
        const minSep = (estLabelWidth(o.label) + lw) / 2 + laneGap;
        return Math.abs(oxPx - xPx) < minSep;
      })
    ) {
      labelLane++;
    }

    let dateLane = 0;
    while (
      placed.some((o) => {
        if (o.dateLane !== dateLane) return false;
        const oxPx = (o.leftPercent / 100) * width;
        const minSep = (estDateWidth + dw) / 2 + laneGap;
        return Math.abs(oxPx - xPx) < minSep;
      })
    ) {
      dateLane++;
    }

    placed.push({ ...p, leftPercent, labelLane, dateLane });
  }

  const labelLineHeight = 14;
  const dateLineHeight = 16;
  const tickHeight = 18;
  const tickGap = 6;
  const maxLabelLane = Math.max(0, ...placed.map((p) => p.labelLane));
  const maxDateLane = Math.max(0, ...placed.map((p) => p.dateLane));
  const labelAreaHeight = (maxLabelLane + 1) * labelLineHeight;
  const dateAreaHeight = (maxDateLane + 1) * dateLineHeight;
  const tickTop = labelAreaHeight + tickGap;
  const ruleTop = tickTop + Math.round(tickHeight / 2);
  const dateTop = tickTop + tickHeight + tickGap;
  const totalHeight = labelAreaHeight + tickGap + tickHeight + tickGap + dateAreaHeight;

  return (
    <section
      aria-label="Case chronology"
      className="relative px-2 pt-2 pb-1"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint mb-6">
        Chronology
      </p>

      <div
        ref={containerRef}
        className="relative"
        style={{ height: totalHeight }}
      >
        <div
          className="absolute inset-x-0 h-px bg-rule-strong"
          style={{ top: ruleTop }}
          aria-hidden
        />

        {placed.map((p) => {
          const isToday = p.kind === "today";
          const isPast = !isToday && p.date.getTime() < today.getTime();
          const isStrong = p.kind === "deadline" || p.kind === "hearing";

          const labelTop = p.labelLane * labelLineHeight;
          const labelLeaderTop = labelTop + labelLineHeight - 2;
          const labelLeaderHeight = Math.max(0, tickTop - labelLeaderTop);
          const dateLeaderTop = tickTop + tickHeight;
          const dateLeaderHeight = Math.max(
            0,
            tickGap + p.dateLane * dateLineHeight - 2
          );

          return (
            <div
              key={p.key}
              className="absolute"
              style={{ left: `${p.leftPercent}%`, top: 0, height: totalHeight }}
            >
              <span
                className={cn(
                  "absolute -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.16em]",
                  isToday ? "text-claret" : "text-ink-faint"
                )}
                style={{ top: labelTop, left: 0 }}
              >
                {p.label}
              </span>

              {p.labelLane > 0 && (
                <span
                  className={cn(
                    "absolute w-px -translate-x-1/2",
                    isToday ? "bg-claret/40" : "bg-rule"
                  )}
                  style={{
                    top: labelLeaderTop,
                    height: labelLeaderHeight,
                    left: 0,
                  }}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  "absolute w-px -translate-x-1/2",
                  isToday
                    ? "bg-claret"
                    : isStrong
                      ? "bg-ink-strong"
                      : "bg-rule-strong"
                )}
                style={{ top: tickTop, height: tickHeight, left: 0 }}
                aria-hidden
              />

              {p.dateLane > 0 && (
                <span
                  className={cn(
                    "absolute w-px -translate-x-1/2",
                    isToday ? "bg-claret/40" : "bg-rule"
                  )}
                  style={{
                    top: dateLeaderTop,
                    height: dateLeaderHeight,
                    left: 0,
                  }}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  "absolute -translate-x-1/2 whitespace-nowrap text-[12px] tabular-nums",
                  isToday
                    ? "text-claret font-medium"
                    : isPast
                      ? "text-ink-mute"
                      : "text-ink-strong font-medium"
                )}
                style={{
                  top: dateTop + p.dateLane * dateLineHeight,
                  left: 0,
                }}
              >
                {formatShortDate(p.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Pulse strip — 4 dense info cells. No card chrome (continuous rule).
   ------------------------------------------------------------------ */

function PulseStrip({
  caseItem,
  files,
  deadlines,
}: {
  caseItem: Case;
  files: CaseFile[];
  deadlines: Deadline[];
}) {
  const today = new Date();

  const caseFiles = files.filter((f) => f.caseId === caseItem.id);
  const caseDeadlines = deadlines.filter((d) => d.caseId === caseItem.id);

  const sortedDeadlines = [...caseDeadlines]
    .map((d) => ({ d, parsed: parseDate(d.date) }))
    .filter((x): x is { d: Deadline; parsed: Date } => x.parsed !== null)
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

  const openDeadlines = sortedDeadlines.filter((x) => !x.d.completed);
  const nextDeadline = openDeadlines.find(
    (x) => x.parsed.getTime() >= today.getTime() - MS_PER_DAY
  );
  const overdueCount = openDeadlines.filter(
    (x) => x.parsed.getTime() < today.getTime() - MS_PER_DAY
  ).length;

  const opened = parseDate(caseItem.createdAt);
  const daysOpen = opened
    ? Math.max(0, Math.floor((today.getTime() - opened.getTime()) / MS_PER_DAY))
    : null;

  const lastUploadAt = caseFiles
    .map((f) => parseDate(f.uploadedAt))
    .filter((d): d is Date => d !== null)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  // Next event countdown
  const hearing = parseDate(caseItem.nextHearingDate);
  const nextEvent = pickNearest(
    [
      hearing ? { date: hearing, label: "hearing" } : null,
      nextDeadline
        ? { date: nextDeadline.parsed, label: deadlineKindLabel(nextDeadline.d.type) }
        : null,
    ].filter((x): x is { date: Date; label: string } => x !== null)
  );

  const nextEventCountdown = nextEvent ? countdownLabel(nextEvent.date, today) : null;

  const cells: PulseCell[] = [
    {
      label: "Next event",
      value: nextEventCountdown?.value ?? "—",
      hint: nextEvent ? `${nextEvent.label} · ${formatShortDate(nextEvent.date)}` : "Nothing scheduled",
      tone: nextEventCountdown?.tone ?? "neutral",
    },
    {
      label: "Documents",
      value: String(caseFiles.length),
      hint: lastUploadAt ? `Last upload ${formatRelativeDate(lastUploadAt.toISOString())}` : "None uploaded",
      tone: "neutral",
    },
    {
      label: "Deadlines",
      value: String(caseDeadlines.length),
      hint:
        overdueCount > 0
          ? `${overdueCount} past due`
          : nextDeadline
            ? `Next ${formatShortDate(nextDeadline.parsed)}`
            : "None set",
      tone: overdueCount > 0 ? "alarm" : "neutral",
    },
    {
      label: "Days open",
      value: daysOpen !== null ? String(daysOpen) : "—",
      hint: opened ? `Opened ${formatShortDate(opened)}` : "Unknown",
      tone: "neutral",
    },
  ];

  return (
    <dl
      aria-label="Case pulse"
      className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-rule bg-rule lg:grid-cols-4"
    >
      {cells.map((cell) => (
        <div key={cell.label} className="bg-paper px-5 py-4">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            {cell.label}
          </dt>
          <dd
            className={cn(
              "font-display text-[30px] font-medium leading-none tracking-tight tabular-nums mt-2.5",
              cell.tone === "alarm" ? "text-alarm" : "text-ink-strong"
            )}
          >
            {cell.value}
          </dd>
          <p className="text-[11.5px] text-ink-faint mt-2 truncate">
            {cell.hint}
          </p>
        </div>
      ))}
    </dl>
  );
}

type PulseCell = {
  label: string;
  value: string;
  hint: string;
  tone: "neutral" | "alarm" | "warn";
};

/* ------------------------------------------------------------------
   Description section — typographic, 68ch cap.
   ------------------------------------------------------------------ */

function DescriptionSection({ caseItem }: { caseItem: Case }) {
  return (
    <Section kicker="Summary" title="Description">
      {caseItem.description ? (
        <p className="max-w-[68ch] text-[15px] leading-[1.7] text-ink">
          {caseItem.description}
        </p>
      ) : (
        <p className="text-[13.5px] text-ink-faint italic">
          No description yet. Add one from the edit screen so the assistant has
          context when she opens the case.
        </p>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------
   Documents — search + table. Wired to documentStore.
   ------------------------------------------------------------------ */

function DocumentsSection({
  caseId,
  files,
  isLoading,
  onUpload,
}: {
  caseId: string;
  files: CaseFile[];
  isLoading: boolean;
  onUpload: (caseId: string, file: File) => Promise<unknown>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [search, setSearch] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const caseFiles = useMemo(
    () => files.filter((f) => f.caseId === caseId),
    [files, caseId]
  );

  const filtered = useMemo(() => {
    if (!search) return caseFiles;
    const q = search.toLowerCase();
    return caseFiles.filter((f) => f.fileName.toLowerCase().includes(q));
  }, [caseFiles, search]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    try {
      await onUpload(caseId, file);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed. Try again."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Section
      kicker="Reading"
      title="Documents"
      trailing={
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
          {filtered.length} of {caseFiles.length}
        </span>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mt-1">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder="Find a document by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block h-9 w-full rounded-md border border-rule bg-paper pl-9 pr-3 text-[13.5px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
          {isUploading ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {uploadError && (
        <p role="alert" className="mt-3 text-[12px] text-alarm">
          {uploadError}
        </p>
      )}

      <div className="mt-4">
        {isLoading && caseFiles.length === 0 ? (
          <DocsSkeleton />
        ) : filtered.length === 0 ? (
          <DocsEmpty
            hasFilter={!!search}
            onUpload={() => fileInputRef.current?.click()}
          />
        ) : (
          <ul className="divide-y divide-rule border-y border-rule">
            {filtered.map((file) => (
              <DocRow key={file.id} file={file} />
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

function DocRow({ file }: { file: CaseFile }) {
  const href = downloadUrl(file.caseId, file.id);
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "grid grid-cols-12 gap-3 py-3 px-2 -mx-2 items-baseline rounded-sm",
          "transition-colors hover:bg-paper-2 cursor-pointer"
        )}
      >
        <div className="col-span-7 flex items-baseline gap-2.5 min-w-0">
          <FileText
            className="h-3.5 w-3.5 shrink-0 text-ink-faint translate-y-px"
            strokeWidth={1.75}
          />
          <span className="text-[14px] text-ink truncate">{file.fileName}</span>
        </div>
        <span className="col-span-2 text-[11px] uppercase tracking-[0.12em] text-ink-faint tabular-nums">
          {shortMimeLabel(file.fileType)}
        </span>
        <span className="col-span-1 text-[12px] text-ink-mute tabular-nums">
          {formatBytes(file.fileSize)}
        </span>
        <span className="col-span-2 text-[12px] text-ink-faint tabular-nums text-right truncate">
          {formatRelativeDate(file.uploadedAt)}
        </span>
      </a>
    </li>
  );
}

function DocsSkeleton() {
  return (
    <ul className="divide-y divide-rule border-y border-rule">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="grid grid-cols-12 gap-3 py-3.5 px-2">
          <div className="col-span-7 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-1 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-paper-3 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function DocsEmpty({
  hasFilter,
  onUpload,
}: {
  hasFilter: boolean;
  onUpload: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-rule bg-paper py-12 px-6 text-center">
      <FolderOpen
        className="mx-auto h-5 w-5 text-ink-faint"
        strokeWidth={1.5}
      />
      <p className="mt-3 text-[13.5px] text-ink-mute max-w-[42ch] mx-auto">
        {hasFilter
          ? "No documents match that search."
          : "No documents yet. Upload the first filing, contract, or exhibit to start the file."}
      </p>
      {!hasFilter && (
        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={onUpload}>
            <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
            Upload document
          </Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Deadlines — chronological list, grouped past-due / upcoming.
   Stateful: handles inline create, click-to-edit, delete, and toggling
   the completed flag. All mutations go through the deadline store; the
   store updates local state optimistically so no refetch is needed.
   ------------------------------------------------------------------ */

type DeadlineFormMode = { kind: "idle" } | { kind: "create" } | { kind: "edit"; id: string };

function DeadlinesSection({
  caseId,
  deadlines,
  isLoading,
}: {
  caseId: string;
  deadlines: Deadline[];
  isLoading: boolean;
}) {
  const createDeadline = useDeadlineStore((s) => s.createDeadline);
  const updateDeadline = useDeadlineStore((s) => s.updateDeadline);
  const deleteDeadline = useDeadlineStore((s) => s.deleteDeadline);
  const setCompleted = useDeadlineStore((s) => s.setCompleted);

  const [mode, setMode] = useState<DeadlineFormMode>({ kind: "idle" });
  const [pendingId, setPendingId] = useState<string | null>(null);

  const today = new Date();

  const enriched = deadlines
    .map((d) => ({ d, parsed: parseDate(d.date) }))
    .filter((x): x is { d: Deadline; parsed: Date } => x.parsed !== null)
    .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

  const past = enriched.filter(
    (x) => !x.d.completed && x.parsed.getTime() < today.getTime() - MS_PER_DAY
  );
  const upcoming = enriched.filter(
    (x) => !x.d.completed && x.parsed.getTime() >= today.getTime() - MS_PER_DAY
  );
  const done = enriched.filter((x) => x.d.completed);

  const editing =
    mode.kind === "edit" ? deadlines.find((d) => d.id === mode.id) ?? null : null;

  async function handleSubmit(values: DeadlineFormValues) {
    const iso = formValuesToIso(values);
    if (mode.kind === "create") {
      await createDeadline({
        caseId,
        title: values.title,
        type: values.type,
        date: iso,
        allDay: values.allDay,
        description: values.description || undefined,
      });
    } else if (mode.kind === "edit") {
      await updateDeadline(caseId, mode.id, {
        title: values.title,
        type: values.type,
        date: iso,
        allDay: values.allDay,
        // Empty string → null on the wire, clearing the description.
        description: values.description,
      });
    }
    setMode({ kind: "idle" });
  }

  async function handleDelete(eventId: string) {
    setPendingId(eventId);
    try {
      await deleteDeadline(caseId, eventId);
      if (mode.kind === "edit" && mode.id === eventId) {
        setMode({ kind: "idle" });
      }
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggle(deadline: Deadline) {
    setPendingId(deadline.id);
    try {
      await setCompleted(caseId, deadline.id, !deadline.completed);
    } finally {
      setPendingId(null);
    }
  }

  const isFormOpen = mode.kind !== "idle";

  return (
    <Section
      kicker="Calendar"
      title="Deadlines"
      trailing={
        <div className="flex items-center gap-4">
          <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
            {enriched.length} {enriched.length === 1 ? "item" : "items"}
          </span>
          {!isFormOpen && enriched.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMode({ kind: "create" })}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Add
            </Button>
          )}
        </div>
      }
    >
      {isFormOpen && (
        <DeadlineForm
          key={mode.kind === "edit" ? mode.id : "create"}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => setMode({ kind: "idle" })}
          onDelete={editing ? () => handleDelete(editing.id) : undefined}
        />
      )}

      {isLoading && enriched.length === 0 ? (
        <DeadlinesSkeleton />
      ) : enriched.length === 0 ? (
        !isFormOpen && (
          <DeadlinesEmpty onAdd={() => setMode({ kind: "create" })} />
        )
      ) : (
        <div className="mt-4 space-y-7">
          {past.length > 0 && (
            <DeadlineGroup
              label="Past due"
              tone="alarm"
              items={past}
              today={today}
              pendingId={pendingId}
              editingId={mode.kind === "edit" ? mode.id : null}
              onEdit={(id) => setMode({ kind: "edit", id })}
              onToggle={handleToggle}
            />
          )}
          {upcoming.length > 0 && (
            <DeadlineGroup
              label="Upcoming"
              tone="neutral"
              items={upcoming}
              today={today}
              pendingId={pendingId}
              editingId={mode.kind === "edit" ? mode.id : null}
              onEdit={(id) => setMode({ kind: "edit", id })}
              onToggle={handleToggle}
            />
          )}
          {done.length > 0 && (
            <DeadlineGroup
              label="Completed"
              tone="neutral"
              items={done}
              today={today}
              pendingId={pendingId}
              editingId={mode.kind === "edit" ? mode.id : null}
              onEdit={(id) => setMode({ kind: "edit", id })}
              onToggle={handleToggle}
            />
          )}
        </div>
      )}
    </Section>
  );
}

function DeadlineGroup({
  label,
  tone,
  items,
  today,
  pendingId,
  editingId,
  onEdit,
  onToggle,
}: {
  label: string;
  tone: "alarm" | "neutral";
  items: { d: Deadline; parsed: Date }[];
  today: Date;
  pendingId: string | null;
  editingId: string | null;
  onEdit: (id: string) => void;
  onToggle: (deadline: Deadline) => void;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-[10px] font-semibold uppercase tracking-[0.18em]",
          tone === "alarm" ? "text-alarm" : "text-ink-faint"
        )}
      >
        {label}
      </p>
      <ul className="mt-3 divide-y divide-rule border-y border-rule">
        {items.map(({ d, parsed }) => (
          <DeadlineRow
            key={d.id}
            deadline={d}
            parsed={parsed}
            today={today}
            isPending={pendingId === d.id}
            isEditing={editingId === d.id}
            onEdit={() => onEdit(d.id)}
            onToggle={() => onToggle(d)}
          />
        ))}
      </ul>
    </div>
  );
}

function DeadlineRow({
  deadline,
  parsed,
  today,
  isPending,
  isEditing,
  onEdit,
  onToggle,
}: {
  deadline: Deadline;
  parsed: Date;
  today: Date;
  isPending: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const countdown = countdownLabel(parsed, today);
  const completed = deadline.completed;
  return (
    <li
      className={cn(
        "grid grid-cols-12 gap-3 items-baseline py-3.5 px-2 -mx-2 rounded-sm transition-colors",
        isEditing ? "bg-paper-2" : "hover:bg-paper-2",
        isPending && "opacity-60"
      )}
    >
      <div className="col-span-1 flex items-center">
        <button
          type="button"
          onClick={onToggle}
          disabled={isPending}
          aria-pressed={completed}
          aria-label={completed ? "Mark as not done" : "Mark as done"}
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
            "focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2",
            completed
              ? "bg-ink-strong border-ink-strong text-page"
              : "border-rule-strong hover:border-ink-mute"
          )}
        >
          {completed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
        </button>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="col-span-11 grid grid-cols-11 gap-3 items-baseline text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2 rounded-sm"
      >
        <div className="col-span-2 flex flex-col">
          <span className="flex items-baseline gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {parsed.toLocaleDateString("en-US", { weekday: "short" })}
            </span>
            <span
              className={cn(
                "text-[13px] font-medium tabular-nums",
                completed ? "text-ink-faint line-through" : "text-ink"
              )}
            >
              {formatShortDate(parsed)}
            </span>
          </span>
          {!deadline.allDay && (
            <span
              className={cn(
                "text-[11px] tabular-nums mt-0.5",
                completed ? "text-ink-faint line-through" : "text-ink-mute"
              )}
            >
              {parsed.toLocaleTimeString(undefined, {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        <div className="col-span-6 min-w-0">
          <p
            className={cn(
              "text-[14px] truncate",
              completed ? "text-ink-faint line-through" : "text-ink"
            )}
          >
            {deadline.title}
          </p>
          {deadline.description && (
            <p className="mt-0.5 text-[12px] text-ink-faint truncate">
              {deadline.description}
            </p>
          )}
        </div>
        <div className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-mute">
          {deadlineKindLabel(deadline.type)}
        </div>
        <div
          className={cn(
            "col-span-1 text-right text-[12px] tabular-nums",
            completed
              ? "text-ink-faint"
              : countdown.tone === "alarm"
                ? "text-alarm"
                : countdown.tone === "warn"
                  ? "text-warn"
                  : "text-ink-mute"
          )}
        >
          {completed ? "done" : countdown.value}
        </div>
      </button>
    </li>
  );
}

function DeadlinesSkeleton() {
  return (
    <ul className="mt-4 divide-y divide-rule border-y border-rule">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="grid grid-cols-12 gap-3 py-3.5">
          <div className="col-span-2 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-7 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-2 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-1 h-3 rounded bg-paper-3 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}

function DeadlinesEmpty({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-4 rounded-md border border-dashed border-rule bg-paper py-10 px-6 text-center">
      <CalendarClock
        className="mx-auto h-5 w-5 text-ink-faint"
        strokeWidth={1.5}
      />
      <p className="mt-3 text-[13.5px] text-ink-mute max-w-[42ch] mx-auto">
        No deadlines yet. Add hearings, filing deadlines, and follow-ups so they
        show up on your calendar.
      </p>
      <div className="mt-4">
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
          Add deadline
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Deadline create/edit form. Pre-populated when `initial` is set.
   Native date/time inputs to avoid pulling in a picker library.
   ------------------------------------------------------------------ */

/**
 * Form-local shape. `date` / `time` are the values bound to the native
 * `<input type="date">` / `<input type="datetime-local">` elements; the
 * `allDay` flag decides which input the form renders, and `formValuesToIso`
 * collapses them back to the single ISO datetime the wire wants.
 */
type DeadlineFormValues = {
  title: string;
  /** YYYY-MM-DD when allDay, YYYY-MM-DDTHH:MM otherwise. */
  date: string;
  allDay: boolean;
  type: DeadlineType;
  description: string;
};

function emptyFormValues(): DeadlineFormValues {
  return { title: "", date: "", allDay: true, type: "deadline", description: "" };
}

function valuesFromDeadline(d: Deadline): DeadlineFormValues {
  return {
    title: d.title,
    date: d.allDay ? toDateInputValue(d.date) : toDateTimeInputValue(d.date),
    allDay: d.allDay,
    type: d.type,
    description: d.description ?? "",
  };
}

/**
 * Convert the form value to a UTC ISO string for the wire. All-day events
 * anchor to UTC midnight so the date doesn't shift when crossing zones.
 */
function formValuesToIso(values: DeadlineFormValues): string {
  if (values.allDay) {
    return `${values.date}T00:00:00.000Z`;
  }
  return new Date(values.date).toISOString();
}

function DeadlineForm({
  initial,
  onSubmit,
  onCancel,
  onDelete,
}: {
  initial: Deadline | null;
  onSubmit: (values: DeadlineFormValues) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => Promise<void>;
}) {
  const [values, setValues] = useState<DeadlineFormValues>(() =>
    initial ? valuesFromDeadline(initial) : emptyFormValues()
  );
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = initial !== null;

  function update<K extends keyof DeadlineFormValues>(
    key: K,
    value: DeadlineFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!values.date) {
      setError("Pick a date.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ ...values, title: values.title.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    setSubmitting(true);
    try {
      await onDelete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-md border border-rule bg-paper-2 p-5 space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {isEdit ? "Edit deadline" : "New deadline"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.75} />
        </button>
      </div>

      <DeadlineFormField label="Title">
        <input
          type="text"
          value={values.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="e.g. Motion to suppress — filing deadline"
          className="block h-9 w-full rounded-md border border-rule bg-paper px-3 text-[13.5px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          autoFocus
        />
      </DeadlineFormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DeadlineFormField
          label={values.allDay ? "Date" : "Date & time"}
          trailing={
            <label className="inline-flex items-center gap-1.5 text-[11px] text-ink-mute cursor-pointer">
              <input
                type="checkbox"
                checked={values.allDay}
                onChange={(e) => {
                  const nextAllDay = e.target.checked;
                  // Convert between input formats when the flag flips so the
                  // user doesn't lose what they typed.
                  setValues((v) => ({
                    ...v,
                    allDay: nextAllDay,
                    date: convertDateInputValue(v.date, v.allDay, nextAllDay),
                  }));
                }}
                className="h-3 w-3 accent-navy"
              />
              All day
            </label>
          }
        >
          <input
            type={values.allDay ? "date" : "datetime-local"}
            value={values.date}
            onChange={(e) => update("date", e.target.value)}
            className="block h-9 w-full rounded-md border border-rule bg-paper px-3 text-[13.5px] text-ink transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </DeadlineFormField>
        <DeadlineFormField label="Type">
          <select
            value={values.type}
            onChange={(e) => update("type", e.target.value as DeadlineType)}
            className="block h-9 w-full rounded-md border border-rule bg-paper px-3 text-[13.5px] text-ink transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          >
            <option value="deadline">Deadline</option>
            <option value="filing">Filing</option>
            <option value="hearing">Hearing</option>
            <option value="meeting">Meeting</option>
            <option value="reminder">Reminder</option>
            <option value="other">Other</option>
          </select>
        </DeadlineFormField>
      </div>

      <DeadlineFormField label="Notes (optional)">
        <textarea
          value={values.description}
          onChange={(e) => update("description", e.target.value)}
          rows={2}
          placeholder="Anything you'll want to remember when this comes up."
          className="block w-full rounded-md border border-rule bg-paper px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
        />
      </DeadlineFormField>

      {error && (
        <p role="alert" className="text-[12px] text-alarm">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          {isEdit && onDelete && (
            confirmingDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-ink-mute">Delete this?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Delete
                </Button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="text-[12px] text-ink-faint underline-offset-2 hover:text-ink hover:underline"
                >
                  Keep
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint underline-offset-2 hover:text-alarm hover:underline disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                Delete
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-8 items-center justify-center gap-2 rounded-md bg-navy px-3 text-[13px] font-medium text-page transition-[background-color,opacity] duration-150 hover:bg-navy-hover disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add deadline"}
          </button>
        </div>
      </div>
    </form>
  );
}

function DeadlineFormField({
  label,
  trailing,
  children,
}: {
  label: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.14em] text-ink-faint">
        <span>{label}</span>
        {trailing && <span className="normal-case tracking-normal">{trailing}</span>}
      </span>
      {children}
    </label>
  );
}

/**
 * Reshape a partial form date when the user toggles "All day". Keeps the
 * date portion in both directions; adds T00:00 going to datetime-local and
 * strips the time going back.
 */
function convertDateInputValue(
  value: string,
  wasAllDay: boolean,
  nextAllDay: boolean
): string {
  if (wasAllDay === nextAllDay || !value) return value;
  if (nextAllDay) {
    // datetime-local → date: take the YYYY-MM-DD prefix.
    return value.slice(0, 10);
  }
  // date → datetime-local: pin to 09:00 as a reasonable default.
  return `${value}T09:00`;
}

/* ------------------------------------------------------------------
   Right rail — Client, Court, AI digest, Record.
   ------------------------------------------------------------------ */

function ClientCard({ caseItem }: { caseItem: Case }) {
  return (
    <Section kicker="Client" title={caseItem.clientName} dense>
      <dl className="space-y-2.5 text-[13px]">
        {caseItem.clientEmail && (
          <DetailRow label="Email" value={caseItem.clientEmail} mono={false} />
        )}
        {caseItem.clientPhone && (
          <DetailRow label="Phone" value={caseItem.clientPhone} mono />
        )}
        {caseItem.clientNationalNumber && (
          <DetailRow
            label="National no."
            value={caseItem.clientNationalNumber}
            mono
          />
        )}
        {!caseItem.clientEmail &&
          !caseItem.clientPhone &&
          !caseItem.clientNationalNumber && (
            <p className="text-[12.5px] text-ink-faint italic">
              No client contact details on file.
            </p>
          )}
      </dl>
    </Section>
  );
}

function CourtCard({ caseItem }: { caseItem: Case }) {
  if (!caseItem.courtName && !caseItem.filingDate && !caseItem.nextHearingDate) {
    return null;
  }
  return (
    <Section kicker="Court" title="Filing & hearings" dense>
      <dl className="space-y-2.5 text-[13px]">
        {caseItem.courtName && (
          <DetailRow label="Court" value={caseItem.courtName} mono={false} />
        )}
        {caseItem.filingDate && (
          <DetailRow label="Filed" value={formatDate(caseItem.filingDate)} />
        )}
        {caseItem.nextHearingDate && (
          <DetailRow
            label="Next hearing"
            value={formatDateTime(caseItem.nextHearingDate)}
          />
        )}
      </dl>
    </Section>
  );
}

function DigestCard({ analysis }: { analysis: UseCaseAnalysis }) {
  const { state, history } = analysis;

  if (state.status === "running") {
    return (
      <Section kicker="Reading" title="Digest" dense>
        <p className="text-[13px] leading-[1.65] text-ink-mute italic">
          Analyzing the case&hellip;
        </p>
      </Section>
    );
  }

  if (state.status === "success") {
    const a = state.analysis;
    const hintCount = a.hints?.length ?? 0;
    const critical =
      a.hints?.filter((h) => h.severity === "critical").length ?? 0;
    return (
      <Section kicker="Reading" title="Digest" dense>
        <dl className="space-y-2.5 text-[13px]">
          <DetailRow
            label="Hints"
            value={
              critical > 0 ? `${hintCount} (${critical} critical)` : String(hintCount)
            }
          />
          {a.completedAt && (
            <DetailRow label="Run" value={formatRelativeDate(a.completedAt)} />
          )}
          <DetailRow label="Runs" value={String(history.length)} />
        </dl>
      </Section>
    );
  }

  return (
    <Section kicker="Reading" title="Digest" dense>
      <p className="text-[12.5px] text-ink-faint italic">
        No analysis yet. Run one from the panel above to surface a summary
        and hints.
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------
   AI Analysis section — summary + hints from Claude Sonnet 4.6.
   Triggered on demand; persists each run.
   ------------------------------------------------------------------ */

function AnalysisSection({
  caseFiles,
  analysis,
}: {
  caseFiles: CaseFile[];
  analysis: UseCaseAnalysis;
}) {
  const { state, history, run, cancel, select } = analysis;
  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fileCount = caseFiles.length;
  const readableCount = caseFiles.filter((f) => isReadableForAnalysis(f.fileType)).length;
  const skipped = fileCount - readableCount;

  const isRunning = state.status === "running";
  const currentId =
    state.status === "success" ? state.analysis.id : null;

  function onRun() {
    void run(
      instructions.trim().length > 0
        ? { instructions: instructions.trim() }
        : undefined,
    );
  }

  return (
    <Section
      kicker="Assistant"
      title="AI analysis"
      trailing={
        history.length > 1 && (
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-faint transition-colors hover:text-ink"
          >
            <History className="h-3 w-3" strokeWidth={1.75} />
            {history.length} runs
          </button>
        )
      }
    >
      {fileCount === 0 ? (
        <AnalysisEmpty />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-1">
            <p className="text-[12.5px] text-ink-faint">
              {isRunning
                ? "Reading the case file. This can take up to a minute."
                : `${fileCount} ${fileCount === 1 ? "document" : "documents"} on file`}
              {!isRunning && skipped > 0 && (
                <>
                  {" · "}
                  <span className="text-warn">
                    {skipped} can&rsquo;t be read by the model
                  </span>
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              {!isRunning && (
                <button
                  type="button"
                  onClick={() => setShowInstructions((v) => !v)}
                  className="text-[12px] text-ink-faint underline-offset-2 hover:text-ink hover:underline"
                >
                  {showInstructions ? "Hide guidance" : "Add guidance"}
                </button>
              )}
              {isRunning ? (
                <Button size="sm" variant="outline" onClick={cancel}>
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Cancel
                </Button>
              ) : (
                <Button size="sm" variant="primary" onClick={onRun}>
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {state.status === "success" ? "Re-analyze" : "Analyze case"}
                </Button>
              )}
            </div>
          </div>

          {showInstructions && !isRunning && (
            <div className="mt-3">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 2000))}
                placeholder="Optional — focus the model on something specific (deadlines, contradictions, missing evidence&hellip;)."
                rows={3}
                className="block w-full rounded-md border border-rule bg-paper px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
              />
              <p className="mt-1 text-[11px] text-ink-faint tabular-nums">
                {instructions.length} / 2000
              </p>
            </div>
          )}

          {state.status === "error" && (
            <p role="alert" className="mt-4 text-[13px] text-alarm">
              {state.message}
            </p>
          )}

          {isRunning && <AnalysisRunningSkeleton />}

          {state.status === "success" && (
            <AnalysisView analysis={state.analysis} />
          )}

          {showHistory && history.length > 0 && (
            <AnalysisHistory
              history={history}
              currentId={currentId}
              onSelect={(a) => {
                select(a);
                setShowHistory(false);
              }}
            />
          )}
        </>
      )}
    </Section>
  );
}

function AnalysisEmpty() {
  return (
    <div className="mt-4 rounded-md border border-dashed border-rule bg-paper py-10 px-6 text-center">
      <Sparkles className="mx-auto h-5 w-5 text-ink-faint" strokeWidth={1.5} />
      <p className="mt-3 text-[13.5px] text-ink-mute max-w-[42ch] mx-auto">
        Upload at least one document to run an analysis. The model reads PDFs,
        images, and plain text from the case file.
      </p>
    </div>
  );
}

function AnalysisRunningSkeleton() {
  return (
    <div className="mt-5 space-y-3" aria-live="polite" aria-busy="true">
      <div className="h-3 w-24 rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-full rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-[92%] rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-[75%] rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-20 mt-6 rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-[60%] rounded bg-paper-3 animate-pulse" />
      <div className="h-3 w-[55%] rounded bg-paper-3 animate-pulse" />
    </div>
  );
}

function AnalysisView({ analysis }: { analysis: CaseAnalysis }) {
  const hints = analysis.hints ?? [];
  return (
    <article className="mt-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Summary
      </p>
      <p className="mt-2 max-w-[68ch] text-[15px] leading-[1.7] text-ink">
        {analysis.summary || (
          <span className="italic text-ink-faint">
            The model returned no summary for this run.
          </span>
        )}
      </p>

      <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Hints {hints.length > 0 && <span className="tabular-nums">({hints.length})</span>}
      </p>
      {hints.length === 0 ? (
        <p className="mt-2 text-[13.5px] text-ink-faint italic">
          No hints surfaced.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {hints.map((h, i) => (
            <HintRow key={`${analysis.id}-${i}`} hint={h} />
          ))}
        </ul>
      )}

      <p className="mt-6 text-[11px] text-ink-faint">
        {analysis.model}
        {analysis.completedAt && (
          <> · finished {new Date(analysis.completedAt).toLocaleString()}</>
        )}
      </p>
    </article>
  );
}

function HintRow({ hint }: { hint: CaseAnalysisHint }) {
  const tone = severityTone(hint.severity);
  return (
    <li className="grid grid-cols-12 gap-3 py-4 items-start">
      <div className="col-span-1 pt-0.5">
        <SeverityGlyph severity={hint.severity} />
      </div>
      <div className="col-span-9 min-w-0">
        <p className="text-[14px] font-medium text-ink-strong leading-snug">
          {hint.title}
        </p>
        <p className="mt-1 text-[13px] leading-[1.55] text-ink-mute max-w-[68ch]">
          {hint.detail}
        </p>
      </div>
      <div className="col-span-2 text-right">
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-[0.16em]",
            tone,
          )}
        >
          {severityLabel(hint.severity)}
        </span>
      </div>
    </li>
  );
}

function SeverityGlyph({ severity }: { severity: HintSeverity }) {
  const tone = severityTone(severity);
  const cls = cn("h-4 w-4", tone);
  if (severity === "critical") {
    return <AlertOctagon className={cls} strokeWidth={1.75} />;
  }
  if (severity === "warning") {
    return <AlertTriangle className={cls} strokeWidth={1.75} />;
  }
  return <Info className={cls} strokeWidth={1.75} />;
}

function severityTone(severity: HintSeverity): string {
  if (severity === "critical") return "text-alarm";
  if (severity === "warning") return "text-warn";
  return "text-ink-mute";
}

function severityLabel(severity: HintSeverity): string {
  if (severity === "critical") return "Critical";
  if (severity === "warning") return "Warning";
  return "Info";
}

function AnalysisHistory({
  history,
  currentId,
  onSelect,
}: {
  history: CaseAnalysis[];
  currentId: string | null;
  onSelect: (a: CaseAnalysis) => void;
}) {
  return (
    <div className="mt-6 border-t border-rule pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Past runs
      </p>
      <ul className="mt-2 divide-y divide-rule border-y border-rule">
        {history.map((a) => {
          const isCurrent = a.id === currentId;
          const isFailed = a.status === "failed";
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => !isFailed && onSelect(a)}
                disabled={isFailed}
                className={cn(
                  "grid grid-cols-12 gap-3 py-3 px-2 -mx-2 items-baseline w-full text-left rounded-sm",
                  "transition-colors",
                  isFailed
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-paper-2 cursor-pointer",
                  isCurrent && "bg-paper-2",
                )}
              >
                <span className="col-span-3 text-[12px] tabular-nums text-ink">
                  {formatRelativeDate(a.createdAt)}
                </span>
                <span className="col-span-7 truncate text-[13px] text-ink-mute">
                  {a.summary ?? (a.error || "—")}
                </span>
                <span
                  className={cn(
                    "col-span-2 text-right text-[10px] uppercase tracking-[0.16em]",
                    isFailed
                      ? "text-alarm"
                      : isCurrent
                        ? "text-ink-strong"
                        : "text-ink-faint",
                  )}
                >
                  {isFailed ? "Failed" : isCurrent ? "Viewing" : "Open"}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * Which MIME types the model actually reads (per docs/ai-case-analysis.md §8).
 * Only legacy `.doc` (application/msword) is sent as a placeholder; everything
 * else listed in the docs is read natively or server-extracted.
 */
function isReadableForAnalysis(mime: string | undefined): boolean {
  if (!mime) return false;
  if (mime === "application/msword") return false; // legacy .doc, not extracted
  if (mime === "application/pdf") return true;
  if (mime === "text/plain" || mime === "text/csv") return true;
  if (
    mime === "image/jpeg" ||
    mime === "image/png" ||
    mime === "image/heic" ||
    mime === "image/heif"
  ) {
    return true;
  }
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime === "application/vnd.ms-excel"
  ) {
    return true;
  }
  return false;
}

function RecordCard({ caseItem }: { caseItem: Case }) {
  return (
    <Section kicker="Record" title="Audit" dense>
      <dl className="space-y-2.5 text-[13px]">
        <DetailRow label="Created" value={formatDate(caseItem.createdAt)} />
        <DetailRow label="Updated" value={formatDate(caseItem.updatedAt)} />
        <DetailRow label="ID" value={caseItem.id} mono />
      </dl>
    </Section>
  );
}

/* ------------------------------------------------------------------
   Primitives.
   ------------------------------------------------------------------ */

function Section({
  kicker,
  title,
  trailing,
  dense,
  children,
}: {
  kicker: string;
  title: string;
  trailing?: React.ReactNode;
  dense?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {kicker}
          </p>
          <h2
            className={cn(
              "font-display font-medium leading-tight tracking-tight text-ink-strong mt-1",
              dense ? "text-[16px]" : "text-[20px]"
            )}
          >
            {title}
          </h2>
        </div>
        {trailing}
      </div>
      <div className={cn(dense ? "mt-3" : "mt-4")}>{children}</div>
    </section>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-rule pb-2 last:border-0 last:pb-0">
      <dt className="text-[11px] uppercase tracking-[0.12em] text-ink-faint">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[13px] text-ink truncate max-w-[60%] text-right",
          mono && "font-mono text-[12.5px]"
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function CaseSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="h-3 w-32 rounded bg-paper-3 animate-pulse" />
      <div className="space-y-3 border-b border-rule pb-7">
        <div className="h-3 w-44 rounded bg-paper-3 animate-pulse" />
        <div className="h-9 w-2/3 rounded bg-paper-3 animate-pulse" />
        <div className="h-4 w-1/3 rounded bg-paper-3 animate-pulse" />
      </div>
      <div className="grid grid-cols-4 gap-px overflow-hidden rounded-md border border-rule bg-rule">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-paper px-5 py-5 space-y-3">
            <div className="h-3 w-20 rounded bg-paper-3 animate-pulse" />
            <div className="h-7 w-16 rounded bg-paper-3 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Utilities — local. Do not bleed into shared modules until reused.
   ------------------------------------------------------------------ */

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Render the MIME type as a short uppercase token, e.g. "PDF", "DOCX". */
function shortMimeLabel(mime: string | undefined): string {
  if (!mime) return "FILE";
  const map: Record<string, string> = {
    "application/pdf": "PDF",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
    "application/vnd.ms-excel": "XLS",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "XLSX",
    "image/jpeg": "JPG",
    "image/png": "PNG",
    "image/heic": "HEIC",
    "image/heif": "HEIF",
    "text/plain": "TXT",
    "text/csv": "CSV",
  };
  if (map[mime]) return map[mime];
  const sub = mime.split("/")[1] ?? mime;
  return sub.split(".").pop()!.toUpperCase().slice(0, 5);
}

function deadlineKindLabel(kind: Deadline["type"]): string {
  switch (kind) {
    case "hearing":
      return "Hearing";
    case "filing":
      return "Filing";
    case "deadline":
      return "Deadline";
    case "meeting":
      return "Meeting";
    case "reminder":
      return "Reminder";
    default:
      return "Other";
  }
}

function countdownLabel(
  date: Date,
  reference: Date
): { value: string; tone: "alarm" | "warn" | "neutral" } {
  const startOf = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round(
    (startOf(date) - startOf(reference)) / MS_PER_DAY
  );

  if (diffDays === 0) return { value: "today", tone: "alarm" };
  if (diffDays === 1) return { value: "tomorrow", tone: "warn" };
  if (diffDays === -1) return { value: "yesterday", tone: "alarm" };
  if (diffDays < 0)
    return { value: `${Math.abs(diffDays)}d ago`, tone: "alarm" };
  if (diffDays <= 3) return { value: `in ${diffDays}d`, tone: "warn" };
  if (diffDays <= 14) return { value: `in ${diffDays}d`, tone: "neutral" };
  return { value: formatShortDate(date), tone: "neutral" };
}

function pickNearest(
  candidates: { date: Date; label: string }[]
): { date: Date; label: string } | null {
  if (candidates.length === 0) return null;
  const today = new Date();
  // Prefer future, fall back to most recent past
  const futures = candidates
    .filter((c) => c.date.getTime() >= today.getTime() - MS_PER_DAY)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (futures.length > 0) return futures[0];
  return candidates.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}
