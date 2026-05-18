"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Users as UsersIcon,
  X,
  Plus,
  ArrowUpRight,
  UserMinus,
  Clock,
} from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/auth-store";
import { useTeamStore } from "@/stores/team-store";
import type { TeamMember } from "@/types";

export default function TeamOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const currentTeam = useTeamStore((s) => s.currentTeam);
  const members = useTeamStore((s) => s.members);
  const cases = useTeamStore((s) => s.cases);
  const isLoading = useTeamStore((s) => s.isLoading);

  const { activeMembers, pendingMembers } = useMemo(() => {
    const active: TeamMember[] = [];
    const pending: TeamMember[] = [];
    for (const m of members) {
      if (m.status === "pending") pending.push(m);
      else if (m.status === "active") active.push(m);
      // `removed` rows are ignored client-side.
    }
    return { activeMembers: active, pendingMembers: pending };
  }, [members]);

  if (!user) {
    return <div className="text-sm text-ink-faint">Loading…</div>;
  }

  if (isLoading && !currentTeam) {
    return <OverviewSkeleton />;
  }

  if (!currentTeam) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-ink-faint">Team not found.</p>
        <Link href="/dashboard/team">
          <Button variant="outline" size="sm" className="mt-3">
            Back to teams
          </Button>
        </Link>
      </div>
    );
  }

  const canManage = user.role === "lawyer";

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="border-b border-rule pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Team
        </p>
        <h1 className="font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong mt-1">
          {currentTeam.name}
        </h1>
        <p className="text-[13px] text-ink-mute mt-1.5">
          {activeMembers.length}{" "}
          {activeMembers.length === 1 ? "member" : "members"}
          {pendingMembers.length > 0 && (
            <>
              {" · "}
              <span className="text-warn">
                {pendingMembers.length} pending
              </span>
            </>
          )}
          {" · "}
          {cases.length} {cases.length === 1 ? "case" : "cases"}
        </p>
      </header>

      <CasesSnapshot teamId={currentTeam.id} caseCount={cases.length} />

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-8">
          {canManage && <InviteForm teamId={currentTeam.id} />}

          <MembersList
            teamId={currentTeam.id}
            members={activeMembers}
            currentUserId={user.id}
            ownerId={currentTeam.ownerId}
            canManage={canManage}
          />

          <PendingInvitationsList
            teamId={currentTeam.id}
            pending={pendingMembers}
            canManage={canManage}
          />
        </div>
        <aside className="lg:col-span-4 space-y-6">
          <Widget kicker="Workspace" title="Quick actions">
            <ul className="space-y-1 text-[13px]">
              <SideAction
                href={`/team/${currentTeam.id}/cases/new`}
                label="Open a new case for this team"
              />
              <SideAction
                href={`/team/${currentTeam.id}/cases`}
                label="See every case in this team"
              />
              <SideAction
                href="/dashboard/team"
                label="Switch to another team"
              />
            </ul>
          </Widget>
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Cases snapshot — shows count and a CTA to the cases page.
   ------------------------------------------------------------------ */

function CasesSnapshot({
  teamId,
  caseCount,
}: {
  teamId: string;
  caseCount: number;
}) {
  return (
    <section className="grid gap-4 rounded-md border border-rule bg-paper p-5 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Caseload
        </p>
        <p className="mt-1 text-[15px] text-ink">
          <span className="font-display text-[28px] font-medium tracking-tight text-ink-strong tabular-nums">
            {caseCount}
          </span>{" "}
          {caseCount === 1 ? "case" : "cases"} owned by this team.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link href={`/team/${teamId}/cases`}>
          <Button variant="outline">View cases</Button>
        </Link>
        <Link href={`/team/${teamId}/cases/new`}>
          <Button>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New case
          </Button>
        </Link>
      </div>
    </section>
  );
}

/**
 * Widget — bordered card with a kicker/title strip on top and a flush
 * body. Used for the team-page sections (Invite, Members, Pending) so
 * they read as discrete dashboard panels without nested-card chrome.
 *
 * Pass `bodyClassName` to override the default 20px padding when the
 * body is itself bordered (lists, tables) and should sit edge-to-edge.
 */
function Widget({
  kicker,
  title,
  trailing,
  bodyClassName,
  children,
}: {
  kicker: string;
  title: string;
  trailing?: React.ReactNode;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-rule bg-paper">
      <header className="flex items-baseline justify-between gap-3 border-b border-rule px-5 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            {kicker}
          </p>
          <h2 className="mt-0.5 font-display text-[15px] font-medium tracking-tight text-ink-strong">
            {title}
          </h2>
        </div>
        {trailing && (
          <div className="shrink-0 text-[11px] uppercase tracking-[0.14em] text-ink-faint tabular-nums">
            {trailing}
          </div>
        )}
      </header>
      <div className={bodyClassName ?? "p-5"}>{children}</div>
    </section>
  );
}

function SideAction({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-ink hover:bg-paper-2"
      >
        <span>{label}</span>
        <ArrowUpRight
          className="h-4 w-4 text-ink-faint transition-colors group-hover:text-claret"
          strokeWidth={1.75}
        />
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------
   Invite form
   ------------------------------------------------------------------ */

function InviteForm({ teamId }: { teamId: string }) {
  const inviteMember = useTeamStore((s) => s.inviteMember);
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return;

    setIsSending(true);
    try {
      await inviteMember(email.trim(), teamId);
      setEmail("");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't send the invitation.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Widget kicker="Invite" title="Add an assistant by email">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Email"
            type="email"
            placeholder="teammate@firm.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={isSending || !email.trim()}>
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
              Send invite
            </>
          )}
        </Button>
      </form>
      {error && (
        <div
          role="alert"
          className="mt-3 rounded-md border border-alarm/30 bg-alarm-soft px-3 py-2"
        >
          <p className="text-[12px] text-alarm">{error}</p>
        </div>
      )}
    </Widget>
  );
}

/* ------------------------------------------------------------------
   Active members
   ------------------------------------------------------------------ */

function MembersList({
  teamId,
  members,
  currentUserId,
  ownerId,
  canManage,
}: {
  teamId: string;
  members: TeamMember[];
  currentUserId: string;
  ownerId: string;
  canManage: boolean;
}) {
  if (members.length === 0) {
    return (
      <Widget
        kicker="Roster"
        title="Members"
        bodyClassName="px-6 py-10 text-center"
      >
        <UsersIcon className="mx-auto h-6 w-6 text-ink-faint" strokeWidth={1.5} />
        <h3 className="mt-3 font-display text-[15px] font-medium tracking-tight text-ink-strong">
          No active members yet.
        </h3>
        <p className="mt-1 text-[12.5px] text-ink-mute max-w-[40ch] mx-auto">
          Invite assistants above. They&rsquo;ll show up here once they
          accept.
        </p>
      </Widget>
    );
  }

  return (
    <Widget
      kicker="Roster"
      title="Members"
      trailing={members.length}
      bodyClassName=""
    >
      <ul>
        {members.map((member) => (
          <MemberRow
            key={member.userId}
            teamId={teamId}
            member={member}
            isSelf={member.userId === currentUserId}
            isOwner={member.userId === ownerId}
            canManage={canManage}
          />
        ))}
      </ul>
    </Widget>
  );
}

function MemberRow({
  teamId,
  member,
  isSelf,
  isOwner,
  canManage,
}: {
  teamId: string;
  member: TeamMember;
  isSelf: boolean;
  isOwner: boolean;
  canManage: boolean;
}) {
  const removeMember = useTeamStore((s) => s.removeMember);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const displayName = member.name ?? member.email ?? "Unknown";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleRemove() {
    setIsRemoving(true);
    setError("");
    try {
      await removeMember(teamId, member.userId);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Couldn't remove this member.";
      setError(message);
    } finally {
      setIsRemoving(false);
      setShowConfirm(false);
    }
  }

  // The team owner cannot be removed via this endpoint (API returns 409).
  // Self-removal isn't supported here either.
  const showRemove = canManage && !isSelf && !isOwner;

  return (
    <li className="flex flex-col gap-2 border-b border-rule px-5 py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-3 text-[11px] font-medium text-ink-strong shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-medium text-ink-strong truncate">
              {member.name ?? member.email ?? "Unknown"}
            </p>
            {isSelf && <span className="text-[11px] text-ink-faint">(you)</span>}
          </div>
          {member.name && member.email && (
            <p className="text-[12px] text-ink-faint truncate">
              {member.email}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-1 text-[11px] text-alarm">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isOwner ? (
          <Badge variant="accent">Owner</Badge>
        ) : (
          <Badge variant={member.role === "lawyer" ? "accent" : "neutral"}>
            {member.role === "lawyer" ? "Lawyer" : "Assistant"}
          </Badge>
        )}

        {showRemove &&
          (showConfirm ? (
            <div className="flex items-center gap-1">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Removing
                  </>
                ) : (
                  "Confirm remove"
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirm(true)}
              aria-label={`Remove ${displayName}`}
            >
              <UserMinus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Remove
            </Button>
          ))}
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------
   Pending invitations
   ------------------------------------------------------------------ */

function PendingInvitationsList({
  teamId,
  pending,
  canManage,
}: {
  teamId: string;
  pending: TeamMember[];
  canManage: boolean;
}) {
  if (pending.length === 0) return null;

  return (
    <Widget
      kicker="Pending"
      title="Invitations awaiting acceptance"
      trailing={pending.length}
      bodyClassName=""
    >
      <table className="w-full text-left">
        <thead className="bg-paper-3 border-b border-rule">
          <tr>
            <th
              scope="col"
              className="px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Email
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Role
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
            >
              Status
            </th>
            {canManage && (
              <th
                scope="col"
                className="px-5 py-2 text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint"
              >
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {pending.map((m) => (
            <PendingRow
              key={m.userId}
              teamId={teamId}
              member={m}
              canManage={canManage}
            />
          ))}
        </tbody>
      </table>
    </Widget>
  );
}

function PendingRow({
  teamId,
  member,
  canManage,
}: {
  teamId: string;
  member: TeamMember;
  canManage: boolean;
}) {
  const removeMember = useTeamStore((s) => s.removeMember);
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState("");

  async function handleRevoke() {
    setIsRevoking(true);
    setError("");
    try {
      await removeMember(teamId, member.userId);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Couldn't revoke this invitation.";
      setError(message);
      setIsRevoking(false);
    }
  }

  return (
    <tr className="border-t border-rule first:border-0 align-top">
      <td className="px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warn-soft text-warn shrink-0">
            <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="text-[13.5px] text-ink truncate">
              {member.email ?? "—"}
            </p>
            {error && (
              <p role="alert" className="mt-0.5 text-[11px] text-alarm">
                {error}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-[13px] text-ink-mute">
        {member.role === "lawyer" ? "Lawyer" : "Assistant"}
      </td>
      <td className="px-3 py-3">
        <Badge variant="warning">Pending</Badge>
      </td>
      {canManage && (
        <td className="px-5 py-3 text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRevoke}
            disabled={isRevoking}
            aria-label={`Revoke invitation for ${member.email ?? "user"}`}
          >
            {isRevoking ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            Revoke
          </Button>
        </td>
      )}
    </tr>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-7">
      <div className="space-y-2 border-b border-rule pb-5">
        <div className="h-3 w-16 rounded bg-paper-3 animate-pulse" />
        <div className="h-7 w-72 rounded bg-paper-3 animate-pulse" />
        <div className="h-3 w-32 rounded bg-paper-3 animate-pulse" />
      </div>
      <div className="rounded-md border border-rule h-32 animate-pulse" />
    </div>
  );
}
