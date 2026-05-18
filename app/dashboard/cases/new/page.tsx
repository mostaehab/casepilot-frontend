"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CaseForm } from "@/components/cases/CaseForm";

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-7 animate-fade-in">
      <header className="border-b border-rule pb-5">
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
          Back to cases
        </Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          New
        </p>
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          Open a case
        </h1>
        <p className="text-[13px] text-ink-mute mt-1.5 max-w-[56ch]">
          Give the case a name, name the client, and start tracking documents
          and deadlines.
        </p>
      </header>

      <CaseForm />
    </div>
  );
}
