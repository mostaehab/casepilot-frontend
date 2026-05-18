import Link from "next/link";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-page text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-[68rem] items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[18px] font-medium tracking-tight text-ink-strong"
          >
            CasePilot<span className="text-accent">.</span>
          </Link>
          <p className="text-[12px] text-ink-faint">Team invitation</p>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-16 lg:py-24">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-[68rem] items-center justify-between gap-4 px-6 py-5 text-[12px] text-ink-faint">
          <span>&copy; {new Date().getFullYear()} CasePilot</span>
          <span>Single-firm tenancy. Encrypted in transit.</span>
        </div>
      </footer>
    </div>
  );
}
