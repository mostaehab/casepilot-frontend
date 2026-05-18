# CasePilot Design System

Companion to `PRODUCT.md`. The design direction is locked here so future polish, components, and screens converge on the same look instead of drifting back into legal-SaaS reflexes.

## Scene sentence

A solo immigration lawyer opens tomorrow's hearing prep on her laptop at 4pm. The chrome around her workspace — sidebar, top bar, primary actions — reads as a serious tool: deep navy, dense, productized. The workspace itself reads as the desk it replaces: warm cream, generous type, calm.

The sentence forces a **two-zone composition** (dark chrome around a light workspace, not a single flat surface), **navy as ink** (authority without going corporate-cobalt), **warm cream as page** (escape from the gray-on-gray B2B default), and **typography-led hierarchy** (a single Geist family, tightened on display, doing the work via size/weight/tracking rather than font-family swaps).

## Color strategy

**Two zones, one accent.**

- **Chrome** (sidebar, primary buttons, brand mark, active surfaces) — **navy ink**. A deep, slightly cool navy that reads as authority without going full corporate cobalt. Carries the SaaS-shell signal.
- **Workspace** (page background, cards, tables, editor surfaces) — **warm cream**. A paper-toned off-white with enough warmth to feel intentional, never the glacial gray of a generic dashboard.
- **Accent** — **warm amber**. A single committed pop reserved for hero CTAs, brand identity, and the active-rail marker on navigation. Vivid enough to register, warm enough to live with the cream.

Functional semantic roles (success, warning, danger) appear only on real state, never as decoration.

The first-order legal-tech reflex (cobalt-on-white corporate SaaS) is still rejected — ours is a deeper editorial navy, paired with cream rather than glacial gray, and stamped with a warm amber rather than gold. The combination is uncommon in B2B and unheard of in legal SaaS, which is the point.

### Palette (OKLCH only)

All values live as CSS variables in `app/globals.css`. Tailwind reads them through `@theme inline`.

**Page neutrals — warm cream, hue 75, low chroma:**

| Token | OKLCH | Use |
|---|---|---|
| `--page` | `oklch(98% 0.010 75)` | Page background. Never `#fff`. |
| `--page-2` | `oklch(95.5% 0.014 75)` | Raised surface, top nav bg, subtle stripe. |
| `--page-3` | `oklch(92% 0.016 75)` | Hover state, table header bg. |
| `--page-mute` | `oklch(74% 0.020 75)` | Muted text on dark navy surfaces. |
| `--page-faint` | `oklch(60% 0.018 75)` | Faint text on dark navy surfaces. |
| `--rule` | `oklch(87% 0.016 75)` | Borders, dividers. |
| `--rule-strong` | `oklch(76% 0.014 75)` | Strong dividers, input borders on focus path. |

**Ink — navy-tinted text scale, hue 250:**

| Token | OKLCH | Use |
|---|---|---|
| `--ink-faint` | `oklch(56% 0.030 250)` | Tertiary text, metadata. |
| `--ink-mute` | `oklch(40% 0.040 250)` | Secondary text, labels. |
| `--ink` | `oklch(22% 0.050 250)` | Primary text. Never `#000`. |
| `--ink-strong` | `oklch(14% 0.045 250)` | Headlines, emphasis. |

**Navy — chrome surface family, hue 250:**

| Token | OKLCH | Use |
|---|---|---|
| `--navy` | `oklch(24% 0.070 250)` | Primary button bg, brand mark, lifted active surface inside dark sidebar. |
| `--navy-hover` | `oklch(20% 0.070 250)` | Primary button hover. |
| `--navy-deep` | `oklch(16% 0.060 250)` | Sidebar background, deepest chrome. |
| `--navy-soft` | `oklch(94% 0.020 250)` | Light navy tint on page (selected row, soft badge). |
| `--navy-faint` | `oklch(97% 0.012 250)` | Subtle wash, focus halo offset. |

**Accent — warm amber, hue 50:**

| Token | OKLCH | Use |
|---|---|---|
| `--accent` | `oklch(68% 0.170 50)` | Hero CTA, brand pop, sidebar active-rail marker. |
| `--accent-hover` | `oklch(62% 0.180 50)` | Accent button hover. |
| `--accent-soft` | `oklch(94% 0.035 50)` | Badge bg, soft highlight. |
| `--accent-faint` | `oklch(98% 0.015 50)` | Subtle wash. |
| `--accent-ink` | `oklch(42% 0.160 50)` | Text on accent-soft. |

**Functional state — used for state, never decoration:**

| Token | OKLCH | Use |
|---|---|---|
| `--ok` | `oklch(48% 0.10 150)` | Success state, "in progress" status. Forest green, not wellness teal. |
| `--ok-soft` | `oklch(95% 0.025 150)` | Success badge bg. |
| `--warn` | `oklch(72% 0.13 88)` | Warning, "pending" status, deadline soon. Yellow-amber, distinct from brand accent. |
| `--warn-soft` | `oklch(95% 0.04 88)` | Warning badge bg. |
| `--alarm` | `oklch(54% 0.20 25)` | Errors, high-priority, destructive actions. Clear red, distinct from amber. |
| `--alarm-soft` | `oklch(95% 0.03 25)` | Alarm badge bg, error inline. |

### Color rules

- **Primary action = navy.** Filled navy button on cream is the default primary CTA. Amber is reserved for the *brand* CTA (one per page max — typically the hero, the upgrade, the "new case" entry point) and for the active-rail marker in the sidebar.
- **Sidebar is dark, top nav is light.** The dark sidebar is the SaaS-shell signal; the light top nav lets the workspace breathe. Don't darken both.
- **Functional colors are never decorative.** No "this card is the green card and that one is the purple card." No tinted icon backgrounds for category. Icons sit on `--ink-mute` unless they represent live state.
- **AI surfaces are monochrome at rest.** No accent, no purple, no sparkle. AI features are quiet utilities; their UI is the work, not a flag that says "AI is here."
- **Status badges** are the only place semantic color tints appear at rest. Even there, the color is the meaning, not the decoration.
- **No #fff, no #000.** Page is cream; ink is navy. The pure-grayscale shortcut breaks the palette's character.

### Anti-generic checklist

When a screen looks generic, the cause is almost always one of these:

1. Cream drifted toward white (lost the warmth that distinguishes us).
2. Navy drifted toward black/graphite (lost the navy-not-corporate distinction).
3. Amber got used for non-brand decoration (diluted the single committed accent).
4. The display utility was dropped on a display moment (loose tracking + default weight = generic SaaS).
5. A second accent crept in (collapsed the palette into rainbow SaaS).

## Typography

**Single-font SaaS system: Geist Sans for everything, Geist Mono for IDs.** Newsreader (the previous editorial serif) was retired when the product moved to the denser dashboard direction — a serif headline against a SaaS shell read as a half-commit. Geist (Vercel's typeface) is distinctive enough that pairing it with the navy/cream palette doesn't read as Inter-clone, and the single-font system is itself a SaaS signal: dashboards that pair display-serif + UI-sans almost always look editorial-marketing rather than productized.

The personality lever is no longer the serif — it's:
- **Tight tracking on display sizes** (`-0.022em` via the `.font-display` utility) — gives headlines an intentional, designed feel rather than the loose default Geist tracking.
- **Stylistic sets** (`ss01`, `ss03`, `cv11`) — Geist's alternate forms for `a`, `g`, single-story shapes. Subtle but specific.
- **Mid weight for display** (`540`, not `600+`) — keeps headlines confident without screaming.

**Display utility:** `.font-display` uses Geist Sans + tight tracking + stylistic sets + weight 540. Apply to anything that's titled or headline-shaped. Body and UI use the default Geist Sans face.

**Mono: Geist Mono.** Used for case IDs, bar/license numbers, code-shaped data.

### Scale (≥1.25 contrast between steps)

| Step | Size / line-height | Weight | Treatment |
|---|---|---|---|
| Display | `clamp(2.25rem, 4vw + 1rem, 3.5rem)` / 1.05 | 540 | `.font-display` (tight tracking, ss01/ss03/cv11) |
| Title | `1.5rem` (24px) / 1.2 | 540 | `.font-display` |
| Section | `1.0625rem` (17px) / 1.35 | 540 | `.font-display` |
| Body | `0.9375rem` (15px) / 1.55 | 400 | Geist |
| Body-S | `0.8125rem` (13px) / 1.5 | 400 | Geist |
| Label | `0.75rem` (12px) / 1.4 | 520 letter-spacing 0.01em | Geist |
| Caption | `0.6875rem` (11px) / 1.4 | 600 letter-spacing 0.16em uppercase | Geist |

Body text is capped at 65–72ch. The all-Geist system means hierarchy comes from size + weight + tracking, not from font-family swaps — this is the SaaS-dashboard idiom (Linear, Vercel, Cron) and is what the shift away from Newsreader commits to.

## Spacing & layout

Spacing scale follows Tailwind's 4px step. Vertical rhythm is varied deliberately: section gaps are 40–64px, card-internal gaps are 16–24px, list-item gaps are 8–12px. **Equal padding on every block is monotony**; rhythm comes from the gap between things.

- Cards: bordered, never shadowed by default. `--rule` border, `--page` fill, internal padding 20–24px. **No nested cards, ever.**
- Tables: zero card chrome. Header row uses `--page-3` bg with `--ink-faint` caption-style label. Rows separated by `--rule`. Row hover uses `--page-2`.
- Container max-widths vary by surface. Marketing: 64rem. Dashboard content: full width up to 80rem with 24px gutter. Settings, forms: 40rem.

## Elevation

- `--shadow-paper` — `0 1px 0 0 oklch(0% 0 0 / 0.05)` — used only on sticky headers, popovers.
- Shadows on cards at rest = banned. Lift by border or by `--page-2` fill, not by drop shadow. (Pop-up surfaces and toasts may use shadow; cards may not.)

## Motion

- 150–250ms, ease-out (cubic-bezier `.22 1 .36 1` ≈ ease-out-quart).
- Animate opacity and transform only. Never `width`, `height`, `padding`, `margin`, `top`, `left`.
- No bounce, no elastic, no spring overshoot.
- `prefers-reduced-motion: reduce` collapses durations to 0.

## Components (current)

Live in `components/ui/`. Their public API stays stable; this section names what each represents in the new direction.

- **Button.** `primary` is filled navy on cream — `--navy` bg, `--page` text, `--navy-hover` on hover. `accent` is filled amber — `--accent` bg, `--ink-strong` text — reserved for the single brand CTA per surface. `outline` is `--rule` border on `--page`. `ghost` is text only. `destructive` is `--alarm`. No glass, no gradient.
- **Input.** `--rule` border, focus ring is `--accent-soft` outline at 3px offset 0 + `--navy` border. No filled focus halo.
- **Badge.** Variants tie to `case-utils.ts` (`accent`, `success`, `warning`, `danger`, `neutral`, `purple`). After polish, `accent` = amber; `purple` keeps the API surface but is treated as `neutral` (no rainbow).
- **Card.** Border + page fill. Padding utility, no shadow at rest.
- **Sidebar.** `--navy-deep` background, `--page` text, `--page-mute` for muted/secondary items, `--navy` lifted bg for active item, `--accent` 2px left rail marker on active.

## Bans (project-specific, in addition to `/impeccable` shared bans)

- No sparkle icons paired with the word "AI."
- No icon-tint-by-category in feature grids or stat cards.
- No glass nav (`bg-white/N backdrop-blur`) on solid pages.
- No dark "branding" panel in auth split-screen — the whole shell is the brand surface; the auth form sits on the cream workspace.
- No "✨ trusted by 10,000 lawyers" hero metrics.
- No decorative red-dot count over `9` on bell icons.
- No second accent. Amber is the only brand pop. Adding a teal/violet/coral "for variety" reverts us to rainbow SaaS.
