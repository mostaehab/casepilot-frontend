import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Header />
      <main className="flex-1">
        <Hero />
        <Daybook />
        <Reading />
        <Colophon />
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------
   Header. Solid paper, no glass.
   ------------------------------------------------------------------ */

function Header() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex h-14 max-w-[78rem] items-center justify-between px-6">
        <Link href="/" className="font-display text-[18px] font-medium tracking-tight text-ink-strong">
          CasePilot<span className="text-claret">.</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Create account</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------
   Hero. Editorial masthead. Serif statement + right-rail colophon.
   ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto grid max-w-[78rem] gap-10 px-6 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-8">
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-faint">
            Vol. 1 · Case management for solo practice
          </p>
          <h1 className="font-display text-[clamp(2.4rem,5vw+1rem,4.5rem)] font-medium leading-[1.02] tracking-[-0.02em] text-ink-strong">
            A quieter way to keep
            <br />
            <span className="italic font-normal">cases, dates, and</span>
            <br />
            documents in order.
          </h1>
          <p className="mt-8 max-w-[52ch] text-[16px] leading-[1.65] text-ink-mute">
            CasePilot is a working tool for solo lawyers and small firms. No
            invoicing, no billing portal, no marketing analytics. One place for
            the cases on your desk and the filings due this week, with AI that
            reads documents the way a careful clerk would.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/register">
              <Button size="lg">Create an account</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:border-l lg:border-rule lg:pl-10">
          <dl className="space-y-6 text-[13px] leading-[1.55]">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Built for
              </dt>
              <dd className="mt-1.5 text-ink">
                Solo lawyers and small firms across litigation, immigration,
                family, corporate, real estate.
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Replaces
              </dt>
              <dd className="mt-1.5 text-ink">
                Folders, spreadsheets, paper. Bloated case-management suites
                you don&rsquo;t need ninety percent of.
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-faint">
                Status
              </dt>
              <dd className="mt-1.5 text-ink">
                Frontend in active build, April 2026. Single-firm tenancy.
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Daybook. Sample dashboard frame. No feature cards. Real data shape.
   ------------------------------------------------------------------ */

function Daybook() {
  return (
    <section className="border-b border-rule bg-paper-2">
      <div className="mx-auto max-w-[78rem] px-6 py-20">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-[28px] font-medium leading-tight tracking-tight text-ink-strong max-w-[28ch]">
            One glance, and you know what tomorrow looks like.
          </h2>
          <p className="max-w-[34ch] text-[14px] text-ink-mute">
            A page from the daybook of a small firm using CasePilot. Names are
            invented; the shape is real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-rule bg-rule lg:grid-cols-3">
          <DaybookColumn
            kicker="Tomorrow"
            heading="Wed, Apr 8"
            items={[
              { time: "9:00", title: "Lopez immigration · master calendar", meta: "EOIR-NYC" },
              { time: "11:30", title: "Term sheet response · Summit Corp", meta: "Reply due" },
              { time: "14:00", title: "Discovery exchange · Johnson v. Metro", meta: "Filing" },
              { time: "16:30", title: "Client call · Patel trust review", meta: "30 min" },
            ]}
          />
          <DaybookColumn
            kicker="This week"
            heading="Active cases"
            items={[
              { time: "OPEN", title: "Johnson v. Metro Corp.", meta: "Litigation · High" },
              { time: "PRO·", title: "Lopez immigration", meta: "Immigration · Med" },
              { time: "PND·", title: "Patel trust review", meta: "Family · Med" },
              { time: "OPEN", title: "Summit merger compliance", meta: "Corporate · Low" },
            ]}
          />
          <DaybookColumn
            kicker="Reading"
            heading="AI summary, drafted"
            items={[
              {
                time: "PDF",
                title: "Term sheet · 18 pages",
                meta: "3 deadlines, 2 obligations, 1 carve-out flagged.",
              },
              {
                time: "PDF",
                title: "Discovery production · 142 pages",
                meta: "Index ready. 11 references to medical records.",
              },
              {
                time: "EML",
                title: "Opposing counsel correspondence",
                meta: "Reply requested by Apr 12.",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function DaybookColumn({
  kicker,
  heading,
  items,
}: {
  kicker: string;
  heading: string;
  items: { time: string; title: string; meta: string }[];
}) {
  return (
    <div className="bg-paper p-6">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {kicker}
      </p>
      <h3 className="font-display text-[18px] font-medium leading-tight tracking-tight text-ink-strong mt-1">
        {heading}
      </h3>
      <ul className="mt-5 divide-y divide-rule">
        {items.map((item) => (
          <li key={item.title} className="flex items-baseline gap-3 py-3">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ink-faint w-12 shrink-0">
              {item.time}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] leading-snug text-ink">{item.title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-faint">
                {item.meta}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------
   Reading. Editorial prose, not a card grid.
   ------------------------------------------------------------------ */

function Reading() {
  return (
    <section className="border-b border-rule">
      <div className="mx-auto grid max-w-[78rem] gap-12 px-6 py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            What it is
          </p>
          <h2 className="font-display text-[34px] font-medium leading-[1.1] tracking-tight text-ink-strong mt-3">
            A working desk, not a dashboard.
          </h2>
        </div>

        <div className="lg:col-span-8 space-y-7 text-[15.5px] leading-[1.7] text-ink max-w-[68ch]">
          <p>
            Most legal software is a control panel for a firm of forty. It asks
            you to decide before you&rsquo;ve read anything: which workflow,
            which template, which integration, which billing code. CasePilot
            asks one question. <em className="font-display not-italic">What are you working on?</em>
          </p>
          <p>
            Cases live in a single list, sortable by status, type, priority, or
            updated date. Open one and you see the client, the timeline, and
            the documents. There are no nested drawers, no second sidebar, no
            modal stack three deep. The page is the case.
          </p>
          <p>
            AI reads the long documents you don&rsquo;t have time for. A
            seventy-page contract becomes an indexed summary you can verify
            against the source in one click. AI suggests; the lawyer decides.
            Confidence indicators tell you when to lean in and when to read for
            yourself.
          </p>
          <p>
            Assistants and lawyers see the same case at the same time, with
            roles that match how the work actually divides. The lawyer
            decides; the assistant moves the work forward. CasePilot stays out
            of the way.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------
   Colophon. Small-print disclosure block, magazine-end style.
   ------------------------------------------------------------------ */

function Colophon() {
  return (
    <section>
      <div className="mx-auto max-w-[78rem] px-6 py-20">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <h2 className="font-display text-[28px] font-medium leading-[1.15] tracking-tight text-ink-strong max-w-[18ch]">
              Sign in, or set up a firm in under a minute.
            </h2>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg">Create an account</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg">
                  I already have one
                </Button>
              </Link>
            </div>
          </div>

          <dl className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 text-[13px] leading-[1.6] self-end">
            <ColophonRow term="Tenancy" def="One isolated workspace per firm. No shared databases." />
            <ColophonRow term="Stack" def="Next.js, React, Tailwind. Frontend repo, separate API." />
            <ColophonRow term="Data" def="No sensitive material in local storage. Encrypted in transit." />
            <ColophonRow term="Pricing" def="Direct sale to firms. No credit card on the landing page." />
          </dl>
        </div>
      </div>
    </section>
  );
}

function ColophonRow({ term, def }: { term: string; def: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {term}
      </dt>
      <dd className="mt-1 text-ink">{def}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------
   Footer.
   ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="border-t border-rule">
      <div className="mx-auto flex max-w-[78rem] flex-wrap items-center justify-between gap-4 px-6 py-6 text-[12px] text-ink-faint">
        <span className="font-display text-ink">
          CasePilot<span className="text-claret">.</span>
        </span>
        <span>
          &copy; {new Date().getFullYear()} CasePilot. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
