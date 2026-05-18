import type { CaseStatus, CaseType, CasePriority } from "@/types";

export const CASE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "closed", label: "Closed" },
];

export const CASE_TYPES: { value: CaseType; label: string }[] = [
  { value: "litigation", label: "Litigation" },
  { value: "corporate", label: "Corporate" },
  { value: "criminal", label: "Criminal" },
  { value: "family", label: "Family" },
  { value: "immigration", label: "Immigration" },
  { value: "real_estate", label: "Real Estate" },
  { value: "other", label: "Other" },
];

export const CASE_PRIORITIES: { value: CasePriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function statusLabel(status: CaseStatus): string {
  return CASE_STATUSES.find((s) => s.value === status)?.label ?? status;
}

export function caseTypeLabel(type: CaseType): string {
  return CASE_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function priorityLabel(priority: CasePriority): string {
  return CASE_PRIORITIES.find((p) => p.value === priority)?.label ?? priority;
}

export function statusVariant(
  status: CaseStatus
): "accent" | "success" | "warning" | "neutral" {
  switch (status) {
    case "open":
      return "accent";
    case "in_progress":
      return "success";
    case "pending":
      return "warning";
    case "closed":
      return "neutral";
  }
}

export function priorityVariant(
  priority: CasePriority
): "danger" | "warning" | "neutral" {
  switch (priority) {
    case "high":
      return "danger";
    case "medium":
      return "warning";
    case "low":
      return "neutral";
  }
}

/**
 * Backends sometimes return null, empty strings, or non-ISO date values.
 * `parseDate` returns `null` for any of those so callers can render a
 * fallback instead of "Invalid Date".
 */
export function parseDate(value: unknown): Date | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string" && typeof value !== "number") return null;
  const trimmed = typeof value === "string" ? value.trim() : value;
  if (trimmed === "") return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value: unknown, fallback = "—"): string {
  const d = parseDate(value);
  if (!d) return fallback;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: unknown, fallback = "—"): string {
  const d = parseDate(value);
  if (!d) return fallback;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatRelativeDate(value: unknown, fallback = "—"): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date.toISOString(), fallback);
}

/**
 * Convert an ISO datetime/date string to YYYY-MM-DD for `<input type="date">`.
 * Returns "" for invalid input.
 */
export function toDateInputValue(value: unknown): string {
  const d = parseDate(value);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Convert an ISO datetime to YYYY-MM-DDTHH:MM for `<input type="datetime-local">`.
 * Returns "" for invalid input.
 */
export function toDateTimeInputValue(value: unknown): string {
  const d = parseDate(value);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}
