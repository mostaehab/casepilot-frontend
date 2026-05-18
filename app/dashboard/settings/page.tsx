"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { formatDate } from "@/lib/case-utils";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <div className="text-sm text-ink-faint">Loading profile...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12 animate-fade-in">
      <header className="border-b border-rule pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Account
        </p>
        <h1 className="font-display text-[32px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          Settings
        </h1>
        <p className="text-[13px] text-ink-mute mt-1.5 max-w-[56ch]">
          Profile, password, and read-only account details.
        </p>
      </header>

      <ProfileSection />
      <PasswordSection />
      <AccountSection />
    </div>
  );
}

function ProfileSection() {
  const user = useAuthStore((s) => s.user)!;
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(user.name);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isDirty = name !== user.name;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSaving(true);
    try {
      const updated = await authService.updateProfile(user.id, { name });
      updateUser(updated);
      setSavedAt(Date.now());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't save your changes.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Section
      kicker="Profile"
      title="Who you are"
      hint="Your name as it appears to your team. Bar credentials are set at registration."
    >
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-rule">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-paper-3 font-display text-[18px] font-medium text-ink-strong">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink-strong truncate">{user.name}</p>
          <p className="text-[13px] text-ink-mute truncate">{user.email}</p>
          <Badge variant="accent" className="mt-1.5">
            {user.role === "lawyer" ? "Lawyer" : "Assistant"}
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="Bar license number"
            value={user.barLicenseNumber ?? ""}
            disabled
            hint="Set at registration. Contact support to change."
          />
          <Input
            label="National number"
            value={user.nationalNumber ?? ""}
            disabled
            hint="Set at registration. Contact support to change."
          />
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <FooterRow>
          <SavedIndicator savedAt={savedAt} />
          <Button type="submit" disabled={!isDirty || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </FooterRow>
      </form>
    </Section>
  );
}

function PasswordSection() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("The new passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword({
        oldPassword,
        newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSavedAt(Date.now());
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Couldn't update your password.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Section
      kicker="Security"
      title="Password"
      hint="You'll stay signed in on this device."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Current password"
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={8}
            hint="At least 8 characters."
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <FooterRow>
          <SavedIndicator savedAt={savedAt} label="Password updated" />
          <Button type="submit" disabled={isSaving || !oldPassword || !newPassword}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </FooterRow>
      </form>
    </Section>
  );
}

function AccountSection() {
  const user = useAuthStore((s) => s.user)!;
  const firm = useAuthStore((s) => s.firm);

  return (
    <Section
      kicker="Record"
      title="Account"
      hint="Read-only details from your account."
    >
      <dl className="space-y-3">
        <Row label="User ID" value={user.id} mono />
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role === "lawyer" ? "Lawyer" : "Assistant"} />
        {firm && <Row label="Firm" value={firm.name} />}
        <Row label="Member since" value={formatDate(user.createdAt)} />
      </dl>
    </Section>
  );
}

function Section({
  kicker,
  title,
  hint,
  children,
}: {
  kicker: string;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <header className="md:col-span-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {kicker}
        </p>
        <h2 className="font-display text-[22px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
          {title}
        </h2>
        <p className="mt-2 text-[13px] text-ink-mute">{hint}</p>
      </header>
      <div className="md:col-span-8">{children}</div>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-rule pb-2.5 last:border-0 last:pb-0">
      <dt className="text-[12px] uppercase tracking-[0.1em] text-ink-faint">{label}</dt>
      <dd
        className={
          mono
            ? "font-mono text-[12.5px] text-ink truncate max-w-[60%]"
            : "text-[13.5px] text-ink truncate max-w-[60%]"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-md border border-alarm/30 bg-alarm-soft px-3 py-2">
      <p className="text-[12px] text-alarm">{children}</p>
    </div>
  );
}

function FooterRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between pt-2">{children}</div>
  );
}

function SavedIndicator({
  savedAt,
  label = "Saved",
}: {
  savedAt: number | null;
  label?: string;
}) {
  if (!savedAt) return <div />;
  const stale = Date.now() - savedAt > 5000;
  if (stale) return <div />;
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-ok animate-fade-in">
      <Check className="h-3.5 w-3.5" strokeWidth={2} />
      {label}
    </div>
  );
}
