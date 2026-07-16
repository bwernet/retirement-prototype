# Partner Dashboard Artifact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `partner-dashboard.html` — a self-contained interactive artifact walking one credit-union segment from member actions to a campaign export in three beats (Signal → Why → Act), proving the platform turned member behavior into actionable partner benefit.

**Architecture:** Single self-contained HTML page (inline CSS + inline script, same pattern as `decision-web.html` — no separate JS module; there is no derivation math here). A fixed-width (980px) dashboard frame scales down via CSS transform to fit narrower viewports. A three-beat state machine swaps content inside a fixed-height stage. `build.mjs` inlines `fonts.css` into `dist/partner-dashboard.html`.

**Tech Stack:** Vanilla HTML/CSS/JS, Node ≥18, no dependencies. Existing `fonts.css` (DM Sans 400/500 base64) reused.

**Spec:** `docs/superpowers/specs/2026-07-15-partner-dashboard-artifact-design.md` — read it before starting any task.

## Global Constraints

- **Fictional only:** the credit union is Lanternbay Credit Union (same fictional CU as the brand-system artifact — connective tissue). NO fictional personal names anywhere including commits (sidebar account reads `Marketing · Lanternbay CU`). No NCUA/Equal-Housing marks, no capital-F "Federal" (names/marks — lowercase "federal deposits" prose is legitimate), no real partner brands (Retire Strong, ICCU, MSUFCU, Idaho Central), no "Olivia" (the template placeholder name from reference screenshots).
- **Exact copy** (tests assert verbatim):
  - Footnote: `Credit union, members, and figures are fictional; segment logic is representative of the shipped product.`
  - Chain node headings: `What members did` / `What that means` / `Why Lanternbay cares` / `What to do`
  - Honesty line under the chain: `Every signal is member activity on the platform.`
  - Design notes (3):
    1. `Segments are framed as needs and recommended actions, not metrics — designed for marketers, not analysts.`
    2. `Provenance is one click away, never buried — and every signal is member activity on the platform. The insight earns trust by showing its reasoning and never claiming data it can't see.`
    3. `The workflow ends in the partner's existing tools — platform scope was a design decision, not a limitation.`
- **Hard data constraint (as shipped, confirmed):** every provenance link is a platform event or member-entered input. Never claim external banking data (e.g., where deposits land is NOT knowable — the chain says so explicitly).
- **Synthetic figures (fixed):** Direct Deposit: Social Security — 1,651 members, ~$23M/yr benefit income. Top Wealth Management Leads — 597 members, $752M investable assets. High Yield Savings Leads — 2,146 members, $350M in cash savings.
- **Anti-generic rules:** no date-range pickers, no filters, no search, no charts, no multi-page nav (sidebar items beyond Campaign Segments are muted and inert), no fake file download (no `download` attribute, no `.csv`).
- **Palette (pre-validated for AA):** canvas `#F7F8FA`; frame/cards white with border `#E2E2E5`; ink `#161D24` (15.4:1); muted `#6E6E7D` (5.0:1 on white — NEVER on `#F2F2F7`, that's 4.49); accent blue `#1C5C98`; Silvur teal fill `#0ABFAB` with INK text (7.3:1 — white text fails); teal TEXT variant `#078375` (4.65:1); Opportunity chip `#0B7D57` on `#E6F8F1` (4.67:1); Risk chip `#A65500` on `#FDEBC7` (4.56:1). Sidebar is WHITE (muted text on gray5 fails AA).
- Fonts: DM Sans 400/500 via `<link rel="stylesheet" href="fonts.css">`; **500 is the boldest weight anywhere** (every h1/h2/h3 pinned to 500 — browser default is 700); no `<b>`/`<strong>`, no serif, no emoji (inline SVG icons only).
- Motion (author's established taste): restrained; beats morph in place (~200ms, no fade-to-blank flash); the Beat-2 provenance chain may draw left-to-right ONCE per entry (staggered node reveal — this motion is the argument); no count-up numbers, no ambient/looping animation; `prefers-reduced-motion`: everything instant.
- postMessage type string: `partner-dashboard:height`; first post synchronous (rAF is throttled in offscreen iframes).
- Fixed-height stage (470px): beats swap inside it, page height never changes between beats. Whole artifact must fit an 850px-tall iframe.
- Build stays dependency-free; single file after build.

## File Structure

- `partner-dashboard.html` — the artifact: inline `<style>`, all three beats' markup (beats 2–3 present but inactive), inline `<script>` at end of body.
- `partner-dashboard.test.mjs` — content-integrity checks, plain `node partner-dashboard.test.mjs`.
- `build.mjs` — modified: appends a fonts-inline step producing `dist/partner-dashboard.html` (decision-web pattern — no module import to inline).

---

### Task 1: Content-integrity test + static artifact

**Files:**
- Create: `partner-dashboard.test.mjs`
- Create: `partner-dashboard.html`

**Interfaces:**
- Consumes: `fonts.css` via `<link rel="stylesheet" href="fonts.css">` (exact tag; build replaces it).
- Produces: element ids/classes Task 2 binds to: `#stage` (with `data-beat="1"`), `.beat.beat1/.beat2/.beat3`, `#heroCard` (a `<button>`), `#backBtn`, `#exportBtn`, `#doneBtn`, `#scrim`, `#notesToggle`, `#notesPanel`, `.notebadge` ×3, `#steps` (3 `.step` items), `#live` (aria-live), `#scaler` + `#frame` (fixed 980px width), `.chain` with 4 `li`.

- [ ] **Step 1: Write the failing content-integrity test**

Create `partner-dashboard.test.mjs`:

```js
// Content-integrity checks for the partner-dashboard artifact. Guards the
// spec's honesty rules: exact copy, fictional names only, platform-only
// provenance, anti-generic dashboard rules, font discipline, a11y hooks.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('partner-dashboard.html', 'utf8');

// Exact copy.
assert.ok(html.includes('Credit union, members, and figures are fictional; segment logic is representative of the shipped product.'), 'disclosure footnote');
for (const h of ['What members did', 'What that means', 'Why Lanternbay cares', 'What to do']) {
  assert.ok(html.includes(h), `chain heading: ${h}`);
}
assert.ok(html.includes('Every signal is member activity on the platform.'), 'honesty line');
assert.ok(html.includes('Segments are framed as needs and recommended actions, not metrics — designed for marketers, not analysts.'), 'design note 1');
assert.ok(html.includes("Provenance is one click away, never buried — and every signal is member activity on the platform. The insight earns trust by showing its reasoning and never claiming data it can't see."), 'design note 2');
assert.ok(html.includes('The workflow ends in the partner’s existing tools — platform scope was a design decision, not a limitation.') || html.includes("The workflow ends in the partner's existing tools — platform scope was a design decision, not a limitation."), 'design note 3');

// Segments + synthetic figures.
for (const s of ['Direct Deposit: Social Security', 'Top Wealth Management Leads', 'High Yield Savings Leads', '1,651', '$23M', '597', '$752M', '2,146', '$350M', 'Top Risk', 'Top Opportunity']) {
  assert.ok(html.includes(s), `segment content: ${s}`);
}

// Fictional-only + connective tissue; forbidden names/marks absent.
assert.ok(html.includes('Marketing · Lanternbay CU'), 'account line (no personal names)');
assert.ok(html.includes('Lanternbay'), 'connective-tissue CU');
assert.equal(/NCUA|Equal Housing|Retire Strong|ICCU|MSUFCU|Idaho Central|Olivia/i.test(html), false, 'no regulator marks / real brands / personal names');
// Capital-F Federal = a name/mark (forbidden); lowercase "federal deposits" is legitimate prose.
assert.equal(/\bFederal\b/.test(html), false, 'no capital-F Federal (names/marks)');

// Platform-only provenance: the chain must not claim external banking sight.
assert.ok(/can’t see where|can't see where/.test(html), 'chain states the platform cannot see deposit destinations');

// Anti-generic dashboard rules.
assert.equal(/Date Range|Filters|Search…|<input[^>]+type="search"/i.test(html), false, 'no date pickers/filters/search');
assert.equal(/\bdownload\b|\.csv/i.test(html), false, 'no fake file download');
assert.equal(/<canvas|sparkline|chart/i.test(html), false, 'no charts');

// Palette discipline (pre-validated pairs; gray3/gray4 never as text).
for (const hex of ['#F7F8FA', '#161D24', '#6E6E7D', '#E2E2E5', '#0ABFAB', '#078375', '#0B7D57', '#E6F8F1', '#A65500', '#FDEBC7']) {
  assert.ok(html.includes(hex), `palette value ${hex}`);
}
assert.equal(/color:\s*#9D9DA8|color:\s*#E2E2E5/i.test(html), false, 'gray3/gray4 must not be text');

// Font discipline: DM Sans only, 500 max, headings pinned.
assert.ok(html.includes("'DM Sans'"), 'DM Sans family');
assert.equal(/font-weight:\s*([6-9]\d\d|bold\b)/.test(html), false, 'no weights above 500');
assert.equal(/<(b|strong)[\s>]/i.test(html), false, 'no b/strong');
assert.equal(/Georgia|Times|serif(?!-)/i.test(html.replace(/sans-serif/g, '')), false, 'no serif');
assert.ok(/h1\s*{[^}]*font-weight:\s*500/.test(html), 'h1 pinned to 500');
assert.ok(/\.segcard h3\s*{[^}]*font-weight:\s*500/.test(html), 'card h3 pinned to 500');
assert.ok(/\.chain h3\s*{[^}]*font-weight:\s*500/.test(html), 'chain h3 pinned to 500');
assert.ok(/\.beat3 h2\s*{[^}]*font-weight:\s*500/.test(html), 'slide-over h2 pinned to 500');

// No emoji.
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'no emoji');

// Structure + a11y hooks (Task 2 binds to these).
for (const hook of ['id="stage"', 'data-beat="1"', 'id="heroCard"', 'id="backBtn"', 'id="exportBtn"', 'id="doneBtn"', 'id="scrim"', 'id="notesToggle"', 'id="notesPanel"', 'id="steps"', 'id="live"', 'aria-live="polite"', 'id="scaler"', 'id="frame"', 'role="dialog"', 'aria-modal="true"']) {
  assert.ok(html.includes(hook), `missing hook ${hook}`);
}
assert.ok(html.includes('<link rel="stylesheet" href="fonts.css">'), 'font link (build replaces this exact tag)');
console.log('partner-dashboard content-integrity: all checks passed');
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node partner-dashboard.test.mjs`
Expected: FAIL — `ENOENT ... partner-dashboard.html`.

- [ ] **Step 3: Build the static page**

Create `partner-dashboard.html`. Complete file (beats 2–3 in the markup, inactive until Task 2; the placeholder script tag at the end is replaced in Task 2):

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Partner dashboard — member actions to campaign</title>
<link rel="stylesheet" href="fonts.css">
<style>
  :root {
    --ink: #161D24; --muted: #6E6E7D; --border: #E2E2E5; --canvas: #F7F8FA;
    --teal: #0ABFAB; --teal-text: #078375; --accent: #1C5C98;
    --opp-bg: #E6F8F1; --opp-text: #0B7D57; --risk-bg: #FDEBC7; --risk-text: #A65500;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: var(--canvas); }
  body { font-family: 'DM Sans', -apple-system, sans-serif; background: var(--canvas); color: var(--ink);
    font-size: 14px; line-height: 1.45; padding: 20px 16px 14px; }
  h1 { font-size: 18px; font-weight: 500; letter-spacing: -0.008em; }

  /* fixed-width frame, scaled to fit narrow viewports by the script */
  #scaler { transform-origin: top left; margin: 0 auto; width: 980px; max-width: none; }
  #frame { width: 980px; background: #fff; border: 1px solid var(--border); border-radius: 18px;
    box-shadow: 0 1px 2px rgba(22,29,36,.05), 0 10px 30px rgba(22,29,36,.07);
    display: grid; grid-template-columns: 212px 1fr; overflow: hidden; }

  /* ---- sidebar (white — muted text fails AA on gray5) ---- */
  .sidebar { border-right: 1px solid var(--border); padding: 20px 16px 16px; display: flex; flex-direction: column; min-height: 620px; }
  .logotype { font-size: 16px; letter-spacing: -0.01em; }
  .logotype .silvur { font-weight: 500; }
  .logotype .partners { font-weight: 500; font-size: 11px; letter-spacing: .16em; color: var(--teal-text); margin-left: 5px; }
  .nav { margin-top: 26px; display: flex; flex-direction: column; gap: 2px; }
  .nav span { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 9px; font-size: 13.5px; color: var(--muted); }
  .nav .active { background: #F2F2F7; color: var(--ink); font-weight: 500; }
  .nav .sub { padding-left: 34px; font-size: 13px; }
  .nav svg { flex: none; }
  .sidebar .spacer { flex: 1; }
  .account { border-top: 1px solid var(--border); padding-top: 12px; display: flex; align-items: center; gap: 9px; }
  .account svg { flex: none; color: #1E3A5F; }
  .account span { font-size: 12.5px; color: var(--muted); line-height: 1.3; }

  /* ---- main ---- */
  .main { padding: 20px 22px 18px; }
  .mainhead { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  #notesToggle { font: inherit; font-size: 12.5px; font-weight: 500; color: var(--accent); background: none;
    border: 1px solid var(--accent); border-radius: 999px; padding: 6px 13px; cursor: pointer; }
  #notesToggle[aria-pressed="true"] { background: var(--accent); color: #fff; }
  #notesToggle:focus-visible, #heroCard:focus-visible, #backBtn:focus-visible, #exportBtn:focus-visible, #doneBtn:focus-visible {
    outline: 2px solid var(--accent); outline-offset: 2px; }

  /* ---- fixed-height stage; beats swap inside, page height never changes ---- */
  #stage { position: relative; height: 470px; }
  .beat { position: absolute; inset: 0; opacity: 0; visibility: hidden; transform: translateY(4px);
    transition: opacity 200ms ease, transform 200ms ease, visibility 0s 200ms; }
  #stage[data-beat="1"] .beat1, #stage[data-beat="2"] .beat2 { opacity: 1; visibility: visible; transform: none; transition: opacity 200ms ease, transform 200ms ease, visibility 0s; }
  #stage[data-beat="3"] .beat2 { opacity: 1; visibility: visible; transform: none; transition: opacity 200ms ease, transform 200ms ease, visibility 0s; }
  @media (prefers-reduced-motion: reduce) {
    .beat, .chain li, .chain li::after, .beat3, #scrim { transition: none !important; }
  }

  /* ---- beat 1: segment cards ---- */
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .segcard { background: #fff; border: 1px solid var(--border); border-radius: 16px; padding: 16px;
    box-shadow: 0 1px 2px rgba(22,29,36,.04); text-align: left; }
  .segcard h3 { font-size: 16px; font-weight: 500; letter-spacing: -0.008em; line-height: 1.25; margin: 10px 0 6px; }
  .segcard p { color: var(--muted); font-size: 13px; line-height: 1.45; }
  .chip { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500;
    letter-spacing: .04em; border-radius: 999px; padding: 4px 10px; }
  .chip.opp { background: var(--opp-bg); color: var(--opp-text); }
  .chip.risk { background: var(--risk-bg); color: var(--risk-text); }
  .stats { margin-top: 12px; font-size: 13px; color: var(--ink); }
  .stats .num { font-weight: 500; }
  #heroCard { font: inherit; color: inherit; cursor: pointer; border: 1px solid var(--border);
    transition: border-color 160ms ease, box-shadow 160ms ease; }
  #heroCard:hover { border-color: #C9CBD1; box-shadow: 0 1px 2px rgba(22,29,36,.05), 0 8px 20px rgba(22,29,36,.07); }
  .seewhy { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 13px; font-weight: 500; color: var(--teal-text); }

  /* ---- beat 2: provenance chain ---- */
  .recap { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  #backBtn { font: inherit; font-size: 13px; font-weight: 500; color: var(--muted); background: none; border: none;
    cursor: pointer; display: flex; align-items: center; gap: 5px; padding: 6px 8px; border-radius: 8px; }
  #backBtn:hover { background: #F2F2F7; color: var(--ink); }
  .recap h2 { font-size: 16px; font-weight: 500; }
  .chain { list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px; margin-top: 8px; }
  .chain li { position: relative; background: #fff; border: 1px solid var(--border); border-radius: 14px; padding: 14px; }
  .chain h3 { font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--teal-text); margin-bottom: 8px; }
  .chain p { font-size: 13px; line-height: 1.5; color: var(--ink); }
  .chain .big { font-size: 20px; font-weight: 500; letter-spacing: -0.01em; margin-bottom: 4px; }
  .chain li::after { content: ''; position: absolute; top: 50%; right: -17px; width: 12px; height: 2px;
    background: #9D9DA8; }
  .chain li:last-child::after { display: none; }
  /* draw-in: nodes reveal left-to-right once per entry (added by script) */
  .chain.veiled li { opacity: 0; transform: translateX(-6px); }
  .chain.drawn li { opacity: 1; transform: none; transition: opacity 260ms ease, transform 260ms ease; }
  .chain.drawn li:nth-child(2) { transition-delay: 140ms; }
  .chain.drawn li:nth-child(3) { transition-delay: 280ms; }
  .chain.drawn li:nth-child(4) { transition-delay: 420ms; }
  .honesty { margin-top: 14px; font-size: 12px; color: var(--muted); }
  #exportBtn { font: inherit; display: flex; justify-content: center; align-items: center; gap: 7px; width: 100%;
    margin-top: 12px; padding: 10px; border: none; border-radius: 999px; background: var(--teal); color: var(--ink);
    font-weight: 500; font-size: 13.5px; cursor: pointer; }

  /* ---- beat 3: export slide-over ---- */
  #scrim { position: absolute; inset: 0; background: rgba(22,29,36,.28); opacity: 0; visibility: hidden;
    transition: opacity 200ms ease, visibility 0s 200ms; border-radius: 0 0 16px 0; }
  #stage[data-beat="3"] #scrim { opacity: 1; visibility: visible; transition: opacity 200ms ease, visibility 0s; }
  .beat3 { position: absolute; top: 0; right: 0; bottom: 0; width: 372px; background: #fff;
    border: 1px solid var(--border); border-radius: 16px; padding: 20px; box-shadow: -12px 0 34px rgba(22,29,36,.12);
    opacity: 0; visibility: hidden; transform: translateX(14px);
    transition: opacity 200ms ease, transform 200ms ease, visibility 0s 200ms; }
  #stage[data-beat="3"] .beat3 { opacity: 1; visibility: visible; transform: none;
    transition: opacity 200ms ease, transform 200ms ease, visibility 0s; }
  .beat3 h2 { font-size: 17px; font-weight: 500; }
  .beat3 dl { margin-top: 14px; }
  .beat3 dt { font-size: 11px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-top: 12px; }
  .beat3 dd { font-size: 13.5px; line-height: 1.5; margin-top: 3px; }
  .beat3 .scopenote { margin-top: 16px; font-size: 12px; line-height: 1.5; color: var(--muted);
    border-top: 1px solid var(--border); padding-top: 12px; }
  #doneBtn { font: inherit; display: block; width: 100%; margin-top: 16px; padding: 10px; border: none;
    border-radius: 999px; background: var(--teal); color: var(--ink); font-weight: 500; font-size: 13.5px; cursor: pointer; }

  /* ---- step indicator ---- */
  #steps { position: absolute; left: 0; bottom: 0; display: flex; gap: 14px; font-size: 11.5px;
    font-weight: 500; letter-spacing: .06em; color: var(--muted); }
  #steps .step { display: flex; align-items: center; gap: 6px; }
  #steps .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--border); }
  #steps .step.on { color: var(--ink); }
  #steps .step.on .dot { background: var(--teal-text); }

  /* ---- design notes ---- */
  .notebadge { display: none; width: 18px; height: 18px; border-radius: 50%; background: var(--accent); color: #fff;
    font-size: 11px; font-weight: 500; line-height: 18px; text-align: center; flex: none; }
  body.notes-on .notebadge { display: inline-block; }
  #notesPanel { display: none; position: absolute; right: 0; bottom: -6px; width: 340px; background: #fff; border: 1px solid var(--accent);
    border-radius: 14px; padding: 14px 16px; box-shadow: 0 10px 30px rgba(22,29,36,.14); }
  body.notes-on #notesPanel { display: block; }
  #notesPanel ol { list-style: none; }
  #notesPanel li { display: flex; gap: 9px; font-size: 12.5px; line-height: 1.5; margin-top: 8px; }
  #notesPanel li:first-child { margin-top: 0; }

  .footnote { text-align: center; color: var(--muted); font-size: 11px; margin-top: 14px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
</head>
<body>
<div id="scaler">
<div id="frame">
  <aside class="sidebar">
    <p class="logotype"><span class="silvur">silvur</span><span class="partners">PARTNERS</span></p>
    <nav class="nav" aria-label="Dashboard sections">
      <span><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M2 6.5 7.5 2 13 6.5V13H2z"/></svg>Home</span>
      <span class="active"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M2.5 12.5v-4M7.5 12.5v-7M12.5 12.5v-10"/></svg>Campaign Segments<span class="notebadge" aria-hidden="true">1</span></span>
      <span class="sub">All Segments</span>
    </nav>
    <span class="spacer"></span>
    <nav class="nav" aria-label="Account">
      <span><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7.5" cy="7.5" r="5.5"/><path d="M7.5 5v3l2 1.5" stroke-linecap="round"/></svg>Support</span>
      <span><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7.5" cy="7.5" r="2.2"/><path d="M7.5 1.5v2M7.5 11.5v2M1.5 7.5h2M11.5 7.5h2M3.3 3.3l1.4 1.4M10.3 10.3l1.4 1.4M11.7 3.3l-1.4 1.4M4.7 10.3l-1.4 1.4" stroke-linecap="round"/></svg>Settings</span>
    </nav>
    <p class="account">
      <svg width="26" height="26" viewBox="0 0 30 30" fill="none" aria-hidden="true"><circle cx="15" cy="15" r="13.5" stroke="currentColor" stroke-width="2"/><rect x="9" y="15" width="3" height="7" rx="1" fill="currentColor"/><rect x="13.5" y="11" width="3" height="11" rx="1" fill="currentColor"/><rect x="18" y="8" width="3" height="14" rx="1" fill="currentColor"/></svg>
      <span>Marketing · Lanternbay CU</span>
    </p>
  </aside>

  <main class="main">
    <div class="mainhead">
      <h1>Campaign Segments</h1>
      <button id="notesToggle" aria-pressed="false">Design notes</button>
    </div>

    <div id="stage" data-beat="1">
      <!-- Beat 1 · Signal -->
      <section class="beat beat1" aria-label="Segments">
        <div class="cards">
          <button class="segcard" id="heroCard">
            <span class="chip risk"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M5 0 10 9H0z"/></svg>Top Risk<span class="notebadge" aria-hidden="true">1</span></span>
            <h3>Direct Deposit: Social Security</h3>
            <p>Members already collecting Social Security.</p>
            <p class="stats"><span class="num">1,651</span> members · <span class="num">~$23M/yr</span> benefit income identified</p>
            <span class="seewhy">See why<svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4-4 4"/></svg></span>
          </button>
          <div class="segcard">
            <span class="chip opp">Top Opportunity</span>
            <h3>Top Wealth Management Leads</h3>
            <p>Members 0–3 years from retirement with $1M+ in investable assets.</p>
            <p class="stats"><span class="num">597</span> members · <span class="num">$752M</span> investable assets</p>
          </div>
          <div class="segcard">
            <span class="chip opp">Top Opportunity</span>
            <h3>High Yield Savings Leads</h3>
            <p>Members holding cash savings earning little to no interest.</p>
            <p class="stats"><span class="num">2,146</span> members · <span class="num">$350M</span> in cash savings</p>
          </div>
        </div>
      </section>

      <!-- Beat 2 · Why -->
      <section class="beat beat2" aria-label="Why this segment matters">
        <div class="recap">
          <button id="backBtn"><svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 1 1 5l4 4"/></svg>All segments</button>
          <span class="chip risk"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M5 0 10 9H0z"/></svg>Top Risk</span>
          <h2>Direct Deposit: Social Security</h2>
        </div>
        <ol class="chain veiled">
          <li>
            <h3>What members did<span class="notebadge" aria-hidden="true">2</span></h3>
            <p>Ran the Social Security calculator, set or passed an election age, and entered benefit income in their Retirement Score.</p>
          </li>
          <li>
            <h3>What that means</h3>
            <p class="big">1,651 members</p>
            <p>are collecting — or about to start collecting — Social Security. ~$23M/yr in recurring benefit income identified.</p>
          </li>
          <li>
            <h3>Why Lanternbay cares</h3>
            <p>Recurring federal deposits anchor a primary-banking relationship — and Lanternbay can't see where those deposits land today. That's exactly why these members are worth a campaign.</p>
          </li>
          <li>
            <h3>What to do</h3>
            <p>A direct-deposit campaign to exactly these members.</p>
            <button id="exportBtn">Export for campaign<svg width="6" height="10" viewBox="0 0 6 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 1l4 4-4 4"/></svg></button>
          </li>
        </ol>
        <p class="honesty">Every signal is member activity on the platform.</p>
      </section>

      <!-- Beat 3 · Act -->
      <div id="scrim"></div>
      <section class="beat3" role="dialog" aria-modal="true" aria-labelledby="exportTitle">
        <h2 id="exportTitle">Export ready</h2>
        <dl>
          <dt>Audience</dt>
          <dd>1,651 members</dd>
          <dt>Fields<span class="notebadge" aria-hidden="true">3</span></dt>
          <dd>Member contact via your system of record, plus the segment reason: collecting Social Security, recurring benefit income identified.</dd>
          <dt>Destination</dt>
          <dd>Your existing email and direct-mail tools.</dd>
        </dl>
        <p class="scopenote">The platform's job ends at the audience — partners already have campaign tools. Scope was a design decision, not a limitation.</p>
        <button id="doneBtn">Done</button>
      </section>

      <div id="steps" aria-hidden="true">
        <span class="step on" data-step="1"><span class="dot"></span>Signal</span>
        <span class="step" data-step="2"><span class="dot"></span>Why</span>
        <span class="step" data-step="3"><span class="dot"></span>Act</span>
      </div>

      <aside id="notesPanel" aria-label="Design notes">
        <ol>
          <li><span class="notebadge" style="display:inline-block">1</span><span>Segments are framed as needs and recommended actions, not metrics — designed for marketers, not analysts.</span></li>
          <li><span class="notebadge" style="display:inline-block">2</span><span>Provenance is one click away, never buried — and every signal is member activity on the platform. The insight earns trust by showing its reasoning and never claiming data it can't see.</span></li>
          <li><span class="notebadge" style="display:inline-block">3</span><span>The workflow ends in the partner's existing tools — platform scope was a design decision, not a limitation.</span></li>
        </ol>
      </aside>
    </div>
  </main>
</div>
</div>

<p class="footnote">Credit union, members, and figures are fictional; segment logic is representative of the shipped product.</p>
<p id="live" class="sr-only" aria-live="polite"></p>
<script src="partner-dashboard-app-placeholder"></script>
</body>
</html>
```

Note: the placeholder script tag is replaced in Task 2.

- [ ] **Step 4: Run the content test**

Run: `node partner-dashboard.test.mjs`
Expected: PASS — `partner-dashboard content-integrity: all checks passed`.

- [ ] **Step 5: Static sanity check**

Run: `node -e "const h=require('fs').readFileSync('partner-dashboard.html','utf8'); console.log('bytes', h.length)"`
Expected: byte count printed. (The controller performs the visual check in the main session.)

- [ ] **Step 6: Commit**

```bash
git add partner-dashboard.html partner-dashboard.test.mjs
git commit -m "feat: partner-dashboard static artifact — three beats, sidebar, chain, export slide-over"
```

---

### Task 2: Interactivity — beat machine, chain draw, dialog, notes, scale-to-fit

**Files:**
- Modify: `partner-dashboard.html` (replace the placeholder script tag)
- Modify: `partner-dashboard.test.mjs` (append script invariants)

**Interfaces:**
- Consumes: all ids from Task 1.
- Produces: postMessage type string `partner-dashboard:height`; `#stage[data-beat]` as the single source of beat state.

- [ ] **Step 1: Append failing script-invariant checks**

Append to `partner-dashboard.test.mjs` (before the final `console.log`):

```js
// Script invariants (Task 2+).
assert.ok(html.includes('partner-dashboard:height'), 'height postMessage type');
assert.ok(html.includes('prefers-reduced-motion'), 'reduced-motion gate in script');
assert.ok(html.includes("addEventListener('keydown'"), 'keyboard handling (Esc / focus trap)');
```

Run: `node partner-dashboard.test.mjs` — expected FAIL on the postMessage assertion.

- [ ] **Step 2: Replace the placeholder script tag**

Replace `<script src="partner-dashboard-app-placeholder"></script>` with:

```html
<script>
(() => {
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), live = $('#live'), chain = $('.chain');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let lastFocus = null;

  const MESSAGES = {
    1: 'Showing all segments.',
    2: 'Why this segment matters: 1,651 members collecting Social Security, 23 million dollars a year in benefit income identified. Export available.',
    3: 'Export summary open: 1,651 members, contact fields plus segment reason, delivered to your existing tools.',
  };

  function setBeat(n) {
    stage.dataset.beat = String(n);
    for (const s of document.querySelectorAll('#steps .step')) s.classList.toggle('on', Number(s.dataset.step) <= n);
    live.textContent = MESSAGES[n];
    if (n === 2) drawChain();
    postHeight();
  }

  function drawChain() {
    // Story-serving motion: the member-action -> CU-benefit chain draws once per entry.
    chain.classList.remove('drawn');
    if (reduced.matches) { chain.classList.remove('veiled'); return; }
    chain.classList.add('veiled');
    requestAnimationFrame(() => requestAnimationFrame(() => chain.classList.add('drawn')));
  }

  $('#heroCard').addEventListener('click', () => { setBeat(2); $('#backBtn').focus(); });
  $('#backBtn').addEventListener('click', () => { setBeat(1); $('#heroCard').focus(); });
  $('#exportBtn').addEventListener('click', () => { lastFocus = document.activeElement; setBeat(3); $('#doneBtn').focus(); });
  $('#doneBtn').addEventListener('click', closeDialog);
  $('#scrim').addEventListener('click', closeDialog);
  function closeDialog() { setBeat(2); (lastFocus || $('#exportBtn')).focus(); }

  // Esc closes the dialog; Tab is trapped inside it while open.
  document.addEventListener('keydown', e => {
    if (stage.dataset.beat !== '3') return;
    if (e.key === 'Escape') { e.preventDefault(); return closeDialog(); }
    if (e.key !== 'Tab') return;
    const focusables = [...document.querySelector('.beat3').querySelectorAll('button')];
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  const notes = $('#notesToggle');
  notes.addEventListener('click', () => {
    const on = notes.getAttribute('aria-pressed') !== 'true';
    notes.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('notes-on', on);
  });

  // Fixed 980px frame scales down to fit narrow viewports (no bespoke mobile layout).
  const scaler = $('#scaler'), frame = $('#frame');
  function fit() {
    const avail = document.body.clientWidth;
    const s = Math.min(1, avail / 980);
    scaler.style.transform = `scale(${s})`;
    scaler.style.height = frame.offsetHeight * s + 'px';
    scaler.style.marginLeft = s < 1 ? '0' : '';
    postHeight();
  }

  function postHeight() {
    window.parent.postMessage({ type: 'partner-dashboard:height', height: document.documentElement.scrollHeight }, '*');
  }

  fit();
  postHeight(); // synchronous first post — rAF is throttled in offscreen iframes
  addEventListener('resize', () => requestAnimationFrame(fit));
})();
</script>
```

- [ ] **Step 3: Run the content test**

Run: `node partner-dashboard.test.mjs`
Expected: PASS.

- [ ] **Step 4: Static self-audit**

Verify every id the script queries exists in the markup (`#stage #live .chain #heroCard #backBtn #exportBtn #doneBtn #scrim #notesToggle #scaler #frame`, `#steps .step`, `.beat3 button`). Note any mismatch in the report — do not fix silently. (The controller runs the interactive browser checklist in the main session after this task: beat transitions, chain draw, Esc/focus trap, notes toggle, scale-to-fit, reduced motion.)

- [ ] **Step 5: Commit**

```bash
git add partner-dashboard.html partner-dashboard.test.mjs
git commit -m "feat: partner-dashboard interactivity — beat machine, chain draw, export dialog, notes, scale-to-fit"
```

---

### Task 3: Build integration + full suite

**Files:**
- Modify: `build.mjs` (append)

**Interfaces:**
- Consumes: the exact font link tag from Task 1.
- Produces: `dist/partner-dashboard.html`, fully self-contained.

- [ ] **Step 1: Append the inline step to `build.mjs`** (decision-web pattern — fonts only, no module import):

```js
// partner-dashboard is a single page with inline script — only the font link needs inlining.
const pd = fs.readFileSync('partner-dashboard.html', 'utf8')
  .replace('<link rel="stylesheet" href="fonts.css">', () => `<style>\n${fonts}</style>`);
if (pd.includes('href="fonts.css"')) throw new Error('partner-dashboard inline failed');
fs.writeFileSync('dist/partner-dashboard.html', pd);
console.log(`Wrote dist/partner-dashboard.html (${(pd.length / 1024).toFixed(0)} KB)`);
```

- [ ] **Step 2: Build and verify standalone**

Run: `node build.mjs`
Expected: five `Wrote dist/...` lines including `dist/partner-dashboard.html`.
Run: `node -e "const h=require('fs').readFileSync('dist/partner-dashboard.html','utf8'); if(h.includes('href=\"fonts.css\"')) throw new Error('not inlined'); if(!h.includes('@font-face')) throw new Error('no fonts'); console.log('dist standalone ok')"`

- [ ] **Step 3: Run all suites**

Run: `node --test brand-model.test.mjs && node brand-system.test.mjs && node partner-dashboard.test.mjs && node babytalk-question.test.mjs && node --test model.test.mjs`
Expected: everything passes.

- [ ] **Step 4: Commit**

```bash
git add build.mjs dist/partner-dashboard.html
git commit -m "build: inline partner-dashboard into dist"
```

---

### Task 4: Final QA (controller-executed)

**Files:** none — verification only, fixes as needed.

- [ ] **Step 1: Browser checklist on `dist/partner-dashboard.html`** (controller, main session):
1. Beat 1: three cards; only the hero looks clickable (hover lift + "See why"); other cards have no buttons.
2. Click hero: beat 2 morphs in (no flash); chain nodes reveal left-to-right once; step indicator advances to "Why".
3. "Export for campaign": slide-over enters from the right with scrim; focus lands on Done; Tab cycles inside the dialog; Esc closes back to beat 2 with focus restored.
4. "All segments" returns to beat 1; step indicator resets.
5. Design notes toggle: badges appear next to chips (1), chain heading (2), fields row (3); panel lists all three notes; toggle off clears.
6. Reduced motion (code-gated): beat swaps and chain reveal instant.
7. Narrow viewport: frame scales down proportionally, no horizontal scroll, height message posts.
8. Page height ≤ 850px at desktop.

- [ ] **Step 2: Chrome contrast audit**

```bash
node -e "
const { contrast } = await import('./brand-model.js');
const checks = [['#161D24','#FFFFFF','ink on white'],['#6E6E7D','#FFFFFF','muted on white/sidebar'],['#078375','#FFFFFF','teal text on white'],['#161D24','#0ABFAB','ink on teal buttons'],['#0B7D57','#E6F8F1','opportunity chip'],['#A65500','#FDEBC7','risk chip'],['#1C5C98','#FFFFFF','accent on white'],['#FFFFFF','#1C5C98','notes toggle pressed'],['#161D24','#F2F2F7','active nav on gray5'],['#6E6E7D','#F7F8FA','muted on canvas (footnote)']];
for (const [f,b,l] of checks) { const r = contrast(f,b); console.log(l, r.toFixed(2), r>=4.5?'AA':'FAIL'); if (r<4.5) process.exit(1); }
console.log('chrome audit: all AA');
" --input-type=module
```

Expected: every line `AA`. Fix colors (not thresholds) on failure.

- [ ] **Step 3: Screenshot proof** — Beat 2 with the chain fully drawn (the artifact's argument in one frame).

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix: partner-dashboard QA fixes"  # only if needed
```

---

## Self-Review Notes

- Spec coverage: Signal/Why/Act beats (T1 markup + T2 machine), provenance chain with platform-only signals + "can't see" framing (T1), export slide-over with no fake download (T1/T2), design-notes overlay with 3 callouts (T1/T2), anti-generic rules as test assertions (T1), fictional-only + no personal names (T1 test), fixed-height stage + step indicator (T1/T2), chain draw once as sanctioned motion + reduced-motion (T2), scale-to-fit transform below desktop (T2), height postMessage synchronous first (T2), build + dist (T3), contrast audit + browser QA + screenshot (T4), connective tissue via Lanternbay lockup glyph + account line (T1).
- Author-locked preferences carried over from the brand-system rounds: in-place morphs (no fade-to-blank), no empty reserved whitespace, DM Sans 500 max, #F7F8FA canvas, restrained motion with one story-serving exception.
- Known simplification: beats 2 and 3 share the stage (beat 2 stays visible under the dialog scrim) — intentional, mirrors real slide-over patterns.
