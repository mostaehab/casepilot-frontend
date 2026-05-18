import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <header className="border-b border-rule">
        <div className="mx-auto flex h-14 max-w-[68rem] items-center justify-between px-6">
          <Link
            href="/"
            className="font-display text-[18px] font-medium tracking-tight text-ink-strong"
          >
            CasePilot<span className="text-claret">.</span>
          </Link>
          <p className="text-[12px] text-ink-faint">
            Case management for solo practice.
          </p>
        </div>
      </header>

      <main className="flex flex-1 items-stretch">
        <div className="mx-auto grid w-full max-w-[68rem] flex-1 grid-cols-1 px-6 py-16 lg:grid-cols-12 lg:gap-16 lg:py-24">
          <div className="lg:col-span-7 flex items-start justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <aside className="hidden lg:col-span-5 lg:flex lg:items-start lg:border-l lg:border-rule lg:pl-12">
            <div className="space-y-8 text-[13px] leading-[1.6] max-w-[36ch]">
              <p className="font-display text-[20px] font-medium leading-snug tracking-tight text-ink-strong">
                Inside, a working desk for your cases.
              </p>
              <dl className="space-y-5">
                <Item
                  term="Cases"
                  def="A single sortable list. Status, type, priority, last updated, all in view."
                />
                <Item
                  term="Documents"
                  def="Upload, summarise, index. The AI reads; the lawyer decides."
                />
                <Item
                  term="Deadlines"
                  def="Court dates and filings, ordered by what&rsquo;s closest."
                />
                <Item
                  term="Team"
                  def="Lawyers and assistants on the same case, with roles that match the work."
                />
              </dl>
            </div>
          </aside>
        </div>
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

function Item({ term, def }: { term: string; def: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {term}
      </dt>
      <dd className="mt-1 text-ink">{def}</dd>
    </div>
  );
}
