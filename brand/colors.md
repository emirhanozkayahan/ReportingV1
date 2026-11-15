# Orvalot — Semantic color system (draft v1)

All text pairs meet WCAG AA (≥ 4.5:1). Chart colors meet ≥ 3:1 against their surface.
Contrast values computed with the WCAG 2.x relative-luminance formula.

## Brand

| Token | Light | Dark | Use |
|---|---|---|---|
| `brand` | `#176B5B` (5.99 on bg) | `#5FCFB2` (8.77 on surface) | Primary buttons, active nav, focus, links |
| `on-brand` | `#FFFFFF` (6.38) | `#0F1614` (9.65) | Text/icons on brand fills |
| `brand-subtle` | `#DDF4E9` | `#173A31` | Selected rows, active nav background |
| `accent` (Coral) | `#FF7657` | `#FF8A6E` | **Decorative only** in light mode (2.47:1 — never body text). Logo detail, highlights, illustrations |
| `accent-text` | `#C2452B` (4.71) | `#FF8A6E` (7.23) | When coral must carry text |
| `on-accent` | `#192421` (6.07) | `#192421` | Text on coral fills |

## Neutrals

| Token | Light | Dark |
|---|---|---|
| `bg` | `#F7F8F5` | `#0F1614` |
| `surface` | `#FFFFFF` | `#17201D` |
| `border` | `#E3E7E3` | `#2C3833` |
| `text` | `#192421` (14.97) | `#EEF3F0` (16.34) |
| `text-muted` | `#5E6B66` (5.22) | `#9AA8A2` (6.74) |

## Status — never reuse brand or chart colors

| Token | Light | Dark |
|---|---|---|
| `success` | `#1E7A4F` (4.98) | `#4CC38A` (7.52) |
| `warning` | `#9A6312` (4.73) — was `#B7791F` (3.64, failed) | `#E3A43B` (7.65) |
| `error` | `#B83838` (5.38) | `#F07A7A` (6.16) |
| `info` | `#2F6DA8` (5.09) | `#6FA8E0` (6.63) |

Rule: `success` and `brand` are both green-family (1.20:1 against each other), so a status
is always shown with an icon or sign (▲ ▼ ✓ !), never by color alone, and brand teal never
encodes a data meaning (no "positive = teal").

## Chart series — no greens, no teal, no coral (those belong to brand/status)

| # | Light (on white) | Dark (on surface) |
|---|---|---|
| 1 | `#4560C9` indigo (5.57) | `#7D93E8` (5.72) |
| 2 | `#B8770F` amber (3.69) | `#E0A23D` (7.46) |
| 3 | `#8A55A8` plum (5.32) | `#B98AD6` (6.08) |
| 4 | `#3B8FB8` sky (3.62) | `#6BB8DE` (7.56) |
| 5 | `#C7487A` rose (4.53) | `#E77DA6` (6.25) |
| 6 | `#6E7F25` olive (4.44) | `#A7B75A` (7.59) |

Changes from the first brief: chart orange `#D58A36` (2.79) and olive `#8B963F` (3.21) replaced;
chart teal `#248E83` removed (clashed with brand and success); warning darkened.
