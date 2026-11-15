# Orvalot logo — v1

Every SVG here is real vector geometry (`<path>` only, no embedded images), generated from
one definition in `build-logo.mjs`. Change the geometry there and run:

```bash
node brand/logo/build-logo.mjs
```

`preview.html` / `preview.png` show all variants and the favicon size test.

## Files

| File | Use |
|---|---|
| `orvalot-wordmark.svg` | **Primary.** Deep Teal + Coral on light backgrounds |
| `orvalot-wordmark-ink.svg` | Ink + Coral, for dense UI / documents |
| `orvalot-wordmark-reversed.svg` | Soft Mint + Coral on Deep Teal |
| `orvalot-wordmark-black.svg` / `-white.svg` | One colour (print, embossing, partner logos) |
| `orvalot-mark.svg` | Symbol alone, transparent |
| `orvalot-lockup.svg` / `-reversed.svg` | Symbol + wordmark |
| `orvalot-app-icon.svg` (+ `-mint`, `-black`) | App / social avatar, 512 grid |
| `favicon.svg` (+ `-black`) | Simplified for 16–32 px (thicker ring, larger corner) |

## Construction

Units: baseline 140, x-height 100, ascender 140, stroke 22, ring Ø100 (inner Ø56), letter gap 12.

- Both `o` and the bowl of `a` are the same ring.
- `r` arm is a quarter of that ring, cut vertically.
- `t` crossbar sits on the x-height line; the part right of the stem is Coral.
- Symbol = the wordmark's `o` with its upper-right quarter squared off — the right angle where the
  `t` crossbar meets its stem. That corner is Coral. Because the *shape* changes (not only the
  colour), the symbol still reads correctly in one colour.

## Clear space & minimum size

- Clear space on every side = the ring's stroke × 2 (44 units ≈ 31 % of logo height).
- Wordmark minimum: 72 px wide on screen, 18 mm in print.
- Symbol minimum: 16 px — below 32 px always use `favicon.svg`.

## Colour rules

- Coral appears **only** as a segment of a letterform (t-crossbar arm, icon corner). Never as a
  separate dot, underline, or background behind the logo.
- Light backgrounds: Teal (or Ink) + Coral. Deep Teal background: Soft Mint + Coral.
- Busy photos / unknown backgrounds: one-colour white or black.
- Do not recolour, outline, stretch, add effects, or rebuild the wordmark in a font.

| Name | Hex |
|---|---|
| Deep Teal | `#176B5B` |
| Soft Mint | `#DDF4E9` |
| Coral | `#FF7657` |
| Off White | `#F7F8F5` |
| Ink | `#192421` |
