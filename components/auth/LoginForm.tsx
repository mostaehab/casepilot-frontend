"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { teamService } from "@/services/team-service";

/** Only same-origin relative paths are allowed as a post-auth redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/dashboard";
  return raw;
}

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const setFirm = useAuthStore((s) => s.setFirm);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { user } = await authService.login({ email, password });
      setUser(user, null);
      router.push(safeNext(search.get("next")));
      // Hydrate the user's primary team in the background. The dashboard
      // chrome reads `firm.name`, so populate as soon as the API returns.
      teamService
        .getMyTeam()
        .then((firm) => {
          if (firm) setFirm(firm);
        })
        .catch(() => {
          // Non-fatal: user might not be on a team yet.
        });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Sign-in failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Sign in
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
        Welcome back.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
        Pick up where you left off. Your cases are where you left them.
      </p>

      <div className="mt-8 space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@firm.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[12px] text-ink-mute hover:text-claret"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-alarm/30 bg-alarm-soft px-3 py-2"
          >
            <p className="text-[12px] text-alarm">{error}</p>
          </div>
        )}

        <Button type="submit" fullWidth size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-ink-mute">
        New here?{" "}
        <Link
          href={
            search.get("next")
              ? `/register?next=${encodeURIComponent(search.get("next")!)}`
              : "/register"
          }
          className="font-medium text-claret hover:text-claret-hover"
        >
          Create an account
        </Link>
        .
      </p>
    </form>
  );
}
