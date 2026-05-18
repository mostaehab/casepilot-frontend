"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CaseForm } from "@/components/cases/CaseForm";
import { useCaseStore } from "@/stores/case-store";

export default function EditCasePage() {
  const params = useParams<{ id: string }>();
  const selectedCase = useCaseStore((s) => s.selectedCase);
  const fetchCase = useCaseStore((s) => s.fetchCase);

  useEffect(() => {
    if (params.id) fetchCase(params.id);
  }, [params.id, fetchCase]);

  if (!selectedCase) {
    return <div className="text-sm text-ink-faint">Loading case...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7 animate-fade-in">
      <header className="border-b border-rule pb-5">
        <Link
          href={`/dashboard/cases/${selectedCase.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
          Back to case
        </Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Edit
        </p>
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          {selectedCase.title}
        </h1>
      </header>

      <CaseForm initialCase={selectedCase} />
    </div>
  );
}
