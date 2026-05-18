import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <AdminTopBar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[64rem] px-10 py-14">
          {children}
        </div>
      </main>
      <footer className="mx-auto w-full max-w-[64rem] px-10 pb-10">
        <p className="font-display italic text-[12px] text-ink-faint">
          Internal use only.
        </p>
      </footer>
    </div>
  );
}

function AdminTopBar() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-14 w-full max-w-[64rem] items-baseline justify-between px-10">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-display text-[18px] font-medium tracking-tight text-ink-strong">
            CasePilot<span className="text-claret">.</span>
          </span>
          <span className="font-display italic text-[15px] text-ink-mute">
            Operations
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="text-[13px] text-ink-mute transition-colors hover:text-ink"
        >
          Return to dashboard
        </Link>
      </div>
    </header>
  );
}
