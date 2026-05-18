"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/auth-store";
import { teamService } from "@/services/team-service";
import { ApiError } from "@/lib/api-client";

type Status =
  | "loading"
  | "needs-auth"
  | "ready"
  | "accepting"
  | "accepted"
  | "error";

export default function AcceptInvitePage() {
  const params = useParams<{ teamId: string }>();
  const router = useRouter();
  const search = useSearchParams();

  const teamId = params.teamId;
  const fallbackTeamName = search.get("team") ?? undefined;
  const invitedEmail = search.get("email") ?? undefined;

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setFirm = useAuthStore((s) => s.setFirm);

  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [teamName, setTeamName] = useState<string | undefined>(fallbackTeamName);
  const [error, setError] = useState("");

  // Build a sign-in / register URL that returns here after auth.
  const nextHref = useMemo(() => {
    const qs = search.toString();
    return qs
      ? `/invite/${teamId}?${qs}`
      : `/invite/${teamId}`;
  }, [teamId, search]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Decide initial status once we know whether the user is signed in,
  // and try to enrich the team name + already-member check.
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      setStatus("needs-auth");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const detail = await teamService.getTeam(teamId);
        if (cancelled) return;
        setTeamName(detail.team.name);
        // The API returns rows of { user_id, role, status, name, email },
        // not full User records. teamService types this as User[] but the
        // actual data has userId/status fields — cast to match reality.
        const rows = detail.members as unknown as Array<{
          userId?: string;
          status?: string;
        }>;
        const alreadyActive = rows.some(
          (m) => m.userId === user?.id && m.status === "active"
        );
        setStatus(alreadyActive ? "accepted" : "ready");
      } catch {
        // 403/404 is expected when the user is not yet a member — we still
        // let them attempt the accept call. Fall back to whatever team name
        // came from the URL (or none).
        if (cancelled) return;
        setStatus("ready");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, isAuthenticated, teamId, user?.id]);

  async function handleAccept() {
    setStatus("accepting");
    setError("");
    try {
      await teamService.acceptInvite(teamId);
      // Refresh the user's primary team so the dashboard chrome reflects
      // the new membership immediately on next navigation.
      try {
        const team = await teamService.getMyTeam();
        if (team) setFirm(team);
      } catch {
        // Non-fatal — the team chrome will hydrate on next dashboard visit.
      }
      setStatus("accepted");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "We couldn't accept this invitation.";
      setError(message);
      setStatus("error");
    }
  }

  const emailMismatch =
    invitedEmail &&
    user?.email &&
    invitedEmail.trim().toLowerCase() !== user.email.trim().toLowerCase();

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (!hydrated || status === "loading") {
    return (
      <div className="flex flex-col items-start gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
        <p className="text-[13px] text-ink-mute">Checking your invitation…</p>
      </div>
    );
  }

  if (status === "needs-auth") {
    return (
      <>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Team invitation
        </p>
        <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          Sign in to accept.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          You&rsquo;ve been invited to join{" "}
          <strong className="font-medium text-ink">
            {teamName ?? "a team"}
          </strong>{" "}
          on CasePilot. Sign in to confirm — or create an account first if you
          don&rsquo;t have one.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Link
            href={`/login?next=${encodeURIComponent(nextHref)}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-5 text-[15px] font-medium text-page transition-colors hover:bg-navy-hover focus-visible:outline-2 focus-visible:outline-navy focus-visible:outline-offset-2"
          >
            Sign in to accept
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href={`/register?next=${encodeURIComponent(nextHref)}`}
            className="inline-flex h-11 items-center justify-center rounded-md border border-rule-strong bg-page px-5 text-[15px] font-medium text-ink transition-colors hover:bg-page-2"
          >
            Create an account
          </Link>
        </div>

        {invitedEmail && (
          <p className="mt-6 text-[12px] text-ink-faint">
            This invitation was sent to{" "}
            <span className="font-mono text-ink-mute">{invitedEmail}</span>.
            Sign in with the same email to accept.
          </p>
        )}
      </>
    );
  }

  if (status === "accepted") {
    return (
      <>
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ok-soft text-ok">
          <Check className="h-5 w-5" strokeWidth={2} />
        </div>
        <h1 className="mt-4 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          You&rsquo;re in.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          Welcome to{" "}
          <strong className="font-medium text-ink">
            {teamName ?? "the team"}
          </strong>
          . Cases, calendar, and documents are ready for you.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Link
            href={`/team/${teamId}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-navy px-5 text-[15px] font-medium text-page transition-colors hover:bg-navy-hover"
          >
            Open team
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md text-[14px] text-ink-mute hover:text-ink"
          >
            Go to dashboard
          </Link>
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-alarm">
          Couldn&rsquo;t accept
        </p>
        <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          Something went wrong.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          {error || "We couldn't accept this invitation right now."} The link
          may have expired, been revoked, or already been used.
        </p>

        <div className="mt-8 flex flex-col gap-2.5">
          <Button onClick={handleAccept} fullWidth size="lg">
            Try again
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md text-[14px] text-ink-mute hover:text-ink"
          >
            Back to dashboard
          </Link>
        </div>
      </>
    );
  }

  // status === "ready" or "accepting"
  return (
    <>
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Team invitation
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
        Join {teamName ?? "this team"}?
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
        You&rsquo;ll be added as a member and gain access to the team&rsquo;s
        cases, calendar, and documents.
      </p>

      {emailMismatch && (
        <div
          role="alert"
          className="mt-6 rounded-md border border-warn/30 bg-warn-soft px-3 py-2"
        >
          <p className="text-[12px] text-warn">
            This invitation was sent to{" "}
            <span className="font-mono">{invitedEmail}</span>, but you&rsquo;re
            signed in as{" "}
            <span className="font-mono">{user?.email}</span>. Sign out and sign
            in with the invited address if these should match.
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-2.5">
        <Button
          onClick={handleAccept}
          fullWidth
          size="lg"
          disabled={status === "accepting"}
        >
          {status === "accepting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining
            </>
          ) : (
            <>Join {teamName ?? "team"}</>
          )}
        </Button>
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-md text-[14px] text-ink-mute hover:text-ink"
        >
          Not now
        </Link>
      </div>

      <p className="mt-6 text-[12px] text-ink-faint">
        Signed in as{" "}
        <span className="font-mono text-ink-mute">{user?.email}</span>.{" "}
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="text-ink-mute underline-offset-2 hover:text-ink hover:underline"
        >
          Wrong account?
        </button>
      </p>
    </>
  );
}
