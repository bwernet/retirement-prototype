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
assert.ok(html.includes("The workflow ends in the partner's existing tools — platform scope was a design decision, not a limitation.") || html.includes("The workflow ends in the partner's existing tools — platform scope was a design decision, not a limitation."), 'design note 3');

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
assert.ok(/can't see where|can't see where/.test(html), 'chain states the platform cannot see deposit destinations');

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
