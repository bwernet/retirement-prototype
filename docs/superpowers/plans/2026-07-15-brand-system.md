# White-Label Brand System Artifact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `brand-system.html` — a self-contained interactive artifact showing that a credit union's entire brand intake (a logo + two colors) was enough to spin up a safe, accessible member experience, because the design system gave those colors exactly three jobs and reduced everything else to neutrals.

**Architecture:** Testable derivation logic lives in `brand-model.js` (pure functions, unit-tested with `node:test`, same pattern as `model.js`). The artifact page `brand-system.html` holds markup + CSS + an inline module script that imports the model; `build.mjs` inlines fonts and the model into `dist/brand-system.html`. Static-first: the markup renders a complete Lanternbay view with no JS; the script layers on preset switching, the custom color input, motion, and iframe height reporting.

**Tech Stack:** Vanilla HTML/CSS/JS, Node ≥18, no dependencies, no package.json. Existing `fonts.css` (DM Sans 400/500, base64) is reused.

**Spec:** `docs/superpowers/specs/2026-07-15-brand-system-artifact-design.md` — read it before starting any task.

## Global Constraints

- **Fictional credit unions only:** Lanternbay Credit Union, Sunwise Credit Union, Ember Valley Credit Union, and (custom mode) Anytown Credit Union. No real CU names, no "Federal" in names, no NCUA/Equal-Housing marks, no fictional personal names anywhere including commits.
- **Exact framing copy** (tests assert these strings verbatim):
  - Opening: `The entire intake from a new credit union partner: a logo and two brand colors.`
  - Closing: `Two colors, three jobs — background, headline, CTA. Everything else was reduced to a neutral system that had to work beside any brand that arrived.`
  - Footnote: `Credit unions shown are fictional; member data is synthetic; app copy is a representative reconstruction of the shipped product.`
  - Flag chip: `Flagged for partner review — relationship manager notified`
- **Shipped palette values are canonical** (from the real system; never invent alternates): grays `#161D24 #6E6E7D #9D9DA8 #E2E2E5 #F2F2F7`, white; error `#E15255`/`#F8D5D5`; announcement `#FDEBC7`; accent blue `#1C5C98`; score gradient `#F69835 → #F4C355 → #529D40`; statuses `#1E8404 #7EB52C #FFBA2C #FF8201`.
- **Artifact chrome must itself pass WCAG AA.** Text colors allowed on white: `#161D24` (15.4:1), `#6E6E7D` (5.0:1), `#1C5C98` (6.9:1). **Never `#9D9DA8` (2.7:1) or `#E2E2E5` as text** — borders/disabled fills only.
- **Role model (from the shipped system):** partner primary → `brand/background` + `brand/headline`; partner secondary → `brand/CTA`. Failure rule: darken stepwise until the role passes 4.5:1 + raise the partner-review flag. Never silently override; never fall back to a different hue.
- Fonts: DM Sans 400/500 only via `<link rel="stylesheet" href="fonts.css">` (Medium 500 is the max weight; no 600/700). No serif anywhere. No emoji anywhere (`\p{Extended_Pictographic}` must not match; use inline SVG for the flag icon).
- Motion: restrained default — ONE synchronized crossfade per preset switch (~450ms total), fixed heights, stillness between. Sanctioned exception: adjusted swatch may step visibly darker once per switch, never looping. `prefers-reduced-motion`: everything instant.
- postMessage type string: `brand-system:height`. First post must be synchronous (rAF is throttled in offscreen iframes — repo lesson from commit 78a8c89).
- Build stays dependency-free; artifact must be a single file after build.

## File Structure

- `brand-model.js` — pure logic: hex/HSL conversions, WCAG luminance + contrast, `darkenUntil`, `onColorFor`, `deriveRoles`, `deriveSecondary`, `PRESETS`, `NEUTRALS`, `SCORE`.
- `brand-model.test.mjs` — `node:test` unit tests (run `node --test brand-model.test.mjs`).
- `brand-system.html` — the artifact: inline `<style>`, static Lanternbay markup, inline `<script type="module">` importing `./brand-model.js`.
- `brand-system.test.mjs` — content-integrity checks, plain `node brand-system.test.mjs`.
- `build.mjs` — modified: appends an inline step producing `dist/brand-system.html` (fonts + model inlined).

---

### Task 1: Color math (`brand-model.js` foundations)

**Files:**
- Create: `brand-model.js`
- Create: `brand-model.test.mjs`

**Interfaces:**
- Produces: `hexToRgb(hex) -> [r,g,b]`, `rgbToHex([r,g,b]) -> '#RRGGBB'` (uppercase), `relativeLuminance(hex) -> number`, `contrast(hexA, hexB) -> number (>=1)`, `rgbToHsl([r,g,b]) -> [h,s,l] (0..1)`, `hslToRgb([h,s,l]) -> [r,g,b]`, `darken(hex, dl) -> hex` (lowers HSL lightness by `dl`). Task 2 builds on all of these.

- [ ] **Step 1: Write the failing tests**

Create `brand-model.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hexToRgb, rgbToHex, relativeLuminance, contrast, rgbToHsl, hslToRgb, darken } from './brand-model.js';

test('hex round-trips', () => {
  assert.deepEqual(hexToRgb('#1E3A5F'), [30, 58, 95]);
  assert.equal(rgbToHex([30, 58, 95]), '#1E3A5F');
  assert.equal(rgbToHex(hexToRgb('#FFC93C')), '#FFC93C');
});

test('WCAG anchors', () => {
  assert.ok(Math.abs(relativeLuminance('#FFFFFF') - 1) < 1e-9);
  assert.ok(Math.abs(relativeLuminance('#000000')) < 1e-9);
  assert.ok(Math.abs(contrast('#FFFFFF', '#000000') - 21) < 0.01);
  assert.ok(Math.abs(contrast('#000000', '#FFFFFF') - 21) < 0.01, 'order-independent');
});

test('known ratios from the spec palette', () => {
  const near = (a, b, tol = 0.05) => assert.ok(Math.abs(a - b) < tol, `${a} !~ ${b}`);
  near(contrast('#FFC93C', '#FFFFFF'), 1.54);  // Sunwise yellow fails on white
  near(contrast('#1E3A5F', '#FFFFFF'), 11.50); // Lanternbay navy passes big
  near(contrast('#6E6E7D', '#FFFFFF'), 5.01);  // gray2 is text-safe
  near(contrast('#9D9DA8', '#FFFFFF'), 2.68);  // gray3 is NOT text-safe
});

test('hsl round-trips and darken lowers lightness', () => {
  const hsl = rgbToHsl(hexToRgb('#1FA98C'));
  assert.equal(rgbToHex(hslToRgb(hsl)), '#1FA98C');
  const darker = darken('#FFC93C', 0.1);
  assert.ok(relativeLuminance(darker) < relativeLuminance('#FFC93C'));
  assert.equal(darken('#000000', 0.1), '#000000', 'floor at black');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test brand-model.test.mjs`
Expected: FAIL — `Cannot find module ... brand-model.js`.

- [ ] **Step 3: Implement the color math**

Create `brand-model.js`:

```js
// Pure color/derivation logic for the white-label brand-system artifact.
// Mirrors the shipped Silvur white-label rules: partner primary -> background +
// headline, partner secondary -> CTA; failing colors darken stepwise + flag.

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex([r, g, b]) {
  return '#' + [r, g, b].map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function rgbToHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
}

export function hslToRgb([h, s, l]) {
  if (s === 0) { const v = l * 255; return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = t => {
    t = ((t % 1) + 1) % 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
}

export function darken(hex, dl) {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s, Math.max(0, l - dl)]));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test brand-model.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add brand-model.js brand-model.test.mjs
git commit -m "feat: brand-model color math — WCAG luminance/contrast, HSL darken"
```

---

### Task 2: Role derivation (`deriveRoles`, presets, palette)

**Files:**
- Modify: `brand-model.js` (append)
- Modify: `brand-model.test.mjs` (append)

**Interfaces:**
- Consumes: Task 1 functions.
- Produces (Task 3–5 rely on these exact names/shapes):
  - `NEUTRALS = { gray1:'#161D24', gray2:'#6E6E7D', gray3:'#9D9DA8', gray4:'#E2E2E5', gray5:'#F2F2F7', white:'#FFFFFF', errorText:'#E15255', errorBg:'#F8D5D5', announcementBg:'#FDEBC7', accentBlue:'#1C5C98' }`
  - `SCORE = { gradient: ['#F69835','#F4C355','#529D40'], statuses: ['#1E8404','#7EB52C','#FFBA2C','#FF8201'] }`
  - `PRESETS` — array of `{ id, name, primary, secondary }` for lanternbay/sunwise/embervalley.
  - `onColorFor(fill) -> { color, ratio }` — white or gray1, whichever contrasts more.
  - `darkenUntil(hex, against, target=4.5) -> { color, adjusted, steps }` — steps is the array of intermediate hexes (for the step-down motion).
  - `deriveRoles(primary, secondary) -> { background: {fill, raw, adjusted, onColor, ratio}, headline: {color, raw, adjusted, ratio, rawRatio, steps}, cta: {fill, raw, adjusted, onColor, ratio}, flagged: string[] }`
  - `deriveSecondary(primary) -> hex` — deterministic CTA color for custom mode.

- [ ] **Step 1: Append failing tests**

Append to `brand-model.test.mjs`:

```js
import { NEUTRALS, SCORE, PRESETS, onColorFor, darkenUntil, deriveRoles, deriveSecondary } from './brand-model.js';

test('darkenUntil: hostile yellow darkens to pass, with visible steps', () => {
  const fix = darkenUntil('#FFC93C', '#FFFFFF', 4.5);
  assert.equal(fix.adjusted, true);
  assert.ok(contrast(fix.color, '#FFFFFF') >= 4.5);
  assert.ok(fix.steps.length > 3, 'multiple visible steps for the motion');
  const ok = darkenUntil('#1E3A5F', '#FFFFFF', 4.5);
  assert.equal(ok.adjusted, false);
  assert.equal(ok.color, '#1E3A5F');
  assert.equal(ok.steps.length, 0);
});

test('onColorFor picks the higher-contrast text color', () => {
  assert.equal(onColorFor('#1E3A5F').color, NEUTRALS.white);
  assert.equal(onColorFor('#FFC93C').color, NEUTRALS.gray1);
});

test('Lanternbay: every role passes raw, nothing flagged', () => {
  const p = PRESETS.find(p => p.id === 'lanternbay');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, []);
  assert.equal(r.headline.adjusted, false);
  assert.equal(r.background.onColor, NEUTRALS.white);
  assert.equal(r.cta.onColor, NEUTRALS.gray1, 'teal CTA takes ink text');
  assert.ok(r.cta.ratio >= 4.5);
});

test('Sunwise: headline adjusted + flagged; band keeps raw yellow with ink text; gray CTA passes', () => {
  const p = PRESETS.find(p => p.id === 'sunwise');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, ['headline']);
  assert.equal(r.headline.adjusted, true);
  assert.ok(r.headline.rawRatio < 4.5 && r.headline.ratio >= 4.5);
  assert.equal(r.background.fill, '#FFC93C', 'band keeps the raw brand color');
  assert.equal(r.background.onColor, NEUTRALS.gray1);
  assert.equal(r.cta.adjusted, false);
  assert.equal(r.cta.onColor, NEUTRALS.white);
});

test('Ember Valley: dark band takes white text, rose CTA takes ink text, nothing flagged', () => {
  const p = PRESETS.find(p => p.id === 'embervalley');
  const r = deriveRoles(p.primary, p.secondary);
  assert.deepEqual(r.flagged, []);
  assert.equal(r.background.onColor, NEUTRALS.white);
  assert.equal(r.cta.onColor, NEUTRALS.gray1);
});

test('every role always ends >= 4.5:1, for arbitrary hostile input', () => {
  for (const hex of ['#F2F2F7', '#FFFF00', '#00FF00', '#888888', '#FFFFFF']) {
    const r = deriveRoles(hex, hex);
    assert.ok(r.headline.ratio >= 4.5, `headline ${hex}`);
    assert.ok(r.background.ratio >= 4.5, `background ${hex}`);
    assert.ok(r.cta.ratio >= 4.5, `cta ${hex}`);
  }
});

test('deriveSecondary is deterministic and CTA-usable', () => {
  const a = deriveSecondary('#1E3A5F');
  assert.equal(a, deriveSecondary('#1E3A5F'));
  const r = deriveRoles('#1E3A5F', a);
  assert.ok(r.cta.ratio >= 4.5);
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `node --test brand-model.test.mjs`
Expected: FAIL — `NEUTRALS` etc. not exported.

- [ ] **Step 3: Implement derivation**

Append to `brand-model.js`:

```js
export const NEUTRALS = {
  gray1: '#161D24', gray2: '#6E6E7D', gray3: '#9D9DA8', gray4: '#E2E2E5', gray5: '#F2F2F7',
  white: '#FFFFFF',
  errorText: '#E15255', errorBg: '#F8D5D5',
  announcementBg: '#FDEBC7', accentBlue: '#1C5C98',
};

export const SCORE = {
  gradient: ['#F69835', '#F4C355', '#529D40'],
  statuses: ['#1E8404', '#7EB52C', '#FFBA2C', '#FF8201'],
};

export const PRESETS = [
  { id: 'lanternbay', name: 'Lanternbay Credit Union', primary: '#1E3A5F', secondary: '#1FA98C' },
  { id: 'sunwise', name: 'Sunwise Credit Union', primary: '#FFC93C', secondary: '#6E6A5E' },
  { id: 'embervalley', name: 'Ember Valley Credit Union', primary: '#6B1F2F', secondary: '#C98A8A' },
];

export function onColorFor(fill) {
  const w = contrast(fill, NEUTRALS.white);
  const k = contrast(fill, NEUTRALS.gray1);
  return w >= k ? { color: NEUTRALS.white, ratio: w } : { color: NEUTRALS.gray1, ratio: k };
}

export function darkenUntil(hex, against, target = 4.5) {
  let color = hex;
  const steps = [];
  while (contrast(color, against) < target) {
    const next = darken(color, 0.02);
    if (next === color) break; // black floor
    color = next;
    steps.push(color);
  }
  return { color, adjusted: color !== hex, steps };
}

// The shipped rule: a fill keeps the partner's raw color and the TEXT adapts;
// only when no text color can pass does the fill itself darken (then flag).
function fillRole(rawFill) {
  let fill = rawFill, adjusted = false;
  let on = onColorFor(fill);
  if (on.ratio < 4.5) {
    fill = darkenUntil(fill, NEUTRALS.white, 4.5).color;
    adjusted = true;
    on = { color: NEUTRALS.white, ratio: contrast(fill, NEUTRALS.white) };
  }
  return { fill, raw: rawFill, adjusted, onColor: on.color, ratio: on.ratio };
}

export function deriveRoles(primary, secondary) {
  const background = fillRole(primary);
  const h = darkenUntil(primary, NEUTRALS.white, 4.5);
  const headline = {
    color: h.color, raw: primary, adjusted: h.adjusted, steps: h.steps,
    ratio: contrast(h.color, NEUTRALS.white), rawRatio: contrast(primary, NEUTRALS.white),
  };
  const cta = fillRole(secondary);
  const flagged = [];
  if (background.adjusted) flagged.push('background');
  if (headline.adjusted) flagged.push('headline');
  if (cta.adjusted) flagged.push('CTA');
  return { background, headline, cta, flagged };
}

export function deriveSecondary(primary) {
  const [h, s] = rgbToHsl(hexToRgb(primary));
  return rgbToHex(hslToRgb([(h + 0.42) % 1, Math.max(0.35, Math.min(0.75, s)), 0.32]));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test brand-model.test.mjs`
Expected: PASS (11 tests). If `Sunwise` fails on `flagged`, check that `#6E6A5E` (their gray secondary — NOT palette gray2 `#6E6E7D`) is the preset value.

- [ ] **Step 5: Commit**

```bash
git add brand-model.js brand-model.test.mjs
git commit -m "feat: brand role derivation — three roles, darken-until-passes + flag, presets"
```

---

### Task 3: Static artifact + content-integrity test

**Files:**
- Create: `brand-system.html`
- Create: `brand-system.test.mjs`

**Interfaces:**
- Consumes: `fonts.css` via `<link rel="stylesheet" href="fonts.css">` (this exact tag; build replaces it).
- Produces: complete static page rendering Lanternbay with element ids the script (Task 4) binds to: `#presets` (contains three `button.preset`), `#customColor` (input), `#stage`, `#phone`, `#roles` (three `.role` rows with `data-role="background|headline|cta"`), `#neutrals`, `#live` (aria-live). CSS custom properties on `#stage`: `--bg`, `--on-bg`, `--headline`, `--cta`, `--on-cta`.

- [ ] **Step 1: Write the failing content-integrity test**

Create `brand-system.test.mjs`:

```js
// Content-integrity checks for the brand-system artifact. Guards the spec's
// honesty rules: exact framing copy, fictional names only, shipped palette,
// no emoji, no serif, accessibility + behavior hooks present.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('brand-system.html', 'utf8');

// Framing copy — exact.
assert.ok(html.includes('The entire intake from a new credit union partner: a logo and two brand colors.'), 'opening line');
assert.ok(html.includes('Two colors, three jobs — background, headline, CTA. Everything else was reduced to a neutral system that had to work beside any brand that arrived.'), 'closing caption');
assert.ok(html.includes('Credit unions shown are fictional; member data is synthetic; app copy is a representative reconstruction of the shipped product.'), 'disclosure footnote');
assert.ok(html.includes('Flagged for partner review — relationship manager notified'), 'flag chip copy');

// Fictional CUs present; forbidden marks absent.
for (const name of ['Lanternbay Credit Union', 'Sunwise Credit Union', 'Ember Valley Credit Union']) {
  assert.ok(html.includes(name), `missing ${name}`);
}
assert.equal(/NCUA|Equal Housing|Federal Credit Union/i.test(html), false, 'no regulator marks / no Federal');
assert.equal(/Retire Strong|ICCU|MSUFCU|Idaho Central/i.test(html), false, 'no real partner or demo brands');

// Shipped palette values present (neutral system is a faithful reconstruction).
for (const hex of ['#161D24', '#6E6E7D', '#9D9DA8', '#E2E2E5', '#F2F2F7', '#E15255', '#F8D5D5', '#FDEBC7', '#1C5C98', '#F69835', '#F4C355', '#529D40']) {
  assert.ok(html.includes(hex), `missing shipped palette value ${hex}`);
}

// gray3/gray4 never used as chrome text colors (borders/swatches only).
assert.equal(/color:\s*#9D9DA8|color:\s*#E2E2E5/i.test(html), false, 'gray3/gray4 must not be text');

// No emoji; no serif.
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'no emoji');
assert.equal(/Georgia|Times|serif(?!-)/i.test(html.replace(/sans-serif/g, '')), false, 'no serif');

// DM Sans only, Medium (500) is the boldest weight — same rule as the
// retirement score visualizer. Every heading must set 500 explicitly
// (browser default for h1-h3 is 700).
assert.ok(html.includes("'DM Sans'"), 'DM Sans family');
assert.equal(/font-weight:\s*[679]00/.test(html), false, 'no weights above 500');
assert.equal(/<(b|strong)[\s>]/i.test(html), false, 'no b/strong elements');
// Browser default for h1-h3 is 700 — each heading selector must pin 500.
assert.ok(/\.opening\s*{[^}]*font-weight:\s*500/.test(html), 'h1 (.opening) pinned to 500');
assert.ok(/\.band h2\s*{[^}]*font-weight:\s*500/.test(html), 'band h2 pinned to 500');
assert.ok(/\.card h3\s*{[^}]*font-weight:\s*500/.test(html), 'card h3 pinned to 500');

// Structure + behavior hooks.
for (const hook of ['id="presets"', 'id="customColor"', 'id="stage"', 'id="phone"', 'id="roles"', 'id="live"', 'aria-live="polite"', 'data-role="background"', 'data-role="headline"', 'data-role="cta"']) {
  assert.ok(html.includes(hook), `missing hook ${hook}`);
}
assert.ok(html.includes('<link rel="stylesheet" href="fonts.css">'), 'font link (build replaces this exact tag)');
console.log('brand-system content-integrity: all checks passed');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node brand-system.test.mjs`
Expected: FAIL — `ENOENT ... brand-system.html`.

- [ ] **Step 3: Build the static page**

Create `brand-system.html`. Static defaults are Lanternbay's derived values (from Task 2 math: band `#1E3A5F`/white text, headline `#1E3A5F` 11.5:1, CTA `#1FA98C`/ink text 5.8:1). Complete file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>White-label brand system — a logo and two colors in</title>
<link rel="stylesheet" href="fonts.css">
<style>
  :root {
    --ink: #161D24; --muted: #6E6E7D; --border: #E2E2E5; --canvas: #FFFFFF;
    --panel: #F2F2F7; --accent: #1C5C98;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'DM Sans', -apple-system, sans-serif; background: var(--canvas);
    color: var(--ink); font-size: 15px; line-height: 1.45; padding: 28px 24px 20px;
  }
  .eyebrow { font-size: 11px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; color: var(--accent); }
  .opening { font-size: 19px; font-weight: 500; margin: 6px 0 24px; max-width: 560px; }
  .layout { display: grid; grid-template-columns: 220px minmax(300px, 360px) 1fr; gap: 28px; align-items: start; }

  /* ---- intake rail ---- */
  .rail .eyebrow { color: var(--muted); }
  .preset {
    display: block; width: 100%; text-align: left; background: #fff; border: 1px solid var(--border);
    border-radius: 14px; padding: 14px; margin-top: 10px; cursor: pointer; font: inherit; color: inherit;
  }
  .preset[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
  .preset:focus-visible, #customColor:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .preset .cu { font-weight: 500; font-size: 14px; }
  .chips { display: flex; gap: 6px; margin-top: 8px; align-items: center; }
  .chip { width: 22px; height: 22px; border-radius: 6px; border: 1px solid var(--border); }
  .chips code { font-size: 11px; color: var(--muted); font-family: 'DM Sans', sans-serif; }
  .custom { margin-top: 14px; display: flex; align-items: center; gap: 10px; }
  .custom label { font-size: 13px; color: var(--muted); }
  #customColor { width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 8px; padding: 2px; background: #fff; cursor: pointer; }

  /* ---- stage (phone + roles crossfade together) ---- */
  #stage { display: contents; }
  #phone, #rolesPanel { transition: opacity 220ms ease; }
  .fading #phone, .fading #rolesPanel { opacity: 0; }
  @media (prefers-reduced-motion: reduce) {
    #phone, #rolesPanel, .swatch { transition: none !important; }
  }

  /* ---- member phone ---- */
  #phone {
    width: 320px; border-radius: 36px; border: 1px solid var(--border);
    box-shadow: 0 18px 40px rgba(22,29,36,.14); overflow: hidden; background: #fff; margin: 0 auto;
  }
  .band { background: var(--bg, #1E3A5F); color: var(--on-bg, #FFFFFF); padding: 18px 18px 22px; }
  .wordmark { font-size: 13px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; }
  .scorerow { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; font-size: 13px; }
  /* status green #1E8404 (shipped statuses palette), not gradient-end #529D40:
     white text needs 4.5:1 and only the darker status green passes (4.8 vs 3.4) */
  .scorechip { background: #1E8404; color: #fff; font-weight: 500; border-radius: 999px; padding: 3px 12px; }
  .band h2 { font-size: 17px; font-weight: 500; margin-top: 14px; }
  .card { background: #fff; border-radius: 16px; padding: 16px; margin: 14px 14px 0; border: 1px solid var(--border); }
  .band .card { margin: 12px 0 0; border: none; }
  .card .eyebrow { color: var(--accent); }
  .card h3 { color: var(--headline, #1E3A5F); font-size: 17px; font-weight: 500; margin: 4px 0 6px; }
  .card p { color: var(--muted); font-size: 13px; }
  .cta {
    display: block; width: 100%; margin-top: 12px; padding: 11px; border: none; border-radius: 999px;
    background: var(--cta, #1FA98C); color: var(--on-cta, #161D24); font: inherit; font-weight: 500; font-size: 14px;
  }
  .progress { height: 8px; border-radius: 999px; background: var(--border); margin-top: 10px; overflow: hidden; }
  .progress i { display: block; height: 100%; width: 32%; border-radius: 999px;
    background: linear-gradient(90deg, #F69835, #F4C355, #529D40); }
  .plabel { font-size: 12px; color: var(--muted); margin-top: 6px; }
  .powered { text-align: center; font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
    color: var(--muted); padding: 14px 0 16px; }

  /* ---- derivation panel ---- */
  #rolesPanel .eyebrow { color: var(--muted); }
  .role { border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 10px; min-height: 96px; }
  .role-head { display: flex; justify-content: space-between; font-size: 13px; }
  .role-name { font-weight: 500; }
  .role-src { color: var(--muted); }
  .role-out { display: flex; align-items: center; gap: 8px; margin-top: 10px; }
  .swatch { width: 26px; height: 26px; border-radius: 7px; border: 1px solid var(--border); transition: background-color 90ms linear; }
  .arrow { color: var(--muted); }
  .ratio { font-size: 12px; font-weight: 500; background: var(--panel); border-radius: 999px; padding: 3px 10px; }
  .badge { font-size: 11px; font-weight: 500; color: var(--accent); border: 1px solid var(--accent); border-radius: 999px; padding: 2px 8px; visibility: hidden; }
  .role.adjusted .badge { visibility: visible; }
  .role .raw-pair { display: none; align-items: center; gap: 8px; }
  .role.adjusted .raw-pair { display: flex; }
  .flag { display: flex; align-items: center; gap: 7px; margin-top: 20px; font-size: 13px; color: var(--ink);
    background: #FDEBC7; border-radius: 10px; padding: 10px 12px; visibility: hidden; }
  .flagged .flag { visibility: visible; }
  .neutrals { border: 1px solid var(--border); border-radius: 14px; padding: 14px; margin-top: 14px; }
  .nswatches { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
  .nswatches .chip { width: 26px; height: 26px; }
  .gradbar { height: 10px; border-radius: 999px; margin-top: 10px;
    background: linear-gradient(90deg, #F69835, #F4C355, #529D40); }
  .ncaption { font-size: 12px; color: var(--muted); margin-top: 10px; }

  .closing { text-align: center; font-style: italic; color: var(--muted); font-size: 13px; margin-top: 30px; }
  .footnote { text-align: center; color: var(--muted); font-size: 11px; margin-top: 8px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

  @media (max-width: 760px) {
    .layout { grid-template-columns: 1fr; }
    .rail { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
    .rail > .eyebrow { flex-basis: 100%; }
    .preset { min-width: 190px; }
  }
</style>
</head>
<body>
<p class="eyebrow">Silvur — white-label platform · design system</p>
<h1 class="opening">The entire intake from a new credit union partner: a logo and two brand colors.</h1>

<div class="layout">
  <div class="rail" id="presets" role="group" aria-label="What a new partner sent us">
    <p class="eyebrow">What a new partner sent us</p>
    <button class="preset" data-id="lanternbay" aria-pressed="true">
      <span class="cu">Lanternbay Credit Union</span>
      <span class="chips"><i class="chip" style="background:#1E3A5F"></i><i class="chip" style="background:#1FA98C"></i><code>#1E3A5F · #1FA98C</code></span>
    </button>
    <button class="preset" data-id="sunwise" aria-pressed="false">
      <span class="cu">Sunwise Credit Union</span>
      <span class="chips"><i class="chip" style="background:#FFC93C"></i><i class="chip" style="background:#6E6A5E"></i><code>#FFC93C · #6E6A5E</code></span>
    </button>
    <button class="preset" data-id="embervalley" aria-pressed="false">
      <span class="cu">Ember Valley Credit Union</span>
      <span class="chips"><i class="chip" style="background:#6B1F2F"></i><i class="chip" style="background:#C98A8A"></i><code>#6B1F2F · #C98A8A</code></span>
    </button>
    <div class="custom">
      <input type="color" id="customColor" value="#1C5C98" aria-label="Try any color as a brand primary">
      <label for="customColor">Try any color</label>
    </div>
  </div>

  <div id="stage">
    <div id="phone" style="--bg:#1E3A5F; --on-bg:#FFFFFF; --headline:#1E3A5F; --cta:#1FA98C; --on-cta:#161D24">
      <div class="band">
        <p class="wordmark" id="phoneWordmark">Lanternbay Credit Union</p>
        <div class="scorerow"><span>Retirement Score</span><span class="scorechip">82y 5m</span></div>
        <h2>Top priority for you:</h2>
        <div class="card">
          <p class="eyebrow">Because you're near your election age</p>
          <h3>Plan your Social Security election</h3>
          <p>Electing at the right age can add years of income to your retirement.</p>
          <button class="cta" tabindex="-1">Learn More</button>
        </div>
      </div>
      <div class="card">
        <p class="eyebrow" style="color:#6E6E7D">In progress</p>
        <h3 style="color:#161D24">Maximize your Retirement Savings</h3>
        <div class="progress"><i></i></div>
        <p class="plabel">32% complete</p>
      </div>
      <p class="powered">Powered by Silvur</p>
    </div>

    <div id="rolesPanel">
      <p class="eyebrow">What the system did with it</p>
      <div id="roles">
        <div class="role" data-role="background">
          <div class="role-head"><span class="role-name">brand/background</span><span class="role-src">← primary</span></div>
          <div class="role-out">
            <span class="swatch out" style="background:#1E3A5F"></span>
            <span class="ratio">11.5:1 AA</span>
            <span class="badge">adjusted</span>
          </div>
        </div>
        <div class="role" data-role="headline">
          <div class="role-head"><span class="role-name">brand/headline</span><span class="role-src">← primary</span></div>
          <div class="role-out">
            <span class="raw-pair"><span class="swatch raw"></span><span class="arrow">→</span></span>
            <span class="swatch out" style="background:#1E3A5F"></span>
            <span class="ratio">11.5:1 AA</span>
            <span class="badge">adjusted</span>
          </div>
        </div>
        <div class="role" data-role="cta">
          <div class="role-head"><span class="role-name">brand/CTA</span><span class="role-src">← secondary</span></div>
          <div class="role-out">
            <span class="swatch out" style="background:#1FA98C"></span>
            <span class="ratio">5.8:1 AA</span>
            <span class="badge">adjusted</span>
          </div>
        </div>
      </div>
      <p class="flag" id="flag">
        <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true"><path d="M1 1v12M1 1h9l-2 3 2 3H1" fill="none" stroke="#161D24" stroke-width="1.6" stroke-linejoin="round"/></svg>
        <span>Flagged for partner review — relationship manager notified</span>
      </p>
      <div class="neutrals" id="neutrals">
        <p class="eyebrow" style="color:#6E6E7D">Reduced to neutral — works with every brand</p>
        <div class="nswatches">
          <i class="chip" style="background:#161D24" title="#161D24"></i>
          <i class="chip" style="background:#6E6E7D" title="#6E6E7D"></i>
          <i class="chip" style="background:#9D9DA8" title="#9D9DA8"></i>
          <i class="chip" style="background:#E2E2E5" title="#E2E2E5"></i>
          <i class="chip" style="background:#F2F2F7" title="#F2F2F7"></i>
          <i class="chip" style="background:#FFFFFF" title="#FFFFFF"></i>
          <i class="chip" style="background:#F8D5D5" title="#F8D5D5"></i>
          <i class="chip" style="background:#E15255" title="#E15255"></i>
          <i class="chip" style="background:#FDEBC7" title="#FDEBC7"></i>
          <i class="chip" style="background:#1C5C98" title="#1C5C98"></i>
        </div>
        <div class="gradbar" title="#F69835 #F4C355 #529D40"></div>
        <p class="ncaption">Text, cards, borders, icons, errors, announcements — and the Retirement Score gradient, a semantic trust color that never takes brand.</p>
      </div>
    </div>
  </div>
</div>

<p class="closing">Two colors, three jobs — background, headline, CTA. Everything else was reduced to a neutral system that had to work beside any brand that arrived.</p>
<p class="footnote">Credit unions shown are fictional; member data is synthetic; app copy is a representative reconstruction of the shipped product.</p>
<p id="live" class="sr-only" aria-live="polite"></p>
<script type="module" src="brand-app-placeholder"></script>
</body>
</html>
```

Note: the last `<script>` line is replaced in Task 4 with the real inline module script; keep it for now so the file is complete.

- [ ] **Step 4: Run the content test**

Run: `node brand-system.test.mjs`
Expected: PASS — `brand-system content-integrity: all checks passed`.

- [ ] **Step 5: Visual sanity check**

Run: `node serve.mjs` (or the `prototype` launch config) and open `http://localhost:8000/brand-system.html`.
Expected: three-column layout, Lanternbay phone with navy band + teal CTA, three role rows, neutral strip. No JS behavior yet.

- [ ] **Step 6: Commit**

```bash
git add brand-system.html brand-system.test.mjs
git commit -m "feat: brand-system static artifact — Lanternbay default, three roles, neutral system"
```

---

### Task 4: Interactive rendering — presets, crossfade, custom color, flag, motion

**Files:**
- Modify: `brand-system.html` (replace the placeholder script tag)
- Modify: `brand-system.test.mjs` (append script-invariant checks)

**Interfaces:**
- Consumes: `deriveRoles`, `deriveSecondary`, `PRESETS`, `NEUTRALS` from `./brand-model.js`; element ids from Task 3.
- Produces: the exact import line `import { PRESETS, NEUTRALS, deriveRoles, deriveSecondary } from './brand-model.js';` — Task 5's build step string-replaces this line, verbatim.

- [ ] **Step 1: Append failing script-invariant checks**

Append to `brand-system.test.mjs` (before the final `console.log`):

```js
// Script invariants (Task 4+).
assert.ok(html.includes("import { PRESETS, NEUTRALS, deriveRoles, deriveSecondary } from './brand-model.js';"), 'model import line (build replaces this exact string)');
assert.ok(html.includes('brand-system:height'), 'height postMessage type');
assert.ok(html.includes('prefers-reduced-motion'), 'reduced-motion gate in script');
assert.ok(html.includes('Anytown Credit Union'), 'custom-mode wordmark');
```

Run: `node brand-system.test.mjs`
Expected: FAIL on the import line.

- [ ] **Step 2: Replace the placeholder script with the app script**

In `brand-system.html`, replace `<script type="module" src="brand-app-placeholder"></script>` with:

```html
<script type="module">
import { PRESETS, NEUTRALS, deriveRoles, deriveSecondary } from './brand-model.js';

const $ = s => document.querySelector(s);
const phone = $('#phone'), rolesPanel = $('#rolesPanel'), live = $('#live'), stageWrap = $('#stage');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let animToken = 0;

const fmt = r => `${(Math.round(r * 10) / 10).toFixed(1)}:1 AA`;

function paintRole(el, { out, raw, ratio, adjusted, steps }) {
  const token = ++animToken;
  el.classList.toggle('adjusted', adjusted);
  const outSw = el.querySelector('.swatch.out');
  const rawSw = el.querySelector('.swatch.raw');
  if (rawSw) rawSw.style.background = raw;
  el.querySelector('.ratio').textContent = fmt(ratio);
  if (adjusted && steps && steps.length && !reduced.matches) {
    // Story-serving motion: perform the guardrail — step darker until it passes.
    const frames = steps.filter((_, i) => i % Math.ceil(steps.length / 6) === 0).concat(out);
    outSw.style.background = raw;
    frames.forEach((c, i) => setTimeout(() => { if (animToken === token) outSw.style.background = c; }, 120 * (i + 1)));
  } else {
    outSw.style.background = out;
  }
}

function render(name, primary, secondary, wordmark) {
  const r = deriveRoles(primary, secondary);
  phone.style.setProperty('--bg', r.background.fill);
  phone.style.setProperty('--on-bg', r.background.onColor);
  phone.style.setProperty('--headline', r.headline.color);
  phone.style.setProperty('--cta', r.cta.fill);
  phone.style.setProperty('--on-cta', r.cta.onColor);
  $('#phoneWordmark').textContent = wordmark;
  paintRole($('[data-role="background"]'), { out: r.background.fill, raw: r.background.raw, ratio: r.background.ratio, adjusted: r.background.adjusted });
  paintRole($('[data-role="headline"]'), { out: r.headline.color, raw: r.headline.raw, ratio: r.headline.ratio, adjusted: r.headline.adjusted, steps: r.headline.steps });
  paintRole($('[data-role="cta"]'), { out: r.cta.fill, raw: r.cta.raw, ratio: r.cta.ratio, adjusted: r.cta.adjusted });
  rolesPanel.classList.toggle('flagged', r.flagged.length > 0);
  live.textContent = r.flagged.length
    ? `Now showing ${name}. ${r.flagged.join(' and ')} adjusted for contrast and flagged for partner review.`
    : `Now showing ${name}. All brand roles pass contrast as sent.`;
  postHeight();
}

function switchTo(fn) {
  if (reduced.matches) return fn();
  document.body.classList.add('fading');
  setTimeout(() => { fn(); document.body.classList.remove('fading'); }, 230);
}

for (const btn of document.querySelectorAll('.preset')) {
  btn.addEventListener('click', () => {
    for (const b of document.querySelectorAll('.preset')) b.setAttribute('aria-pressed', String(b === btn));
    const p = PRESETS.find(p => p.id === btn.dataset.id);
    switchTo(() => render(p.name, p.primary, p.secondary, p.name));
  });
}

$('#customColor').addEventListener('change', e => {
  for (const b of document.querySelectorAll('.preset')) b.setAttribute('aria-pressed', 'false');
  const primary = e.target.value.toUpperCase();
  switchTo(() => render('Anytown Credit Union', primary, deriveSecondary(primary), 'Anytown Credit Union'));
});

function postHeight() {
  window.parent.postMessage({ type: 'brand-system:height', height: document.documentElement.scrollHeight }, '*');
}
postHeight(); // synchronous first post — rAF is throttled in offscreen iframes
addEventListener('resize', () => requestAnimationFrame(postHeight));

// Re-render Lanternbay from the model so static markup can never drift from the math.
render(PRESETS[0].name, PRESETS[0].primary, PRESETS[0].secondary, PRESETS[0].name);
</script>
```

Note on `.fading`: the CSS from Task 3 fades `#phone` and `#rolesPanel` together when the class is set — but it was defined on `.fading #phone`. Since `#stage` is `display: contents`, the class goes on `document.body`; update the two CSS selectors from `.fading #phone, .fading #rolesPanel` — they already match `body.fading` descendants, so no CSS change is needed.

- [ ] **Step 3: Run the content test**

Run: `node brand-system.test.mjs`
Expected: PASS.

- [ ] **Step 4: Browser verification**

Serve and open `http://localhost:8000/brand-system.html`. Verify, in order:
1. Click **Sunwise**: phone band turns raw yellow with ink text; headline swatch visibly steps darker then settles; `adjusted` badge + raw→out pair appear on the headline row; the flag chip appears; card title on the phone is the darkened olive tone, NOT raw yellow.
2. Click **Lanternbay**: badge and flag disappear (space reserved — panel height must not change; if it jumps, fix with the `visibility` rules from Task 3).
3. Click **Ember Valley**: dark burgundy band, white band text, rose CTA with ink text.
4. Pick a near-white custom color (e.g. `#F5F5F5`): headline steps down dramatically, flag fires, wordmark reads "Anytown Credit Union".
5. Keyboard: Tab reaches all three presets and the color input; Enter activates; focus ring visible.
6. macOS Reduce Motion on (System Settings → Accessibility → Display): switches are instant, no step animation.

- [ ] **Step 5: Commit**

```bash
git add brand-system.html brand-system.test.mjs
git commit -m "feat: brand-system interactivity — preset switching, guardrail step-down, flag, custom color"
```

---

### Task 5: Build integration + name collision check

**Files:**
- Modify: `build.mjs` (append)
- Modify: `docs/superpowers/specs/2026-07-15-brand-system-artifact-design.md` (only if names change)

**Interfaces:**
- Consumes: the exact import line from Task 4 and the exact font link tag from Task 3.
- Produces: `dist/brand-system.html`, fully self-contained.

- [ ] **Step 1: Append the inline step to `build.mjs`**

```js
// brand-system imports brand-model.js — inline both fonts and model.
const brandModel = fs.readFileSync('brand-model.js', 'utf8').replace(/^export /gm, '');
const BRAND_IMPORT = `import { PRESETS, NEUTRALS, deriveRoles, deriveSecondary } from './brand-model.js';`;
const brandSrc = fs.readFileSync('brand-system.html', 'utf8');
if (!brandSrc.includes(BRAND_IMPORT)) throw new Error('brand-system import line drifted — update build.mjs');
const brand = brandSrc
  .replace('<link rel="stylesheet" href="fonts.css">', () => `<style>\n${fonts}</style>`)
  .replace(BRAND_IMPORT, () => brandModel);
if (brand.includes('href="fonts.css"') || brand.includes("from './brand-model.js'")) throw new Error('brand-system inline failed');
fs.writeFileSync('dist/brand-system.html', brand);
console.log(`Wrote dist/brand-system.html (${(brand.length / 1024).toFixed(0)} KB)`);
```

- [ ] **Step 2: Build and verify the dist file standalone**

Run: `node build.mjs`
Expected: all four `Wrote dist/...` lines including `dist/brand-system.html`.

Open `dist/brand-system.html` directly via `file://` (no server): fonts render, preset switching works (proves the module import was truly inlined).

- [ ] **Step 3: Name collision check**

Web-search each of: `"Lanternbay Credit Union"`, `"Sunwise Credit Union"`, `"Ember Valley Credit Union"` (also check NCUA's find-a-credit-union tool, mapping.ncua.gov). If any name matches or is confusably close to a real credit union, choose a replacement (clearly fictional, no "Federal"), update `PRESETS` in `brand-model.js`, the three preset buttons + wordmark default in `brand-system.html`, both test files, and the spec's preset table. Record the check result (searched names + date + outcome) in the commit message.

- [ ] **Step 4: Run all tests**

Run: `node --test brand-model.test.mjs && node brand-system.test.mjs && node babytalk-question.test.mjs && node --test model.test.mjs`
Expected: everything passes (proves build.mjs changes broke nothing).

- [ ] **Step 5: Commit**

```bash
git add build.mjs brand-model.js brand-system.html brand-model.test.mjs brand-system.test.mjs
git commit -m "build: inline brand-system into dist; fictional CU name collision check (searched YYYY-MM-DD: result)"
```

---

### Task 6: Final QA pass

**Files:** none created — verification only, fixes as needed.

- [ ] **Step 1: Full-flow browser QA on the dist build**

Serve the repo, open `http://localhost:8000/dist/brand-system.html`. Re-run the Task 4 Step 4 checklist (all 6 items) against the BUILT file.

- [ ] **Step 2: Responsive**

Narrow the viewport below 760px: rail becomes a horizontal row, phone stays focal, panel stacks below, no horizontal page scroll, everything still operable.

- [ ] **Step 3: Artifact-chrome contrast audit**

Run this check (the artifact's own accessibility is the argument):

```bash
node -e "
const { contrast } = await import('./brand-model.js');
const checks = [['#161D24','#FFFFFF','ink on white'],['#6E6E7D','#FFFFFF','muted on white'],['#1C5C98','#FFFFFF','accent on white'],['#161D24','#FDEBC7','flag text on announcement bg'],['#161D24','#F2F2F7','ink on panel (.ratio pill)'],['#FFFFFF','#1E8404','score chip text']];
for (const [f,b,label] of checks) { const r = contrast(f,b); console.log(label, r.toFixed(2), r>=4.5?'AA':'FAIL'); if (r<4.5) process.exit(1); }
" --input-type=module
```

Expected: every line ends `AA`. If any FAIL, change the chrome color (not the threshold) and re-run tests.

- [ ] **Step 4: Screenshot proof**

Capture the Sunwise state (flag visible, adjusted badge, yellow band) and attach/report it as proof of the money moment.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: brand-system QA fixes"  # only if fixes were needed
```

---

## Self-Review Notes

- Spec coverage: opening/closing/footnote copy (T3), three presets + custom (T2–T4), three-role derivation + confirmed failure rule + flag chip (T2, T4), neutral system with shipped palette (T3), guardrail step-down as sanctioned motion + reduced-motion (T4), synchronized crossfade (T3 CSS + T4), fixed heights via reserved `visibility` space (T3), aria-live + keyboard (T3/T4), responsive stack (T3 CSS, T6), height postMessage with synchronous first post (T4), build + single-file dist (T5), name collision check (T5), artifact-chrome AA audit (T6).
- Deliberately NOT in scope (spec non-goals): logo upload, second custom color, dark mode, dashboard content, tappable phone interior (CTA has `tabindex="-1"` for this reason).
