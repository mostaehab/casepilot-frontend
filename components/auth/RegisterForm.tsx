"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/auth-service";
import { clearClientCache } from "@/lib/auth-helpers";

export function RegisterForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [barLicenseNumber, setBarLicenseNumber] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        name,
        email,
        password,
        barLicenseNumber,
        nationalNumber,
      });
      // The register endpoint sets a session cookie. We don't want the user
      // signed in automatically — clear the cookie and any stale client-side
      // cache from a previous session, then send them to /login.
      await authService.logout();
      clearClientCache();
      const next = search.get("next");
      const params = new URLSearchParams({ registered: "1" });
      if (next) params.set("next", next);
      router.push(`/login?${params.toString()}`);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Registration failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        New account
      </p>
      <h1 className="mt-2 font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong">
        Set up your firm.
      </h1>
      <p className="mt-3 text-[14px] leading-[1.55] text-ink-mute">
        Two minutes. Your bar credentials, a password, and you&rsquo;re in.
      </p>

      <div className="mt-8 space-y-5">
        <Input
          label="Full name"
          type="text"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@firm.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Bar license number"
            type="text"
            placeholder="BAR-12345"
            value={barLicenseNumber}
            onChange={(e) => setBarLicenseNumber(e.target.value)}
            required
          />
          <Input
            label="National number"
            type="text"
            placeholder="NAT-98765"
            value={nationalNumber}
            onChange={(e) => setNationalNumber(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
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
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </div>

      <p className="mt-6 text-[13px] text-ink-mute">
        Already have one?{" "}
        <Link
          href={
            search.get("next")
              ? `/login?next=${encodeURIComponent(search.get("next")!)}`
              : "/login"
          }
          className="font-medium text-claret hover:text-claret-hover"
        >
          Sign in
        </Link>
        .
      </p>
    </form>
  );
}
