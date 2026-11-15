// Generates the Orvalot logo SVGs from one geometric definition.
// Run: node brand/logo/build-logo.mjs
//
// Construction (units): baseline y=140, x-height top y=40, ascender top y=0,
// stroke 22, ring outer radius 50 / inner 28, letter gap 12.
// Rule: Coral is always a *segment of a stroke* (t-crossbar right half,
// upper-right quarter of the icon's "o"), never an added mark.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));
mkdirSync(OUT, { recursive: true });

export const C = {
  teal: '#176B5B',
  mint: '#DDF4E9',
  coral: '#FF7657',
  offwhite: '#F7F8F5',
  ink: '#192421',
  black: '#000000',
  white: '#FFFFFF',
};

const f = (n) => +n.toFixed(2);
const rad = (d) => (d * Math.PI) / 180;
const pt = (cx, cy, r, deg) => [f(cx + r * Math.cos(rad(deg))), f(cy + r * Math.sin(rad(deg)))];

/** Full ring as two concentric circles (fill-rule evenodd). */
function ring(cx, cy, R, r) {
  const circ = (rr) =>
    `M${f(cx - rr)} ${cy}A${rr} ${rr} 0 1 0 ${f(cx + rr)} ${cy}A${rr} ${rr} 0 1 0 ${f(cx - rr)} ${cy}Z`;
  return circ(R) + circ(r);
}

/** Annular sector from a0 to a1 degrees (0 = right, 90 = down; SVG coordinates). */
function sector(cx, cy, R, r, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = pt(cx, cy, R, a0);
  const [x1, y1] = pt(cx, cy, R, a1);
  const [x2, y2] = pt(cx, cy, r, a1);
  const [x3, y3] = pt(cx, cy, r, a0);
  return `M${x0} ${y0}A${R} ${R} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 ${large} 0 ${x3} ${y3}Z`;
}

const rect = (x, y, w, h) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
const poly = (pts) => 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z';

// ---------- Wordmark geometry ----------
const S = 22; // stroke
const R = 50;
const r = R - S;
const CY = 90; // ring centre (x-height 40..140)

const glyphs = {
  o1: ring(50, CY, R, r),
  r: rect(112, 40, S, 100) + sector(162, CY, R, r, 180, 270),
  v: poly([[176, 40], [201, 40], [213.5, 90], [226, 40], [251, 40], [226, 140], [201, 140]]),
  a: ring(313, CY, R, r) + rect(341, 40, S, 100),
  l: rect(375, 0, S, 140),
  o2: ring(459, CY, R, r),
  // t: full-width crossbar on the x-height line; its right arm (past the stem) is Coral.
  // The left arm starts where o2's curve has already fallen away at y 40..62.
  tStem: rect(521, 14, S, 126) + rect(503, 40, 18, S),
  tCoral: rect(543, 40, 28, S),
};

const WM = { w: 571, h: 140, pad: 0 };

function wordmarkPaths(main, accent) {
  const body = ['o1', 'r', 'v', 'a', 'l', 'o2', 'tStem'].map((k) => glyphs[k]).join('');
  return (
    `<path fill="${main}" fill-rule="evenodd" d="${body}"/>` +
    `<path fill="${accent}" d="${glyphs.tCoral}"/>`
  );
}

function svg(w, h, inner, { bg, title } = {}) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${title || 'Orvalot'}">` +
    `<title>${title || 'Orvalot'}</title>` +
    (bg ? `<rect width="${w}" height="${h}" fill="${bg}"/>` : '') +
    inner +
    `</svg>\n`
  );
}

// ---------- Icon geometry (512 grid) ----------
// Ring proportion matches the wordmark (inner = 0.56 x outer).
// The "o" of the wordmark with its upper-right quarter squared off: the right angle where the
// t-crossbar meets the stem. The squared corner is Coral, so the shape (not just the colour)
// carries the idea and survives in one colour. `gap` (units) separates the corner for mono use.
function iconMark({ cx, cy, Ro, ratio = 0.56, main, accent, gap = 0 }) {
  const ri = f(Ro * ratio);
  const g = gap ? (gap / Ro) * (180 / Math.PI) : 0; // gap as degrees on the ring
  const teal = sector(cx, cy, Ro, ri, 0 + g, 270 - g);
  const corner =
    `M${f(cx + gap)} ${f(cy - Ro)}H${f(cx + Ro)}V${f(cy - gap)}H${f(cx + ri)}` +
    `A${ri} ${ri} 0 0 0 ${f(cx + gap)} ${f(cy - Math.sqrt(ri * ri - gap * gap))}Z`;
  return `<path fill="${main}" d="${teal}"/><path fill="${accent}" d="${corner}"/>`;
}

function appIcon({ size = 512, bg = C.teal, main = C.white, accent = C.coral, ratio = 0.56, Ro = 150, gap = 0, radius = 112 }) {
  return svg(
    size,
    size,
    `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` +
      iconMark({ cx: size / 2, cy: size / 2, Ro, ratio, main, accent, gap }),
    { title: 'Orvalot' },
  );
}

const files = {
  // Wordmark
  'orvalot-wordmark.svg': svg(WM.w, WM.h, wordmarkPaths(C.teal, C.coral)),
  'orvalot-wordmark-reversed.svg': svg(WM.w, WM.h, wordmarkPaths(C.mint, C.coral)), // for Deep Teal backgrounds
  'orvalot-wordmark-ink.svg': svg(WM.w, WM.h, wordmarkPaths(C.ink, C.coral)),
  'orvalot-wordmark-black.svg': svg(WM.w, WM.h, wordmarkPaths(C.black, C.black)),
  'orvalot-wordmark-white.svg': svg(WM.w, WM.h, wordmarkPaths(C.white, C.white)),

  // Mark (transparent) and app icons
  'orvalot-mark.svg': svg(140, 140, iconMark({ cx: 70, cy: 70, Ro: 70, main: C.teal, accent: C.coral })),
  'orvalot-mark-black.svg': svg(140, 140, iconMark({ cx: 70, cy: 70, Ro: 70, main: C.black, accent: C.black, gap: 6 })),
  'orvalot-app-icon.svg': appIcon({}),
  'orvalot-app-icon-mint.svg': appIcon({ bg: C.mint, main: C.teal }),
  'orvalot-app-icon-black.svg': appIcon({ bg: C.black, main: C.white, accent: C.white, gap: 6 }),

  // Favicon: simplified for 16-24px — thicker ring, larger mark, smaller corner radius.
  'favicon.svg': appIcon({ Ro: 200, ratio: 0.46, radius: 96 }),
  'favicon-black.svg': appIcon({ bg: C.black, main: C.white, accent: C.white, Ro: 200, ratio: 0.46, radius: 96, gap: 8 }),
};

// Lockup: mark (cap height 140) + gap 36 + wordmark
const lockupW = 140 + 36 + WM.w;
files['orvalot-lockup.svg'] = svg(
  lockupW,
  140,
  iconMark({ cx: 70, cy: 70, Ro: 70, main: C.teal, accent: C.coral }) +
    `<g transform="translate(176 0)">${wordmarkPaths(C.ink, C.coral)}</g>`,
);
files['orvalot-lockup-reversed.svg'] = svg(
  lockupW,
  140,
  iconMark({ cx: 70, cy: 70, Ro: 70, main: C.mint, accent: C.coral }) +
    `<g transform="translate(176 0)">${wordmarkPaths(C.mint, C.coral)}</g>`,
);

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content);
}
console.log(`wrote ${Object.keys(files).length} files to ${OUT}`);
