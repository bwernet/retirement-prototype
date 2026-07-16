// Content-integrity checks for the partner-dashboard artifact (author-revised
// structure 2026-07-16: faithful product frame + story rail outside the UI).
// Guards honesty rules: exact copy, fictional names only, platform-only
// provenance, product/explanation separation hooks, font discipline, a11y.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('partner-dashboard.html', 'utf8');

// Exact copy — outside-the-frame narration (story rail + notes + footnote).
assert.ok(html.includes('Credit union, members, and figures are fictional; segment logic is representative of the shipped product.'), 'disclosure footnote');
assert.ok(/can't see where those deposits land/.test(html), 'story rail keeps the platform-cannot-see honesty line');
for (const b of ['1 · Signal', '2 · Why', '3 · Act']) assert.ok(html.includes(b), `story beat: ${b}`);

// Product-voice copy inside the frame (faithful to the shipped dashboard).
for (const s of ['Campaign Segments', 'All Segments', 'Date Range', 'Filters', 'Export Data',
  'Top Wealth Management Leads', 'Direct Deposit: Social Security', 'High Yield Savings Leads',
  'Top Risk', 'Top Opportunity', 'Nearing Retirement: $1M+', 'Nearing Retirement: $500K–$1M',
  'Nearing Retirement: $251–$500K', 'Just Retired: $1M+', '109 New!', 'Wealth Management',
  'Source: member activity on the platform.', 'Recommended campaign', 'Direct-deposit switch',
  'Questions about this export? Contact your Silvur relationship manager.']) {
  assert.ok(html.includes(s), `product copy: ${s}`);
}

// Synthetic figures (fixed).
for (const n of ['597', '$752M', '1,651', '$23M', '2,146', '$350M', '590', '146', '$110M', '114', '$43M', '$363M', '1,455', '1,204', '87']) {
  assert.ok(html.includes(n), `figure: ${n}`);
}

// Fictional-only; forbidden names/marks absent.
assert.ok(html.includes('Marketing Team'), 'account row (no personal names)');
assert.ok(html.includes('marketing@lanternbaycu.org'), 'fictional team email');
assert.ok(html.includes('Lanternbay'), 'connective-tissue CU');
assert.equal(/NCUA|Equal Housing|Retire Strong|ICCU|MSUFCU|Idaho Central|Olivia/i.test(html), false, 'no regulator marks / real brands / personal names');
// Capital-F Federal = a name/mark (forbidden); lowercase prose would be legitimate.
assert.equal(/\bFederal\b/.test(html), false, 'no capital-F Federal (names/marks)');

// Honesty limits: no fake downloads, no invented charts.
assert.equal(/\bdownload\b|\.csv/i.test(html), false, 'no fake file download');
assert.equal(/<canvas|sparkline|chart/i.test(html), false, 'no charts');

// Palette discipline (pre-validated pairs; gray3/gray4 never as text).
for (const hex of ['#F7F8FA', '#161D24', '#6E6E7D', '#E2E2E5', '#0ABFAB', '#078375', '#0B7D57', '#E6F8F1', '#A65500', '#FDEBC7', '#A81E63', '#FBE7F3']) {
  assert.ok(html.includes(hex), `palette value ${hex}`);
}
assert.equal(/color:\s*#9D9DA8|color:\s*#E2E2E5/i.test(html), false, 'gray3/gray4 must not be text');

// Font discipline: DM Sans only, 500 max, headings pinned (browser default is 700).
assert.ok(html.includes("'DM Sans'"), 'DM Sans family');
assert.equal(/font-weight:\s*([6-9]\d\d|bold\b)/.test(html), false, 'no weights above 500');
assert.equal(/<(b|strong)[\s>]/i.test(html), false, 'no b/strong');
assert.equal(/Georgia|Times|serif(?!-)/i.test(html.replace(/sans-serif/g, '')), false, 'no serif');
assert.ok(/\.tablehead h2\s*{[^}]*font-weight:\s*500/.test(html), 'table h2 pinned to 500');
assert.ok(/\.detailhead h2\s*{[^}]*font-weight:\s*500/.test(html), 'detail h2 pinned to 500');
assert.ok(/\.exportPanel h2\s*{[^}]*font-weight:\s*500/.test(html), 'dialog h2 pinned to 500');
assert.ok(/\.segcard h3\s*{[^}]*font-weight:\s*500/.test(html), 'card h3 pinned to 500');
assert.ok(/\.panel h3\s*{[^}]*font-weight:\s*500/.test(html), 'panel h3 pinned to 500');

// No emoji.
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'no emoji');

// Structure + a11y hooks (product/explanation separation depends on these).
for (const hook of ['id="screens"', 'data-screen="home"', 'id="heroCard"', 'id="backBtn"', 'id="doneBtn"',
  'id="scrim"', 'id="storyRail"', 'class="storybeat"', 'id="storyCaption"',
  'id="exportSeg"', 'id="exportLeads"', 'id="live"', 'aria-live="polite"', 'id="scaler"', 'id="frame"',
  'role="dialog"', 'aria-modal="true"']) {
  assert.ok(html.includes(hook), `missing hook ${hook}`);
}
assert.ok(html.includes('<link rel="stylesheet" href="fonts.css">'), 'font link (build replaces this exact tag)');

// Script invariants.
assert.ok(html.includes('partner-dashboard:height'), 'height postMessage type');
assert.ok(html.includes('reduced.matches'), 'reduced-motion gate in script (matchMedia check)');
assert.ok(html.includes("addEventListener('keydown'"), 'keyboard handling (Esc / focus trap)');
console.log('partner-dashboard content-integrity: all checks passed');
