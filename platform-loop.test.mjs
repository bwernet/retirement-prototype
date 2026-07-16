// Content-integrity checks for the platform-loop orientation artifact.
// Guards the author's verbatim copy, the serif-voice scoping, font discipline,
// fictional-only rules, and the behavior hooks.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('platform-loop.html', 'utf8');

// Stage phrases — exact.
for (const s of ['Trusted credit-union relationship', 'Branded retirement experience',
  'Members explore financial decisions', 'Credit union sees needs and responds']) {
  assert.ok(html.includes(s), `stage phrase: ${s}`);
}
for (const t of ['>Trust<', '>Experience<', '>Insight<', '>Action<']) {
  assert.ok(html.includes(t), `stage tag: ${t}`);
}

// Supporting points — exact (quote keeps its typographic quotation marks).
assert.ok(html.includes('“This is an incredible value to get through my credit union.”'), 'trust quote verbatim');
assert.ok(html.includes('Members received holistic retirement guidance through an institution they already knew.'), 'experience point');
assert.ok(html.includes('On-platform activity revealed topics and decisions traditional credit-union systems could not see.'), 'insight point');
assert.ok(html.includes('Teams could turn those signals into campaign audiences and relevant outreach.'), 'action point');

// Caption — exact.
assert.ok(html.includes('The platform created a feedback loop between trusted guidance and timely member support.'), 'caption');

// Fictional-only; forbidden marks absent.
assert.equal(/NCUA|Equal Housing|Retire Strong|ICCU|MSUFCU|Idaho Central|Olivia/i.test(html), false, 'no regulator marks / real brands / personal names');
assert.equal(/\bFederal\b/.test(html), false, 'no capital-F Federal');

// Font discipline: DM Sans, 500 max; serif only via the one .serifvoice class.
assert.ok(html.includes("'DM Sans'"), 'DM Sans family');
assert.equal(/font-weight:\s*([6-9]\d\d|bold\b)/.test(html), false, 'no weights above 500');
assert.equal(/<(b|strong|h[1-6])[\s>]/i.test(html), false, 'no b/strong/heading elements (nothing to pin at 700)');
assert.equal((html.match(/Georgia/g) || []).length, 1, 'serif defined once (.serifvoice)');
assert.ok(/\.serifvoice\s*{[^}]*Georgia/.test(html), 'serif scoped to .serifvoice');

// Palette discipline: gray3/gray4 never as text (connector strokes are decorative).
assert.equal(/color:\s*#E2E2E5/i.test(html), false, 'gray4 must not be text');
assert.ok(/\.down[\s\S]{0,80}color:\s*#9D9DA8/.test(html) || html.includes('#9D9DA8'), 'gray3 used only for connector graphics');
assert.equal(/(#reveal|\.caption|\.stage|\.tag|\.phrase)[^}]*color:\s*#9D9DA8/.test(html), false, 'gray3 not used for reading text');

// No emoji.
assert.equal(/\p{Extended_Pictographic}/u.test(html), false, 'no emoji');

// Hooks + behavior.
for (const hook of ['id="loop"', 'data-stage="trust"', 'data-stage="experience"', 'data-stage="insight"',
  'data-stage="action"', 'id="reveal"', 'aria-live="polite"', 'id="returnArrow"']) {
  assert.ok(html.includes(hook), `missing hook ${hook}`);
}
assert.ok(html.includes('<link rel="stylesheet" href="fonts.css">'), 'font link (build replaces this exact tag)');
assert.ok(html.includes('platform-loop:height'), 'height postMessage type');
assert.ok(html.includes('reduced.matches'), 'reduced-motion gate in script');
console.log('platform-loop content-integrity: all checks passed');
