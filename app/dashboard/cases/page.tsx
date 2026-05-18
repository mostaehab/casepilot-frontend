"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, X, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useCaseStore } from "@/stores/case-store";
import {
  CASE_STATUSES,
  CASE_TYPES,
  CASE_PRIORITIES,
  statusLabel,
  caseTypeLabel,
  priorityLabel,
  statusVariant,
  priorityVariant,
  formatRelativeDate,
} from "@/lib/case-utils";
import type { Case, CaseStatus, CaseType, CasePriority } from "@/types";
import { cn } from "@/lib/utils";

export default function CasesPage() {
  const cases = useCaseStore((s) => s.cases);
  const isLoading = useCaseStore((s) => s.isLoading);
  const fetchCases = useCaseStore((s) => s.fetchCases);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<CaseStatus | "">("");
  const [caseType, setCaseType] = useState<CaseType | "">("");
  const [priority, setPriority] = useState<CasePriority | "">("");

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filtered = useMemo(() => {
    let result = cases;
    if (status) result = result.filter((c) => c.status === status);
    if (caseType) result = result.filter((c) => c.caseType === caseType);
    if (priority) result = result.filter((c) => c.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [cases, status, caseType, priority, search]);

  const hasFilters = !!(search || status || caseType || priority);

  function clearFilters() {
    setSearch("");
    setStatus("");
    setCaseType("");
    setPriority("");
  }

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Index
          </p>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
            Cases
          </h1>
          <p className="text-[13px] text-ink-mute mt-1.5">
            {filtered.length} of {cases.length} {cases.length === 1 ? "case" : "cases"}
          </p>
        </div>
        <Link href="/dashboard/cases/new">
          <Button>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New case
          </Button>
        </Link>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-ink-faint"
            strokeWidth={1.75}
          />
          <input
            type="search"
            placeholder="Search cases, clients, descriptions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block h-10 w-full rounded-md border border-rule bg-paper pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
          />
        </div>

        <FilterSelect
          value={status}
          onChange={(v) => setStatus(v as CaseStatus | "")}
          placeholder="All statuses"
          options={CASE_STATUSES}
        />
        <FilterSelect
          value={caseType}
          onChange={(v) => setCaseType(v as CaseType | "")}
          placeholder="All types"
          options={CASE_TYPES}
        />
        <FilterSelect
          value={priority}
          onChange={(v) => setPriority(v as CasePriority | "")}
          placeholder="Any priority"
          options={CASE_PRIORITIES}
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            Clear
          </Button>
        )}
      </div>

      {isLoading ? (
        <CasesListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="overflow-hidden rounded-md border border-rule">
          <div className="grid grid-cols-12 gap-3 border-b border-rule bg-paper-2 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
            <div className="col-span-5">Case</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Priority</div>
            <div className="col-span-1 text-right">Updated</div>
          </div>
          <div className="bg-paper">
            {filtered.map((c) => (
              <CaseRow key={c.id} caseItem={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CaseRow({ caseItem }: { caseItem: Case }) {
  return (
    <Link
      href={`/dashboard/cases/${caseItem.id}`}
      className="grid grid-cols-12 gap-3 border-b border-rule px-5 py-4 text-sm transition-colors last:border-0 hover:bg-paper-2"
    >
      <div className="col-span-5 min-w-0">
        <p className="font-display text-[15px] font-medium leading-snug tracking-tight text-ink-strong truncate">
          {caseItem.title}
        </p>
        <p className="text-[12px] text-ink-faint truncate mt-0.5">
          {caseItem.clientName}
        </p>
      </div>
      <div className="col-span-2 flex items-center">
        <Badge variant={statusVariant(caseItem.status)}>
          {statusLabel(caseItem.status)}
        </Badge>
      </div>
      <div className="col-span-2 flex items-center text-ink-mute text-[12.5px]">
        {caseTypeLabel(caseItem.caseType)}
      </div>
      <div className="col-span-2 flex items-center">
        <Badge variant={priorityVariant(caseItem.priority)}>
          {priorityLabel(caseItem.priority)}
        </Badge>
      </div>
      <div className="col-span-1 flex items-center justify-end text-[12px] text-ink-faint tabular-nums">
        {formatRelativeDate(caseItem.updatedAt)}
      </div>
    </Link>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-10 rounded-md border border-rule bg-paper px-3 text-sm transition-[border-color,box-shadow] duration-150",
        "focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]",
        value ? "text-ink" : "text-ink-faint"
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CasesListSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between border-b border-rule px-5 py-4 last:border-0"
        >
          <div className="space-y-2 flex-1">
            <div className="h-3 w-1/3 rounded bg-paper-3 animate-pulse" />
            <div className="h-2 w-1/4 rounded bg-paper-3 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-5 w-16 rounded bg-paper-3 animate-pulse" />
            <div className="h-5 w-16 rounded bg-paper-3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-rule bg-paper py-16 px-6 text-center">
      <FolderOpen
        className="mx-auto h-6 w-6 text-ink-faint"
        strokeWidth={1.5}
      />
      <h3 className="mt-3 font-display text-[18px] font-medium tracking-tight text-ink-strong">
        {hasFilters ? "Nothing matches those filters." : "No cases yet."}
      </h3>
      <p className="mt-1 text-[13px] text-ink-mute max-w-[40ch] mx-auto">
        {hasFilters
          ? "Try clearing one or more filters to see more results."
          : "Create your first case to start tracking documents and deadlines."}
      </p>
      <div className="mt-5">
        {hasFilters ? (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear filters
          </Button>
        ) : (
          <Link href="/dashboard/cases/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              New case
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
