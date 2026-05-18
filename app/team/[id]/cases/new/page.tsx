"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CaseForm } from "@/components/cases/CaseForm";
import { useTeamStore } from "@/stores/team-store";

export default function TeamNewCasePage() {
  const params = useParams<{ id: string }>();
  const teamId = params?.id ?? "";
  const team = useTeamStore((s) => s.currentTeam);

  return (
    <div className="mx-auto max-w-2xl space-y-7 animate-fade-in">
      <header className="border-b border-rule pb-5">
        <Link
          href={`/team/${teamId}/cases`}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3 w-3" strokeWidth={1.75} />
          Back to cases
        </Link>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-claret">
          {team?.name ?? "Team"} · New case
        </p>
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          Open a case for this team
        </h1>
        <p className="text-[13px] text-ink-mute mt-1.5 max-w-[56ch]">
          The case will be owned by{" "}
          <span className="font-medium text-ink">
            {team?.name ?? "this team"}
          </span>
          . Anyone on the team will be able to open it.
        </p>
      </header>

      <CaseForm forceTeamId={teamId} />
    </div>
  );
}
