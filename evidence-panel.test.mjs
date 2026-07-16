// Content-integrity checks for the compact research evidence panel.
// Guards the author's copy, the serif-voice scoping, font/palette discipline,
// and the publish gate: placeholder data must be resolved before this ships.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('evidence-panel.html', 'utf8');

// Headline statistic — exact.
assert.ok(html.includes('66.6%'), 'headline stat');
assert.ok(html.includes('became more aware of services available through their credit union'), 'stat description');

// Member quotes — verbatim, typographic quotation marks included.
assert.ok(html.includes('“This is an unexpected bonus of being a member.”'), 'quote 1 verbatim');
assert.ok(html.includes('“This is an incredible value to get through my credit union.”'), 'quote 2 verbatim');

// Bar chart — labels exact, single series, one hue.
assert.ok(html.includes('Top requested guidance'), 'chart label');
for (const c of ['Tax planning', 'Healthcare', 'Estate planning', 'Social Security']) {
  assert.ok(html.includes(c), `category: ${c}`);
}
assert.ok(html.includes('Methodology:'), 'methodology note present');

// Fictional-only; forbidden marks absent.
assert.equal(/NCUA|Equal Housing|Retire Strong|ICCU|MSUFCU|Idaho Central|Olivia/i.test(html), false, 'no regulator marks / real brands / personal names');
assert.equal(/\bFederal\b/.test(html), false, 'no capital-F Federal');

// Font discipline: DM Sans, 500 max; serif only via the one .serifvoice class.
assert.ok(html.includes("'DM Sans'"), 'DM Sans family');
assert.equal(/font-weight:\s*([6-9]\d\d|bold\b)/.test(html), false, 'no weights above 500');
assert.equal(/<(b|strong|h[1-6])[\s>]/i.test(html), false, 'no b/strong/heading elements');
assert.equal((html.match(/Georgia/g) || []).length, 1, 'serif defined once (.serifvoice)');
assert.ok(/\.serifvoice\s*{[^}]*Georgia/.test(html), 'serif scoped to .serifvoice');

// Palette discipline: bar fill is the 3:1-passing deep teal; grays never as text.
assert.ok(html.includes('#078375'), 'bar hue is the AA-graphics teal');
assert.equal(/color:\s*#9D9DA8|color:\s*#E2E2E5/i.test(html), false, 'gray3/gray4 must not be text');

// No emoji; no charts machinery beyond the bars (keep it simple).
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'no emoji');
assert.equal(/<canvas|tooltip|legend/i.test(html), false, 'no chart machinery — static panel');

// Behavior hooks.
assert.ok(html.includes('<link rel="stylesheet" href="fonts.css">'), 'font link (build replaces this exact tag)');
assert.ok(html.includes('evidence-panel:height'), 'height postMessage type');
console.log('evidence-panel content-integrity: all checks passed');
console.log('PUBLISH GATE: bar widths + methodology are placeholders until the author supplies real values.');
