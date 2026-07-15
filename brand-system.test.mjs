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
for (const name of ['Harborlight Credit Union', 'Sunwise Credit Union', 'Ember Valley Credit Union']) {
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
