# Orvalot — Design system

Read this before touching any UI. Tokens live in `app/globals.css`; the logo lives in
`components/brand/logo.tsx` (source: `brand/logo/`). Colour rationale and contrast values:
`brand/colors.md`.

## Character
Calm but not cold. Confident, not flashy. Professional, not corporate-dull. Linear/Vercel interface
discipline with Stripe/Arc warmth — copy neither. Quality shows through precision, not effects.
**Minimal with character**: one Deep Teal, a little Mint, Coral as a rare signature.

## Hard bans
Purple-blue gradients · neon · glassmorphism · glow · 3D · gradient text · sparkle/AI-brain/circuit/rocket/
rising-arrow/magnifier icons · decorative blobs · over-rounded pill-everything · shadows on default cards ·
emoji as UI · hardcoded hex colours in components (use tokens) · Coral as body text on light backgrounds.

## Colour — always use the semantic utilities
| Utility | Use |
|---|---|
| `bg-bg` | page background (Off White / near-black) |
| `bg-surface` | cards, panels, table bodies, inputs |
| `bg-sunken` | table headers, wells, code, skeletons |
| `border-line` / `border-line-strong` | default 1px borders / hover & input borders |
| `text-fg` / `text-fg-muted` | primary / secondary text (both AA) |
| `bg-brand text-on-brand`, `hover:bg-brand-hover` | primary buttons, active states |
| `bg-brand-subtle text-on-brand-subtle` | selected nav item, selected row, brand chips |
| `text-brand` | links, active icons |
| `bg-accent` / `text-accent-fg` | Coral — tiny signature details only (logo, one highlight per view). Never a button colour |
| `success / warning / error / info` (+ `-subtle`) | status only, **always with an icon or sign** (▲ ▼ ✓ !) |
| `chart-1 … chart-6` | data series, fixed order; never brand teal, status colours or coral in charts |

Light/dark is automatic (OS) and can be forced with `<html data-theme="dark|light">`; the `dark:`
variant targets the forced theme only — prefer tokens over `dark:` overrides.

Data colour meaning: positive change = `text-success` + ▲, negative = `text-error` + ▼. For metrics where
"down is good" (cost, CPA) flip the colour, not the arrow.

## Typography
- Display / headings / KPI numbers: **Manrope** → `font-display`
- Interface & body: **IBM Plex Sans** → `font-sans` (default)
- Every number in a table, KPI, chart axis or tooltip: `num` utility (tabular figures)

| Utility | Size / line | Weight | Use |
|---|---|---|---|
| `text-page` | 28/36 | 600 | page title (font-display) |
| `text-section` | 20/28 | 600 | section title (font-display) |
| `text-card` | 15/22 | 600 | card title |
| `text-body` | 14/22 | 400 | default text |
| `text-label` | 12/18 | 500 | labels, table headers, captions |
| `text-kpi` | 30/38 | 600 | KPI values (font-display + num) |

Landing page may go larger (display sizes 40–72px, Manrope 600–700, tight tracking −0.02em).
Turkish text: use `tr` locale for upper-casing (`toLocaleUpperCase('tr-TR')`); avoid all-caps labels.

## Space, size, radius
- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 px (Tailwind 1, 2, 3, 4, 6, 8). Page gutter 24px desktop, 16px mobile.
- Radius: `rounded-input` 6 · `rounded-button` 8 · `rounded-card` 10 · `rounded-modal` 12.
- Buttons: height 36px (h-9) standard, 40px (h-10) large; padding x 12–16px.
- Table rows: 44px (h-11), compact 36px (h-9).
- Icons: lucide-react, 20px default (16px in dense rows), strokeWidth 1.75.

## Elevation
Cards = `bg-surface border border-line rounded-card`, **no shadow**. Only overlays (dropdown, popover,
modal, toast) get `shadow-popover`.

## Motion (Emil Kowalski principles — skill `emil-design-eng`)
- Durations: `duration-fast` 120ms (hover, press), `duration-base` 180ms (popovers, tabs), `duration-slow` 220ms (modals, drawers). Nothing UI-level over 300ms.
- Easing: `ease-out` (custom strong ease-out) for enter/exit; never `linear` or default `ease` for UI.
- Animate only `transform` and `opacity`. Never animate from `scale(0)` — start at 0.96–0.98.
- Buttons: `active:scale-[0.98]`. Popovers scale from their trigger (`transform-origin`).
- Respect `prefers-reduced-motion` (handled globally in globals.css).
- No motion on data that changes often (numbers, table refreshes); no page-load stagger on Operate screens.

## Components (conventions)
- **KPI card:** label (`text-label text-fg-muted`), value (`text-kpi font-display num`), delta chip (success/error + ▲▼ + %), comparison caption ("önceki 30 güne göre").
- **Table:** header `bg-sunken text-label text-fg-muted`, rows 44px, `border-b border-line`, numeric columns right-aligned + `num`, row hover `bg-sunken`.
- **Inputs:** `h-9 rounded-input border border-line-strong bg-surface px-3`, focus = global focus ring; error = `border-error` + message `text-error text-label`.
- **Buttons:** primary `bg-brand text-on-brand`, secondary `bg-surface border border-line-strong text-fg`, ghost `text-fg-muted hover:bg-sunken`, destructive `bg-error text-white`. Disabled = 50% opacity, no pointer.
- **Empty states:** one sentence of what's missing + one action. No illustrations of robots/rockets.
- **Sync status:** always visible on dashboards ("Son senkronizasyon: 12 dk önce").
- **AI assistant:** an ordinary panel in the UI language, not a separately branded chatbot. No sparkles. Its statements reference the metric they explain.
- **Platform logos** (Meta, Google, ikas…) only as small identifiers next to their data, never decoration.

## Logo
`<Wordmark className="h-6 text-brand" />`, `<LogoMark />`, `<Lockup />` from `components/brand/logo.tsx`.
Body = currentColor, Coral segment = accent. On Deep Teal backgrounds use `text-brand-subtle` (Mint).
Clear space ≥ 2× stroke (≈31% of logo height). Wordmark min 72px wide. Never rebuild it with a font.

## Charts (Recharts)
Series colours `var(--color-chart-1…6)` in order; gridlines `var(--color-line)`, horizontal only; axis text
`text-label text-fg-muted num`; no chart borders, no 3D, no gradient fills (a flat 8–12% opacity area fill
is allowed); tooltip = surface + border + `shadow-popover`, values with `num`.

## Accessibility floor
AA contrast for all text (tokens already comply), visible focus on every interactive element, hit area ≥ 36px
(≥ 44px on mobile), labels on every input, colour is never the only signal, works at 320px width.
