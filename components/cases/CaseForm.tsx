"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCaseStore } from "@/stores/case-store";
import { useAuthStore } from "@/stores/auth-store";
import {
  CASE_STATUSES,
  CASE_TYPES,
  CASE_PRIORITIES,
  toDateInputValue,
  toDateTimeInputValue,
} from "@/lib/case-utils";
import type { Case, CaseStatus, CaseType, CasePriority } from "@/types";

interface CaseFormProps {
  initialCase?: Case;
  /**
   * Force the team association at create time. Used by the team-scoped
   * "New case" route to lock the case to the team being viewed, regardless
   * of which team is active in auth-store.
   */
  forceTeamId?: string;
  onCancel?: () => void;
}

export function CaseForm({ initialCase, forceTeamId, onCancel }: CaseFormProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const firm = useAuthStore((s) => s.firm);
  const createCase = useCaseStore((s) => s.createCase);
  const updateCase = useCaseStore((s) => s.updateCase);

  const [title, setTitle] = useState(initialCase?.title ?? "");
  const [caseNumber, setCaseNumber] = useState(initialCase?.caseNumber ?? "");
  const [description, setDescription] = useState(initialCase?.description ?? "");
  const [caseType, setCaseType] = useState<CaseType>(initialCase?.caseType ?? "litigation");
  const [status, setStatus] = useState<CaseStatus>(initialCase?.status ?? "open");
  const [priority, setPriority] = useState<CasePriority>(initialCase?.priority ?? "medium");
  const [courtName, setCourtName] = useState(initialCase?.courtName ?? "");
  const [filingDate, setFilingDate] = useState(
    toDateInputValue(initialCase?.filingDate)
  );
  const [nextHearingDate, setNextHearingDate] = useState(
    toDateTimeInputValue(initialCase?.nextHearingDate)
  );
  const [clientName, setClientName] = useState(initialCase?.clientName ?? "");
  const [clientEmail, setClientEmail] = useState(initialCase?.clientEmail ?? "");
  const [clientPhone, setClientPhone] = useState(initialCase?.clientPhone ?? "");
  const [clientNationalNumber, setClientNationalNumber] = useState(
    initialCase?.clientNationalNumber ?? ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialCase;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !clientName.trim()) {
      setError("A title and a client name are required.");
      return;
    }

    const sharedFields = {
      title,
      caseNumber: caseNumber.trim() || undefined,
      description,
      caseType,
      status,
      priority,
      courtName: courtName.trim() || undefined,
      filingDate: filingDate || undefined,
      nextHearingDate: nextHearingDate ? new Date(nextHearingDate).toISOString() : undefined,
      clientName,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      clientNationalNumber: clientNationalNumber.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateCase(initialCase.id, sharedFields);
        router.push(`/dashboard/cases/${initialCase.id}`);
      } else {
        // Resolve the team association in priority order:
        //   1. forceTeamId (set when creating from inside a team view)
        //   2. auth-store firm (the user's primary team, if any)
        //   3. unset — case lives outside a team
        const teamId = forceTeamId ?? firm?.id;
        const newCase = await createCase({
          ...sharedFields,
          assignedTo: user ? [user.id] : [],
          ...(teamId ? { firmId: teamId } : {}),
          createdBy: user?.id ?? "",
        });
        router.push(`/dashboard/cases/${newCase.id}`);
      }
    } catch {
      setError("Couldn't save the case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <Section kicker="Case" title="Case details">
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_220px]">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Johnson v. Metro Corp"
              required
            />
            <Input
              label="Case number"
              value={caseNumber}
              onChange={(e) => setCaseNumber(e.target.value)}
              placeholder="CIV-2026-001"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium tracking-[0.01em] text-ink mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the case."
              rows={4}
              className="block w-full rounded-md border border-rule bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-faint transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <SelectField label="Type" value={caseType} onChange={(v) => setCaseType(v as CaseType)} options={CASE_TYPES} />
            <SelectField label="Status" value={status} onChange={(v) => setStatus(v as CaseStatus)} options={CASE_STATUSES} />
            <SelectField label="Priority" value={priority} onChange={(v) => setPriority(v as CasePriority)} options={CASE_PRIORITIES} />
          </div>
        </div>
      </Section>

      <Section kicker="Filing" title="Court and dates">
        <div className="space-y-5">
          <Input
            label="Court name"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            placeholder="District Court"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Filing date"
              type="date"
              value={filingDate}
              onChange={(e) => setFilingDate(e.target.value)}
            />
            <Input
              label="Next hearing"
              type="datetime-local"
              value={nextHearingDate}
              onChange={(e) => setNextHearingDate(e.target.value)}
            />
          </div>
        </div>
      </Section>

      <Section kicker="Client" title="Who the case is for">
        <div className="space-y-5">
          <Input
            label="Client name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="John Doe"
            required
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Client email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
            />
            <Input
              label="Client phone"
              type="tel"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="(555) 123-4567"
            />
          </div>
          <Input
            label="National number"
            value={clientNationalNumber}
            onChange={(e) => setClientNationalNumber(e.target.value)}
            placeholder="Optional ID/passport reference"
          />
        </div>
      </Section>

      {error && (
        <div role="alert" className="rounded-md border border-alarm/30 bg-alarm-soft px-3 py-2">
          <p className="text-[12px] text-alarm">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 border-t border-rule pt-5">
        <Button
          type="button"
          variant="outline"
          onClick={() => (onCancel ? onCancel() : router.back())}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving
            </>
          ) : isEditing ? (
            "Save changes"
          ) : (
            "Create case"
          )}
        </Button>
      </div>
    </form>
  );
}

function Section({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
      <header className="md:col-span-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {kicker}
        </p>
        <h2 className="font-display text-[20px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          {title}
        </h2>
      </header>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[12px] font-medium tracking-[0.01em] text-ink">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block h-10 w-full rounded-md border border-rule bg-paper px-3 text-sm text-ink transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-navy focus:shadow-[0_0_0_3px_var(--accent-soft)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
