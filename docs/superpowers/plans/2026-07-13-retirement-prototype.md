# Retirement Income Interactive Prototype — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the static retirement-app marketing mockup as a pixel-faithful, fully interactive single-file HTML prototype where every stepper drives a live retirement simulation that updates the score bar, readout, and income chart.

**Architecture:** A pure-function simulation model (`model.js`, node-testable) feeds a DOM/SVG renderer (`app.js`) inside `index.html`. Cards are generated from a config array (DRY). A tiny build script inlines everything (model, app, base64 fonts) into one distributable `dist/retirement-prototype.html`.

**Tech Stack:** Vanilla JS (ES modules), hand-written CSS, SVG chart, `node --test` for model tests, `python3 -m http.server` for dev preview. No frameworks, no dependencies.

**Spec:** `docs/superpowers/specs/2026-07-13-retirement-prototype-design.md` — read it first.

## Global Constraints

- **Font:** DM Sans only, embedded as base64 woff2. **Only weights 400 and 500 exist in the file. Medium (500) is the strongest weight anywhere** — headings, big numbers, emphasis. Never write `font-weight: 600` or `bold`.
- **Fallback stack:** `'DM Sans', -apple-system, 'Helvetica Neue', sans-serif`.
- **Single-file deliverable:** `dist/retirement-prototype.html` must have zero external requests (fonts, scripts, styles all inlined). Dev files may be separate.
- **Chart integrity (from spec):** post-retirement, `withdrawal = min(spending − income, savings)` — the stacked bar never rises above the white spending line; pre-retirement bars may exceed it (salary surplus). Reducing spending must visibly extend the blue area rightward.
- **Timeline anchors:** user is age 62 in base year 2023 ("Today"); axis ends at age 95. All "in YYYY" sub-labels are *computed* from these anchors (the mockup's own year labels are internally inconsistent; computed values win).
- **Mockup copy is verbatim** where static — including the quirky "in per month" sub-label on Spending.
- **Color tokens** (single source of truth, defined once in `:root`):
  `--ink:#27356B; --ink-soft:#5A6B8C; --link:#3D6EDE; --chip-bg:#E9EDF3; --chip-ink:#6B7A99; --impact-bg:#E4F1FC; --impact-ink:#2D6FD3; --card-bg:#fff; --page-bg:#F7F8FA; --screen-top:#4F35C8; --screen-bottom:#372394; --bar-green:#29B57C; --bar-purple:#B3A0EE; --bar-blue:#35A8F0; --gold:#E0A33A; --pill-green:#17B890; --stroke:#E3E7EF;`

---

### Task 1: Simulation model with tests

**Files:**
- Create: `model.js`
- Test: `model.test.mjs`

**Interfaces:**
- Produces (used by app.js and build.mjs — names must match exactly):
  - `CONSTANTS` (object: `currentAge, endAge, baseYear, returnRate, inflation, userSalary, garySalary, garyRetiresAt, garySSAnnual, ssBaseMonthlyAt62, ssDelayBonusPerYear, medicareStartAge`)
  - `DEFAULT_INPUTS` (object: `retirementAge, monthlySpending, netWorth, addedIncomeMonthly, addedIncomeYears, ssElectionAge, medicareMonthly`)
  - `INPUT_LIMITS` (per input key: `{min, max, step}`)
  - `clampInput(key, value) -> number`
  - `simulate(inputs, c = CONSTANTS) -> { years: [{age, nonGuaranteed, guaranteed, withdrawal, spending, savings}], moneyLastsAge: number|null, ranOut: boolean }`
  - `formatAge(ageOrNull) -> "82y 5m" | "95y+"`
  - `formatMoney(n) -> "$1,093,293"`

- [ ] **Step 1: Write the failing tests**

`model.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { simulate, formatAge, formatMoney, clampInput, DEFAULT_INPUTS } from './model.js';

test('default scenario runs out roughly where the mockup says (~82)', () => {
  const { moneyLastsAge, ranOut } = simulate(DEFAULT_INPUTS);
  assert.equal(ranOut, true);
  assert.ok(moneyLastsAge > 79 && moneyLastsAge < 87, `got ${moneyLastsAge}`);
});

test('withdrawals never exceed the gap up to the spending line', () => {
  const { years } = simulate(DEFAULT_INPUTS);
  for (const y of years) {
    const gap = Math.max(0, y.spending - (y.nonGuaranteed + y.guaranteed));
    assert.ok(y.withdrawal <= gap + 1e-6, `age ${y.age}: withdrawal ${y.withdrawal} > gap ${gap}`);
  }
});

test('levers move the score in the believable direction', () => {
  const base = simulate(DEFAULT_INPUTS).moneyLastsAge;
  const withOverride = o => simulate({ ...DEFAULT_INPUTS, ...o }).moneyLastsAge ?? 95.01;
  assert.ok(withOverride({ monthlySpending: 5240 }) > base, 'spend less -> lasts longer');
  assert.ok(withOverride({ monthlySpending: 8000 }) < base, 'spend more -> runs out sooner');
  assert.ok(withOverride({ retirementAge: 66 }) > base, 'retire later -> lasts longer');
  assert.ok(withOverride({ addedIncomeMonthly: 2000 }) > base, 'more income -> lasts longer');
  assert.ok(withOverride({ netWorth: 1500000 }) > base, 'more savings -> lasts longer');
  assert.ok(withOverride({ ssElectionAge: 62 }) <= base, 'electing at 62 is worse than 67 (matches impact copy)');
});

test('reduced spending redistributes withdrawals to later years', () => {
  const lastWithdrawalAge = ys => Math.max(...ys.filter(y => y.withdrawal > 0).map(y => y.age));
  const a = simulate(DEFAULT_INPUTS).years;
  const b = simulate({ ...DEFAULT_INPUTS, monthlySpending: 5000 }).years;
  assert.ok(lastWithdrawalAge(b) > lastWithdrawalAge(a));
});

test('after money runs out, withdrawals are zero (clean cliff edge)', () => {
  const { years, moneyLastsAge } = simulate(DEFAULT_INPUTS);
  for (const y of years.filter(y => y.age > Math.ceil(moneyLastsAge))) {
    assert.equal(y.withdrawal, 0);
  }
});

test('formatters', () => {
  assert.equal(formatAge(82.42), '82y 5m');
  assert.equal(formatAge(83.999), '84y 0m');
  assert.equal(formatAge(null), '95y+');
  assert.equal(formatMoney(1093293), '$1,093,293');
});

test('clampInput respects limits', () => {
  assert.equal(clampInput('ssElectionAge', 75), 70);
  assert.equal(clampInput('ssElectionAge', 55), 62);
  assert.equal(clampInput('retirementAge', 50), 62);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test model.test.mjs`
Expected: FAIL — `Cannot find module ... model.js`

- [ ] **Step 3: Write the model**

`model.js`:

```js
// Plausible year-by-year retirement cash-flow model. Reactive, not advice-grade.

export const CONSTANTS = {
  currentAge: 62,           // "Today" on the score bar
  endAge: 95,
  baseYear: 2023,           // calendar year at currentAge (retire at 63 -> "in 2024")
  returnRate: 0.03,         // annual growth on savings
  inflation: 0.03,          // applied to spending + medicare
  userSalary: 84000,        // annual, while age < retirementAge (non-guaranteed)
  garySalary: 36000,        // spouse annual, while age < garyRetiresAt (non-guaranteed)
  garyRetiresAt: 68,        // on the user's age axis
  garySSAnnual: 12000,      // spouse guaranteed income from garyRetiresAt
  ssBaseMonthlyAt62: 1500,  // user Social Security if elected at 62
  ssDelayBonusPerYear: 0.075, // benefit increase per year of delay past 62
  medicareStartAge: 65,
};

export const DEFAULT_INPUTS = {
  retirementAge: 63,
  monthlySpending: 6240,
  netWorth: 1093293,
  addedIncomeMonthly: 1000,
  addedIncomeYears: 5,
  ssElectionAge: 67,
  medicareMonthly: 1093,
};

export const INPUT_LIMITS = {
  retirementAge:     { min: 62, max: 75, step: 1 },
  monthlySpending:   { min: 1000, max: 20000, step: 250 },
  netWorth:          { min: 0, max: 5000000, step: 50000 },
  addedIncomeMonthly:{ min: 0, max: 10000, step: 250 },
  addedIncomeYears:  { min: 0, max: 30, step: 1 },
  ssElectionAge:     { min: 62, max: 70, step: 1 },
  medicareMonthly:   { min: 0, max: 3000, step: 50 },
};

export function clampInput(key, value) {
  const { min, max } = INPUT_LIMITS[key];
  return Math.min(max, Math.max(min, value));
}

export function simulate(inputs, c = CONSTANTS) {
  const ssAnnual =
    12 * c.ssBaseMonthlyAt62 * (1 + c.ssDelayBonusPerYear * (inputs.ssElectionAge - 62));
  const years = [];
  let savings = inputs.netWorth;
  let moneyLastsAge = null; // null = money never runs out before endAge

  for (let age = c.currentAge; age <= c.endAge; age++) {
    const infl = Math.pow(1 + c.inflation, age - c.currentAge);
    const salary = age < inputs.retirementAge ? c.userSalary : 0;
    const gary = age < c.garyRetiresAt ? c.garySalary : 0;
    const added =
      age >= inputs.retirementAge && age < inputs.retirementAge + inputs.addedIncomeYears
        ? inputs.addedIncomeMonthly * 12 : 0;
    const ss = age >= inputs.ssElectionAge ? ssAnnual : 0;
    const garySS = age >= c.garyRetiresAt ? c.garySSAnnual : 0;

    const nonGuaranteed = salary + gary + added;
    const guaranteed = ss + garySS;
    const income = nonGuaranteed + guaranteed;
    const spending =
      (inputs.monthlySpending * 12 +
        (age >= c.medicareStartAge ? inputs.medicareMonthly * 12 : 0)) * infl;

    savings *= 1 + c.returnRate;
    let withdrawal = 0;
    if (moneyLastsAge === null) {
      const need = Math.max(0, spending - income);
      if (need <= savings) {
        withdrawal = need;                                  // fill the gap up to the spending line
        savings = savings - need + Math.max(0, income - spending); // surplus is saved
      } else {
        withdrawal = savings;                               // partial final year
        moneyLastsAge = age + (need > 0 ? savings / need : 0);
        savings = 0;
      }
    }
    years.push({ age, nonGuaranteed, guaranteed, withdrawal, spending, savings });
  }
  return { years, moneyLastsAge, ranOut: moneyLastsAge !== null };
}

export function formatAge(age) {
  if (age === null) return '95y+';
  let y = Math.floor(age);
  let m = Math.round((age - y) * 12);
  if (m === 12) { y += 1; m = 0; }
  return `${y}y ${m}m`;
}

export function formatMoney(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}
```

Note the final-year edge: `withdrawal = savings` in the run-out year is a *partial* withdrawal that may be less than the gap — the invariant test allows this since it's still `<= gap`.

- [ ] **Step 4: Run tests, tune constants until pass**

Run: `node --test model.test.mjs`
Expected: PASS. If the "~82" test fails, tune only these knobs and re-run: `ssBaseMonthlyAt62` (higher → lasts longer), `returnRate` (higher → longer), `inflation` (higher → shorter). Target `moneyLastsAge` ≈ 82.4 so the default readout reads like the mockup's "82y 5m". Print it with:
`node -e "import('./model.js').then(m => console.log(m.simulate(m.DEFAULT_INPUTS).moneyLastsAge))"`

- [ ] **Step 5: Commit**

```bash
git add model.js model.test.mjs
git commit -m "feat: retirement cash-flow model with invariant tests"
```

---

### Task 2: Embed DM Sans (400 + 500) as base64

**Files:**
- Create: `build-fonts.mjs`
- Create (generated): `fonts.css`

**Interfaces:**
- Produces: `fonts.css` containing exactly two `@font-face` rules (`DM Sans` 400 and 500) with `data:font/woff2;base64,` sources. Consumed by `index.html` (Task 3) via `<link rel="stylesheet" href="fonts.css">` and inlined by `build.mjs` (Task 6).

- [ ] **Step 1: Write the fetch-and-encode script**

`build-fonts.mjs`:

```js
// Fetches DM Sans 400 + 500 (latin) from Google Fonts and writes fonts.css
// with base64-embedded woff2 so the prototype is fully self-contained.
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const cssUrl = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap';
const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();
const blocks = css.split('@font-face').slice(1);

let out = '';
for (const weight of [400, 500]) {
  const candidates = blocks.filter(b => b.includes(`font-weight: ${weight}`));
  const block = candidates[candidates.length - 1]; // latin subset is listed last
  const url = block.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  out += `@font-face{font-family:'DM Sans';font-style:normal;font-weight:${weight};` +
         `src:url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');}\n`;
}
fs.writeFileSync('fonts.css', out);
console.log(`Wrote fonts.css (${out.length} bytes)`);
```

- [ ] **Step 2: Run it and verify output**

Run: `node build-fonts.mjs && grep -c '@font-face' fonts.css && grep -o 'font-weight:[0-9]*' fonts.css`
Expected: `Wrote fonts.css (...)`, count `2`, weights `400` and `500` only. File should be roughly 20–60 KB.
**If the network is unavailable:** write `fonts.css` containing only the comment `/* DM Sans unavailable offline — fallback stack in use */` so later tasks still work, flag it in the task report, and retry before Task 6.

- [ ] **Step 3: Commit**

```bash
git add build-fonts.mjs fonts.css
git commit -m "feat: embed DM Sans 400/500 as base64 fonts.css"
```

---

### Task 3: Static composition — page, cards, phone chrome

**Files:**
- Create: `index.html`
- Create: `app.js`

**Interfaces:**
- Consumes: `fonts.css` (Task 2); `model.js` exports `CONSTANTS, DEFAULT_INPUTS, formatMoney` (Task 1).
- Produces: DOM contract used by Task 4/5 — elements with ids `chart, note-retire, note-gary, score-retire, score-lasts, readout-retire, readout-lasts, rail-left, rail-right, sheet`; stepper buttons `.step[data-key][data-dir]`; value spans `[data-val="<key>"]` and `[data-sub="<key>"]`; `app.js` globals `state`, `RAILS`, `ROWCFG`, and function `updateInputs()`.

- [ ] **Step 1: Write `index.html`** (structure + all CSS)

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Retirement Income — Interactive Prototype</title>
<link rel="stylesheet" href="fonts.css">
<style>
:root{
  --font:'DM Sans',-apple-system,'Helvetica Neue',sans-serif;
  --ink:#27356B; --ink-soft:#5A6B8C; --link:#3D6EDE;
  --chip-bg:#E9EDF3; --chip-ink:#6B7A99;
  --impact-bg:#E4F1FC; --impact-ink:#2D6FD3;
  --card-bg:#fff; --page-bg:#F7F8FA;
  --screen-top:#4F35C8; --screen-bottom:#372394;
  --bar-green:#29B57C; --bar-purple:#B3A0EE; --bar-blue:#35A8F0;
  --gold:#E0A33A; --pill-green:#17B890; --stroke:#E3E7EF;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);font-weight:400;background:var(--page-bg);color:var(--ink);
  -webkit-font-smoothing:antialiased;}
.stage{display:grid;grid-template-columns:340px auto 340px;gap:44px;justify-content:center;
  align-items:start;padding:56px 32px;min-height:100vh;}
.rail{display:flex;flex-direction:column;gap:28px;}
.rail-left{margin-top:8px}.rail-right{margin-top:8px}

/* ---------- cards ---------- */
.card{background:var(--card-bg);border-radius:20px;padding:22px 22px 20px;
  box-shadow:0 10px 30px rgba(39,53,107,.10),0 2px 6px rgba(39,53,107,.05);}
.card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.card-title{font-size:21px;font-weight:500;}
.chip{background:var(--chip-bg);color:var(--chip-ink);font-size:12px;font-weight:500;
  padding:5px 12px;border-radius:999px;white-space:nowrap;}
.row{padding:2px 0}
.stepper-row{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;
  gap:12px;margin-bottom:14px;}
.row-label{font-size:15px;line-height:1.35;color:var(--ink);max-width:130px;}
.row-icon{display:inline-flex;vertical-align:-3px;margin-right:8px;}
.step{width:34px;height:34px;border-radius:50%;border:1.5px solid var(--link);background:none;
  color:var(--link);font-size:20px;line-height:1;cursor:pointer;font-family:var(--font);
  display:grid;place-items:center;transition:background .15s;}
.step:hover{background:rgba(61,110,222,.08)}
.step:active{background:rgba(61,110,222,.16)}
.val{text-align:center;min-width:72px;}
.val-big{display:block;font-size:24px;font-weight:500;}
.val-sub{display:block;font-size:13px;color:var(--ink-soft);margin-top:1px;}
.link-row{display:flex;align-items:center;justify-content:space-between;color:var(--link);
  font-size:16px;font-weight:500;padding:14px 0;border-top:1px solid var(--stroke);cursor:pointer;}
.link-row .chev{color:var(--ink-soft)}
.impact{display:flex;gap:8px;align-items:flex-start;border-top:1px solid var(--stroke);padding-top:14px;}
.impact-tag{background:var(--impact-bg);color:var(--impact-ink);font-size:11px;font-weight:500;
  letter-spacing:.03em;padding:3px 8px;border-radius:6px;white-space:nowrap;display:inline-flex;
  align-items:center;gap:4px;}
.impact-text{font-size:13.5px;line-height:1.45;color:var(--ink);}
.static-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px;}

/* ---------- phone ---------- */
.phone-wrap{display:flex;justify-content:center;}
.phone{width:392px;border-radius:60px;padding:5px;background:linear-gradient(180deg,#EDEDE8,#D9D9D2);
  box-shadow:0 30px 60px rgba(39,53,107,.25);}
.bezel{border-radius:56px;padding:11px;background:#0B0B0E;}
.screen{position:relative;border-radius:46px;overflow:hidden;height:800px;display:flex;
  flex-direction:column;background:linear-gradient(180deg,var(--screen-top),var(--screen-bottom));
  color:#fff;}
.status-bar{display:flex;align-items:center;justify-content:space-between;padding:16px 30px 6px;}
.status-bar .time{font-size:16px;font-weight:500;}
.island{position:absolute;top:14px;left:50%;transform:translateX(-50%);width:118px;height:34px;
  border-radius:20px;background:#000;}
.status-icons{display:flex;gap:6px;align-items:center;}
.screen-head{display:flex;align-items:center;justify-content:space-between;padding:18px 24px 4px;}
.screen-head h1{font-size:26px;font-weight:500;}
.expand{width:36px;height:36px;border-radius:50%;border:none;background:rgba(255,255,255,.18);
  color:#fff;cursor:pointer;display:grid;place-items:center;}
.legend{list-style:none;display:flex;gap:14px;padding:12px 24px 6px;font-size:12px;
  line-height:1.3;color:rgba(255,255,255,.92);}
.legend li{display:flex;gap:6px;align-items:flex-start;max-width:100px;}
.sw{width:12px;height:12px;border-radius:3px;flex:none;margin-top:1px;}
.sw-green{background:var(--bar-green)}.sw-purple{background:var(--bar-purple)}.sw-blue{background:var(--bar-blue)}
.chart-wrap{position:relative;padding:30px 24px 0;}
#chart{width:100%;height:190px;display:block;}
.bar{transition:y .25s ease-out,height .25s ease-out;}
.bar-green{fill:var(--bar-green)}.bar-purple{fill:var(--bar-purple)}.bar-blue{fill:var(--bar-blue)}
.spend-line{fill:none;stroke:#fff;stroke-width:2;}
.chart-note{position:absolute;transform:translateX(-50%);background:var(--gold);color:#fff;
  font-size:12px;font-weight:500;padding:4px 10px;border-radius:999px;white-space:nowrap;
  transition:left .25s ease-out;}
#note-retire{top:6px}
#note-gary{top:34px}
.chart-spend-label{position:absolute;right:28px;top:44px;font-size:13px;color:#fff;}
.score{padding:22px 24px 0;}
.score-track{position:relative;height:14px;border-radius:999px;
  background:linear-gradient(90deg,#CBD5F0 0%,#7B9BE8 35%,#35A8F0 65%,#EAF2FB 100%);}
.score-dot{position:absolute;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;
  border-radius:50%;color:#fff;font-weight:500;transition:left .25s ease-out;}
.score-dot-retire{width:34px;height:34px;background:var(--gold);font-size:14px;}
.score-dot-lasts{width:44px;height:44px;background:var(--pill-green);font-size:17px;
  box-shadow:0 4px 12px rgba(0,0,0,.25);}
.score-ends{display:flex;justify-content:space-between;font-size:14px;padding-top:14px;
  color:rgba(255,255,255,.95);}
.readout{display:flex;align-items:center;gap:8px;padding:18px 24px 0;font-size:16px;}
.pill{border-radius:999px;color:#fff;font-weight:500;}
.pill-gold{background:var(--gold);padding:5px 12px;}
.pill-green{background:var(--pill-green);padding:7px 16px;font-size:17px;}
.dots{display:flex;gap:7px;justify-content:center;padding:18px 0 0;}
.dots i{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.35);}
.dots i.on{background:#fff;}
.caption{padding:16px 28px 0;font-size:15px;line-height:1.5;color:rgba(255,255,255,.9);}
.sheet{margin-top:auto;background:#fff;border-radius:28px 28px 0 0;padding:10px 22px 26px;color:var(--ink);}
.sheet::before{content:'';display:block;width:44px;height:5px;border-radius:999px;
  background:#D7DCE6;margin:2px auto 14px;}
.sheet .card{box-shadow:none;padding:0;border-radius:0;}

/* ---------- responsive ---------- */
@media (max-width:1180px){
  .stage{grid-template-columns:minmax(0,440px);}
  .phone-wrap{order:0}
  .rail{order:1;margin-top:0}
}
</style>
</head>
<body>
<main class="stage">
  <div class="rail rail-left" id="rail-left"></div>
  <div class="phone-wrap">
    <div class="phone"><div class="bezel"><div class="screen">
      <div class="status-bar">
        <span class="time">9:41</span>
        <div class="island"></div>
        <span class="status-icons">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity=".4"/></svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="#fff"><path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM8 5c1.9 0 3.6.7 4.9 1.9l-1.4 1.5A5 5 0 008 7c-1.3 0-2.5.5-3.5 1.4L3.1 6.9A7 7 0 018 5zm0-5c3.3 0 6.3 1.3 8.5 3.4l-1.4 1.5A10 10 0 008 2 10 10 0 00.9 4.9L-.5 3.4A12 12 0 018 0z" transform="scale(.9)"/></svg>
          <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x=".5" y=".5" width="21" height="11" rx="3" stroke="#fff" opacity=".5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="#fff"/><path d="M23.5 4v4a2.2 2.2 0 000-4z" fill="#fff" opacity=".5"/></svg>
        </span>
      </div>
      <div class="screen-head">
        <h1>Retirement Income</h1>
        <button class="expand" aria-label="Expand">
          <svg width="15" height="15" viewBox="0 0 15 15" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M9 6l4.5-4.5M13.5 5V1.5H10M6 9l-4.5 4.5M1.5 10v3.5H5"/></svg>
        </button>
      </div>
      <ul class="legend">
        <li><i class="sw sw-green"></i>Non-guaranteed Income</li>
        <li><i class="sw sw-purple"></i>Guaranteed Income</li>
        <li><i class="sw sw-blue"></i>Withdrawals from Savings</li>
      </ul>
      <div class="chart-wrap">
        <svg id="chart" viewBox="0 0 344 160" preserveAspectRatio="none"></svg>
        <div class="chart-note" id="note-retire">You retire at 63</div>
        <div class="chart-note" id="note-gary">Gary retires at 68</div>
        <div class="chart-spend-label">Spending</div>
      </div>
      <div class="score">
        <div class="score-track">
          <span class="score-dot score-dot-retire" id="score-retire">63</span>
          <span class="score-dot score-dot-lasts" id="score-lasts">82</span>
        </div>
        <div class="score-ends"><span>Today</span><span>Age 95</span></div>
      </div>
      <div class="readout">
        Retire: <span class="pill pill-gold" id="readout-retire">63</span>
        <span>Money lasts until:</span>
        <span class="pill pill-green" id="readout-lasts">82y 5m</span>
      </div>
      <div class="dots"><i class="on"></i><i></i><i></i><i></i><i></i></div>
      <p class="caption">Retirement score doesn&rsquo;t only map changes in your net worth, it also considers your income sources over time.</p>
      <div class="sheet" id="sheet"></div>
    </div></div></div>
  </div>
  <div class="rail rail-right" id="rail-right"></div>
</main>
<script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `app.js`** (card config + builder; static values only in this task)

```js
import { simulate, formatAge, formatMoney, clampInput, CONSTANTS as C, DEFAULT_INPUTS, INPUT_LIMITS } from './model.js';

const state = { ...DEFAULT_INPUTS };

const ICONS = {
  calc: `<svg class="row-icon" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="1" width="14" height="16" rx="2" stroke="#27356B" stroke-width="1.4"/><rect x="4.5" y="3.5" width="9" height="3.5" rx="1" fill="#B3A0EE"/><circle cx="6" cy="10.5" r="1" fill="#27356B"/><circle cx="9" cy="10.5" r="1" fill="#27356B"/><circle cx="12" cy="10.5" r="1" fill="#27356B"/><circle cx="6" cy="13.5" r="1" fill="#27356B"/><circle cx="9" cy="13.5" r="1" fill="#27356B"/><circle cx="12" cy="13.5" r="1" fill="#27356B"/></svg>`,
  cross: `<svg class="row-icon" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="11" fill="#E5484D"/><path d="M9.2 5h3.6v4.2H17v3.6h-4.2V17H9.2v-4.2H5V9.2h4.2z" fill="#fff"/></svg>`,
};

const RAILS = {
  left: [
    { title: 'Retirement Date', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'retirementAge', label: 'You plan to retire at age:',
        fmt: v => v, sub: v => `in ${C.baseYear + v - C.currentAge}` },
      { type: 'impact', text: 'Average members add up to 3-4 years to their score each year they delay retirement.' },
    ]},
    { title: 'Spending', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'monthlySpending', label: 'Current spending',
        fmt: formatMoney, sub: () => 'in per month' },
      { type: 'link', text: 'Detailed spending' },
      { type: 'impact', text: 'Average members add up to 2-3 years to their score each $250 a month they reduce spending.' },
    ]},
    { title: 'Net Worth', rows: [
      { type: 'stepper', key: 'netWorth', label: 'Current net worth',
        fmt: formatMoney, sub: () => 'in 8 accounts' },
      { type: 'link', text: 'Edit accounts' },
    ]},
  ],
  right: [
    { title: 'Income', chip: 'High Impact', rows: [
      { type: 'stepper', key: 'addedIncomeMonthly', label: 'Add Income in Retirement',
        fmt: formatMoney, sub: () => 'per month' },
      { type: 'stepper', key: 'addedIncomeYears', label: 'You plan to make this for:',
        fmt: v => `${v} years`, sub: v => `until ${C.baseYear + (state.retirementAge - C.currentAge) + v}` },
      { type: 'link', text: 'Edit current income' },
      { type: 'impact', text: 'Average members can add up to 3-4 years to their score for each additional $1000/month of income in retirement.' },
    ]},
    { title: 'Social Security', rows: [
      { type: 'stepper', key: 'ssElectionAge', label: 'Your election age',
        fmt: v => v, sub: v => `in ${C.baseYear + v - C.currentAge}` },
      { type: 'link', text: 'Social Security Calculator', icon: 'calc' },
      { type: 'impact', text: 'The average member adds 1-2 years to their score by electing at 67 instead of 62.' },
    ]},
    { title: 'Healthcare', rows: [
      { type: 'stepper', key: 'medicareMonthly', label: 'Medicare Premiums', icon: 'cross',
        fmt: formatMoney, sub: () => `per month starting in ${C.baseYear + C.medicareStartAge - C.currentAge}` },
      { type: 'link', text: 'Medicare Calculator', icon: 'calc' },
    ]},
  ],
};
// The phone's bottom sheet mirrors the Retirement Date card (same key -> stays in sync).
const SHEET_CARD = { title: 'Retirement Date', chip: 'High Impact', rows: [RAILS.left[0].rows[0]] };

const ROWCFG = {}; // key -> stepper row config (for updateInputs)

function rowHTML(r) {
  if (r.type === 'stepper') {
    ROWCFG[r.key] = r;
    const icon = r.icon ? ICONS[r.icon] : '';
    return `<div class="row stepper-row">
      <div class="row-label">${icon}${r.label}</div>
      <button class="step" data-key="${r.key}" data-dir="-1" aria-label="decrease">&minus;</button>
      <div class="val"><span class="val-big" data-val="${r.key}"></span><span class="val-sub" data-sub="${r.key}"></span></div>
      <button class="step" data-key="${r.key}" data-dir="1" aria-label="increase">+</button>
    </div>`;
  }
  if (r.type === 'link') {
    const icon = r.icon ? ICONS[r.icon] : '';
    return `<div class="row link-row">${icon ? `<span>${icon}${r.text}</span>` : `<span>${r.text}</span>`}<span class="chev">&#8250;</span></div>`;
  }
  if (r.type === 'impact') {
    return `<div class="row impact">
      <span class="impact-tag"><svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#2D6FD3" stroke-width="1.5"><path d="M1 9L9 1M4 1h5v5"/></svg>IMPACT:</span>
      <span class="impact-text">${r.text}</span>
    </div>`;
  }
}

function cardHTML(card) {
  return `<section class="card">
    <div class="card-head"><h2 class="card-title">${card.title}</h2>${card.chip ? `<span class="chip">${card.chip}</span>` : ''}</div>
    ${card.rows.map(rowHTML).join('')}
  </section>`;
}

document.getElementById('rail-left').innerHTML = RAILS.left.map(cardHTML).join('');
document.getElementById('rail-right').innerHTML = RAILS.right.map(cardHTML).join('');
document.getElementById('sheet').innerHTML = cardHTML(SHEET_CARD);

function updateInputs() {
  for (const [key, row] of Object.entries(ROWCFG)) {
    document.querySelectorAll(`[data-val="${key}"]`).forEach(el => { el.textContent = row.fmt(state[key]); });
    document.querySelectorAll(`[data-sub="${key}"]`).forEach(el => { el.textContent = row.sub(state[key]); });
  }
}
updateInputs();
```

- [ ] **Step 3: View in browser and verify the static composition**

Run: `python3 -m http.server 8000` (background), then open `http://localhost:8000` in the browser pane and screenshot.
Checklist against the mockup image:
- Three-column layout: 3 cards left, phone center, 3 cards right; no hand.
- Phone chrome: silver frame, black bezel, Dynamic Island, 9:41 + status icons.
- Every card shows its exact copy, High Impact chips, IMPACT callouts, blue link rows with chevrons, red-cross Medicare icon.
- All values render (63 / $6,240 / $1,093,293 / $1,000 / 5 years / 67 / $1,093) with correct computed sub-labels (in 2024, until 2029, in 2028, starting in 2026).
- DM Sans renders; NOTHING is heavier than Medium — inspect a heading in devtools, `font-weight` must be 500.
- Chart area is empty (Task 4) — that's expected.

- [ ] **Step 4: Commit**

```bash
git add index.html app.js
git commit -m "feat: static composition — cards, phone chrome, iOS styling"
```

---

### Task 4: Live chart, score bar, and readout from the model

**Files:**
- Modify: `app.js` (append below `updateInputs()`; replace the final `updateInputs();` line with the render code ending in `renderAll();`)

**Interfaces:**
- Consumes: `simulate(state)`, `formatAge`, DOM ids from Task 3.
- Produces: `renderAll()` — called by Task 5 on every input change. `initChart()` builds 34 bar-groups once; `updateChart(sim)`, `updateScore(sim)` mutate attributes only (so CSS transitions animate them).

- [ ] **Step 1: Append chart + score rendering to `app.js`**

```js
/* ---------- live rendering ---------- */
const SVGNS = 'http://www.w3.org/2000/svg';
const AGES = Array.from({ length: C.endAge - C.currentAge + 1 }, (_, i) => C.currentAge + i);
const CH = { w: 344, h: 160, top: 12 };
let chartBars, spendLine;

function initChart() {
  const svg = document.getElementById('chart');
  const bw = CH.w / AGES.length;
  chartBars = AGES.map((_, i) => {
    const g = {};
    for (const part of ['green', 'purple', 'blue']) {
      const r = document.createElementNS(SVGNS, 'rect');
      r.setAttribute('x', (i * bw + 1).toFixed(2));
      r.setAttribute('width', (bw - 2).toFixed(2));
      r.setAttribute('y', CH.h); r.setAttribute('height', 0);
      r.setAttribute('class', `bar bar-${part}`);
      svg.appendChild(r); g[part] = r;
    }
    return g;
  });
  spendLine = document.createElementNS(SVGNS, 'polyline');
  spendLine.setAttribute('class', 'spend-line');
  svg.appendChild(spendLine); // appended last so the white line renders on top
}

function agePct(age) {
  return ((age - C.currentAge) / (C.endAge - C.currentAge)) * 100;
}

function positionNote(id, age, text) {
  const el = document.getElementById(id);
  el.textContent = text;
  const pct = Math.min(Math.max(agePct(age + 0.5), 10), 90) / 100; // clamp inside chart
  el.style.left = `${24 + pct * document.getElementById('chart').clientWidth}px`; // 24 = chart-wrap side padding
}

function updateChart(sim) {
  const yMax = Math.max(...sim.years.map(y =>
    Math.max(y.spending, y.nonGuaranteed + y.guaranteed + y.withdrawal))) * 1.06;
  const yPix = v => CH.h - (v / yMax) * (CH.h - CH.top);
  sim.years.forEach((y, i) => {
    let acc = 0;
    for (const [part, val] of [['green', y.nonGuaranteed], ['purple', y.guaranteed], ['blue', y.withdrawal]]) {
      const yTop = yPix(acc + val), yBot = yPix(acc);
      chartBars[i][part].setAttribute('y', yTop.toFixed(2));
      chartBars[i][part].setAttribute('height', Math.max(0, yBot - yTop).toFixed(2));
      acc += val;
    }
  });
  const bw = CH.w / AGES.length;
  spendLine.setAttribute('points',
    sim.years.map((y, i) => `${((i + 0.5) * bw).toFixed(2)},${yPix(y.spending).toFixed(2)}`).join(' '));
  positionNote('note-retire', state.retirementAge, `You retire at ${state.retirementAge}`);
  positionNote('note-gary', C.garyRetiresAt, `Gary retires at ${C.garyRetiresAt}`);
}

function updateScore(sim) {
  const lasts = sim.moneyLastsAge ?? C.endAge;
  const retireDot = document.getElementById('score-retire');
  const lastsDot = document.getElementById('score-lasts');
  retireDot.style.left = `${agePct(state.retirementAge)}%`;
  retireDot.textContent = state.retirementAge;
  lastsDot.style.left = `${agePct(lasts)}%`;
  lastsDot.textContent = Math.floor(lasts);
  document.getElementById('readout-retire').textContent = state.retirementAge;
  document.getElementById('readout-lasts').textContent = formatAge(sim.moneyLastsAge);
}

function renderAll() {
  updateInputs();
  const sim = simulate(state);
  updateChart(sim);
  updateScore(sim);
}

initChart();
renderAll();
```

Note: Score dots keep `transform: translate(-50%,-50%)` from CSS, so `left:%` centers them correctly; chart notes keep `transform: translateX(-50%)`.

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:8000`, screenshot, and check:
- Bars: tall green pre-retirement (salaries above the spending line), then green shrinks; purple appears at SS election / Gary's retirement; blue withdrawals fill exactly up to the white spending line; after ~82 only short purple bars remain (clean cliff).
- White spending line renders on top of the bars and slopes upward.
- Gold "You retire at 63" and "Gary retires at 68" pills sit above the correct bars.
- Score bar: gold 63 dot near left, green dot at ~82; readout says "Retire: 63" and "Money lasts until: 82y ..m".
- Console has zero errors.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: live chart, score bar, and readout rendered from simulation"
```

---

### Task 5: Interactivity, motion, responsive

**Files:**
- Modify: `app.js` (append at end)
- Modify: `index.html` (responsive/media-query refinement only if needed)

**Interfaces:**
- Consumes: `renderAll()`, `clampInput`, `INPUT_LIMITS`, `.step[data-key][data-dir]` buttons.

- [ ] **Step 1: Append event wiring to `app.js`**

```js
/* ---------- interactivity ---------- */
document.body.addEventListener('click', e => {
  const btn = e.target.closest('.step');
  if (!btn) return;
  const key = btn.dataset.key;
  const next = clampInput(key, state[key] + Number(btn.dataset.dir) * INPUT_LIMITS[key].step);
  if (next === state[key]) return;
  state[key] = next;
  renderAll();
});
window.addEventListener('resize', () => renderAll()); // keeps pixel-positioned chart notes aligned
```

- [ ] **Step 2: Verify every lever in the browser (the core acceptance test)**

Drive each stepper and confirm all three surfaces move together, animated (~250ms), in the believable direction:

| Action | Expected |
|---|---|
| Spending − (×4, to $5,240) | Blue bars get SHORTER but extend FURTHER RIGHT; green "money lasts" dot slides right; readout year increases. Withdrawals never poke above the white line. |
| Spending + back up | Everything returns; symmetric. |
| Retirement age + | Green salary bars extend right; "You retire at N" pill slides right; both dots move right; money lasts longer. |
| Retirement age − to 62 | Minimum enforced (button becomes a no-op, no error). |
| Income +$250/mo, years + | Green post-retirement bars grow; score improves. |
| SS election 67→62 | Purple starts earlier but shorter; money lasts slightly less (matches impact copy). |
| Net worth +$50k | Score improves; chart shape unchanged pre-retirement. |
| Medicare + | Spending line steps up at 65; score worsens. |
| Extreme: spending $1,000 | Money never runs out → readout "95y+", green dot pinned at right end. No console errors. |
| Sheet stepper (phone bottom) | Changing retirement age in the phone's bottom sheet updates the LEFT card too (shared state). |

Also: narrow the browser window below 1180px — cards stack under the phone, nothing overflows, phone stays centered.

- [ ] **Step 3: Commit**

```bash
git add app.js index.html
git commit -m "feat: stepper wiring, animated transitions, responsive stacking"
```

---

### Task 6: Single-file build + end-to-end verification

**Files:**
- Create: `build.mjs`
- Create (generated): `dist/retirement-prototype.html`

**Interfaces:**
- Consumes: `index.html`, `app.js`, `model.js`, `fonts.css`. The replacements below depend on these EXACT strings existing: `<link rel="stylesheet" href="fonts.css">`, `<script type="module" src="app.js"></script>`, and app.js's first line `import { simulate, formatAge, formatMoney, clampInput, CONSTANTS as C, DEFAULT_INPUTS, INPUT_LIMITS } from './model.js';`.

- [ ] **Step 1: Write `build.mjs`**

```js
// Inlines fonts, model, and app into a single self-contained HTML file.
import fs from 'node:fs';

const html = fs.readFileSync('index.html', 'utf8');
const fonts = fs.readFileSync('fonts.css', 'utf8');
const model = fs.readFileSync('model.js', 'utf8').replace(/^export /gm, '');
const app = fs.readFileSync('app.js', 'utf8');

const IMPORT_LINE = `import { simulate, formatAge, formatMoney, clampInput, CONSTANTS as C, DEFAULT_INPUTS, INPUT_LIMITS } from './model.js';`;
if (!app.includes(IMPORT_LINE)) throw new Error('app.js import line drifted — update build.mjs');

const inlinedApp = app.replace(IMPORT_LINE, model + '\nconst C = CONSTANTS;');
let out = html
  .replace('<link rel="stylesheet" href="fonts.css">', `<style>\n${fonts}</style>`)
  .replace('<script type="module" src="app.js"></script>', `<script type="module">\n${inlinedApp}</script>`);

if (out.includes('href="fonts.css"') || out.includes('src="app.js"')) throw new Error('inline failed');
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/retirement-prototype.html', out);
console.log(`Wrote dist/retirement-prototype.html (${(out.length / 1024).toFixed(0)} KB)`);
```

- [ ] **Step 2: Build and verify self-containment**

Run: `node build.mjs && grep -cE 'src="|href="' dist/retirement-prototype.html`
Expected: build message; grep count `0` (no external references).

- [ ] **Step 3: Verify the built file in the browser**

Open `http://localhost:8000/dist/retirement-prototype.html`. Repeat the Task 5 spot-checks (at minimum: spending down → blue redistributes right; retirement age up → dots move; "95y+" extreme). Confirm DM Sans still renders (devtools → computed font-family) and console is clean.

- [ ] **Step 4: Run the full model test suite one last time**

Run: `node --test model.test.mjs`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add build.mjs dist/retirement-prototype.html
git commit -m "feat: single-file build of the retirement prototype"
```

---

## Post-plan (main session, not a task)

After Task 6, the main session publishes `dist/retirement-prototype.html` as a shareable Artifact (favicon 📊) and does a final side-by-side visual pass against the mockup image, fixing any styling drift directly.
