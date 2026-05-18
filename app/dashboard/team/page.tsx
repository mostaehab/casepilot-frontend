"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Plus,
  Users as UsersIcon,
  ArrowUpRight,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth-store";
import { useTeamStore } from "@/stores/team-store";
import type { Firm } from "@/types";
import { formatDate } from "@/lib/case-utils";

export default function TeamsPage() {
  const user = useAuthStore((s) => s.user);
  const teams = useTeamStore((s) => s.teams);
  const isLoading = useTeamStore((s) => s.isLoadingTeams);
  const fetchMyTeams = useTeamStore((s) => s.fetchMyTeams);

  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchMyTeams();
  }, [fetchMyTeams]);

  if (!user) {
    return <div className="text-sm text-ink-faint">Loading...</div>;
  }

  const canCreate = user.role === "lawyer";

  return (
    <div className="space-y-7 animate-fade-in">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-rule pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Firm
          </p>
          <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
            Teams
          </h1>
          <p className="text-[13px] text-ink-mute mt-1.5">
            {teams.length} {teams.length === 1 ? "team" : "teams"}
          </p>
        </div>
        {canCreate && !showCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New team
          </Button>
        )}
      </header>

      {showCreate && (
        <CreateTeamForm
          onCreated={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {isLoading && teams.length === 0 ? (
        <TeamsSkeleton />
      ) : teams.length === 0 ? (
        <EmptyState canCreate={canCreate} onCreate={() => setShowCreate(true)} />
      ) : (
        <ul className="overflow-hidden rounded-md border border-rule divide-y divide-rule bg-paper">
          {teams.map((team) => (
            <TeamRow key={team.id} team={team} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TeamRow({ team }: { team: Firm }) {
  return (
    <li>
      <Link
        href={`/team/${team.id}`}
        className="group grid grid-cols-12 items-center gap-4 px-5 py-4 transition-colors hover:bg-paper-2"
      >
        <div className="col-span-8 min-w-0">
          <p className="font-display text-[17px] font-medium leading-snug tracking-tight text-ink-strong truncate">
            {team.name}
          </p>
        </div>
        <div className="col-span-3 text-[12px] text-ink-faint">
          {team.createdAt ? `Created ${formatDate(team.createdAt)}` : ""}
        </div>
        <div className="col-span-1 flex justify-end">
          <ArrowUpRight
            className="h-4 w-4 text-ink-faint transition-colors group-hover:text-claret"
            strokeWidth={1.75}
          />
        </div>
      </Link>
    </li>
  );
}

function CreateTeamForm({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  const createTeam = useTeamStore((s) => s.createTeam);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      await createTeam(name.trim());
      setName("");
      onCreated();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't create that team.";
      setError(message);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="rounded-md border border-rule bg-paper p-6 animate-fade-in">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        New team
      </p>
      <h2 className="font-display text-[20px] font-medium tracking-tight text-ink-strong mt-1">
        Name the team
      </h2>
      <p className="text-[13px] text-ink-mute mt-1.5 max-w-[60ch]">
        A team groups cases and the people working on them. You can add
        assistants once the team exists.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Team name"
            placeholder="Smith & Associates"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || !name.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating
              </>
            ) : (
              "Create team"
            )}
          </Button>
        </div>
      </form>

      {error && (
        <div role="alert" className="mt-3 rounded-md border border-alarm/30 bg-alarm-soft px-3 py-2">
          <p className="text-[12px] text-alarm">{error}</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({
  canCreate,
  onCreate,
}: {
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="rounded-md border border-dashed border-rule bg-paper py-16 px-6 text-center">
      <UsersIcon className="mx-auto h-6 w-6 text-ink-faint" strokeWidth={1.5} />
      <h3 className="mt-3 font-display text-[18px] font-medium tracking-tight text-ink-strong">
        No teams yet.
      </h3>
      <p className="mt-1 text-[13px] text-ink-mute max-w-[40ch] mx-auto">
        {canCreate
          ? "Create the first team to organize cases and bring assistants in."
          : "Ask a lawyer to invite you to their team."}
      </p>
      {canCreate && (
        <div className="mt-5">
          <Button size="sm" onClick={onCreate}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            New team
          </Button>
        </div>
      )}
    </div>
  );
}

function TeamsSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-rule bg-paper">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 border-b border-rule px-5 py-4 last:border-0"
        >
          <div className="col-span-8 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-3 h-3 rounded bg-paper-3 animate-pulse" />
          <div className="col-span-1 h-3 rounded bg-paper-3 animate-pulse" />
        </div>
      ))}
    </div>
  );
}
