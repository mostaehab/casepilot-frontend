"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError, apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ResetPasswordForm() {
  const router = useRouter();
  const search = useSearchParams();
  const token = search.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Reset password
        </p>
        <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          Link looks broken.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          This reset link is missing or malformed. Request a new one and try
          again.
        </p>
        <div className="mt-8">
          <Link
            href="/forgot-password"
            className="text-[13px] font-medium text-claret hover:text-claret-hover"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not reset your password. The link may have expired.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (done) {
    return (
      <div className="w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Done
        </p>
        <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          Password updated.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          Sending you back to sign in&hellip;
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Reset password
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
        Choose a new password.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
        Pick something you&rsquo;ll remember. At least 6 characters.
      </p>

      <div className="mt-8 space-y-5">
        <Input
          label="New password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Type it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />

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
              Updating
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-ink-mute">
        <Link
          href="/login"
          className="font-medium text-claret hover:text-claret-hover"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
