"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ApiError, apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await apiClient.post("/auth/forget-password", { email });
      setSubmitted(true);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not send the reset link. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="w-full">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Check your inbox
        </p>
        <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
          Reset link sent.
        </h1>
        <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
          If an account exists for <span className="text-ink">{email}</span>,
          we&rsquo;ve sent a message with a link to reset your password. The
          link expires in 30 minutes.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="text-[13px] font-medium text-claret hover:text-claret-hover"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        Forgot password
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
        Reset your password.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
        Enter the email on your account and we&rsquo;ll send you a link to set
        a new one.
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
              Sending link
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-ink-mute">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-medium text-claret hover:text-claret-hover"
        >
          Back to sign in
        </Link>
        .
      </p>
    </form>
  );
}
